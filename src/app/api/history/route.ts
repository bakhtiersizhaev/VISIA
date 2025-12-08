import {NextResponse} from 'next/server';
import {createServerClient, type CookieOptions} from '@supabase/ssr';

type HistoryPayload = {
  imageUrl: string;
  prompt: string;
  modelId: string;
  timestamp?: number;
};

function getSupabase(req: Request) {
  let responseCookies: {name: string; value: string; options: CookieOptions} | null =
    null;
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

export async function GET(request: Request) {
  const {supabase} = getSupabase(request);
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {data, error} = await supabase
    .from('history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false})
    .limit(50);

  if (error) {
    return NextResponse.json({error: 'Failed to load history'}, {status: 500});
  }

  return NextResponse.json({
    history: data.map((item) => ({
      id: item.id,
      url: item.image_url,
      prompt: item.prompt,
      modelId: item.model_id,
      timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
    })),
  });
}

export async function POST(request: Request) {
  const {supabase} = getSupabase(request);
  const payload = (await request.json().catch(() => null)) as
    | HistoryPayload
    | {items?: HistoryPayload[]}
    | null;

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const items: HistoryPayload[] = Array.isArray((payload as {items?: HistoryPayload[]})?.items)
    ? ((payload as {items?: HistoryPayload[]}).items ?? [])
    : payload && 'imageUrl' in payload
      ? [payload as HistoryPayload]
      : [];

  if (items.length === 0) {
    return NextResponse.json({error: 'Invalid payload'}, {status: 400});
  }

  const rows = items.map((item) => ({
    user_id: user.id,
    image_url: item.imageUrl,
    prompt: item.prompt,
    model_id: item.modelId,
    created_at: item.timestamp
      ? new Date(item.timestamp).toISOString()
      : undefined,
  }));

  const {error} = await supabase.from('history').insert(rows);

  if (error) {
    return NextResponse.json({error: 'Failed to save history'}, {status: 500});
  }

  return NextResponse.json({ok: true});
}
