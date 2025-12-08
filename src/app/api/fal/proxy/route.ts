import {route} from '@fal-ai/server-proxy/nextjs';
import {NextResponse, type NextRequest} from 'next/server';
import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {AI_MODELS} from '@/lib/models';

const USD_PER_TOKEN = 0.01;
type ResponseCookie = {name: string; value: string; options: CookieOptions};

async function getSupabase(req: Request) {
  let responseCookies: ResponseCookie | null = null;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.headers
            .get('cookie')
            ?.split('; ')
            .find((c) => c.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name: string, value: string, options: CookieOptions) {
          responseCookies = {name, value, options};
        },
        remove(name: string, options: CookieOptions) {
          responseCookies = {name, value: '', options};
        },
      },
    }
  );
  return {supabase, responseCookies};
}

type FalRequestBody = {
  model?: string;
  input?: Record<string, unknown>;
};

function estimateCostTokens(body: FalRequestBody | null): number {
  const modelId: string | undefined = body?.model;
  const input = (body?.input ?? {}) as Record<string, unknown>;
  const numImages =
    typeof input.num_images === 'number' ? Math.max(1, input.num_images) : 1;

  const model = AI_MODELS.find((m) => m.id === modelId || m.editId === modelId);
  if (!model?.basePriceUsd) return 1;

  const estimate = ((model.basePriceUsd * 1.2) / USD_PER_TOKEN) * numImages;
  return Math.max(1, Math.ceil(estimate));
}

export async function POST(request: Request) {
  const cloned = request.clone();
  const body = await cloned.json().catch(() => null);

  const {supabase, responseCookies} = await getSupabase(request);
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const cost = estimateCostTokens(body);
  const {data: userRow, error} = await supabase
    .from('users')
    .select('token_balance')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({error: 'Failed to load balance'}, {status: 500});
  }

  const balance =
    userRow?.token_balance === null || userRow?.token_balance === undefined
      ? 100
      : userRow.token_balance;

  if (balance < cost) {
    return NextResponse.json({error: 'Insufficient tokens'}, {status: 402});
  }

  await supabase
    .from('users')
    .update({token_balance: balance - cost})
    .eq('id', user.id);

  const res = await route.POST(request as unknown as NextRequest);

  if (!res.ok) {
    // Refund on failure
    await supabase
      .from('users')
      .update({token_balance: balance})
      .eq('id', user.id);
  }

  if (responseCookies) {
    const {name, value, options} = responseCookies as ResponseCookie;
    const response = NextResponse.next();
    response.cookies.set({
      name,
      value,
      ...options,
    });
  }

  return res;
}

export const GET = route.GET;
