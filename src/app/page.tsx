'use client';

import * as React from 'react';
import {Wand2, Sparkles, Shield, Zap, ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {createClient} from '@/lib/supabase/client';
import {User} from '@supabase/supabase-js';
import Link from 'next/link';
import {GeneratorUI} from '@/components/generator-ui';

export default function Home() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    const init = async () => {
      const {data} = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    void init();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Sparkles className="text-primary h-8 w-8 animate-bounce" />
      </div>
    );
  }

  // If authenticated, show the App Shell / Generator
  if (user) {
    return <GeneratorUI user={user} />;
  }

  // Otherwise, show Landing Page
  return (
    <main className="text-foreground relative min-h-screen overflow-hidden bg-black">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.45)]">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">VISIA</p>
              <p className="text-muted-foreground text-xs">
                Visual intelligence studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="#features"
              className="text-muted-foreground text-sm transition hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground text-sm transition hover:text-white"
            >
              How it works
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Login
            </Link>
            <Link href="/login">
              <Button className="group inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 font-semibold">
                Get started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-4 py-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="text-primary inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="h-3 w-3" />
              AI Visual Studio
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Create premium visuals from text and references
            </h1>
            <p className="text-muted-foreground text-lg">
              VISIA - generative design studio: pick models, add examples, get
              images and history in one place.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button className="group inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-base font-semibold">
                  Get started
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link
                href="#how-it-works"
                className="text-muted-foreground inline-flex items-center gap-2 text-sm font-semibold transition hover:text-white"
              >
                See how it works
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="from-primary/20 absolute -inset-4 rounded-3xl bg-gradient-to-br to-blue-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Quick preview
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                  Live
                </span>
              </div>
              <div className="mt-4 flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-black/70">
                <p className="text-muted-foreground/50">Generative Output</p>
              </div>
            </div>
          </div>
        </div>

        <div id="features" className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Production-ready',
              desc: 'We keep generations tied to account and billing-ready.',
              icon: Shield,
            },
            {
              title: 'Smart mode selection',
              desc: 'If references exist use edit model, otherwise base.',
              icon: Sparkles,
            },
            {
              title: 'Clear visualization',
              desc: 'Preview in-app and download in one click.',
              icon: Zap,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-white/25"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-lg font-semibold text-white">{item.title}</p>
              <p className="text-muted-foreground mt-2 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div
          id="how-it-works"
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <Link href="/login">
              <Button variant="outline" className="gap-2">
                Try now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              'Sign in and connect your account.',
              'Add prompt and references if needed.',
              'Run generation, preview, and download.',
            ].map((step, idx) => (
              <div
                key={idx}
                className="text-muted-foreground rounded-2xl border border-white/10 bg-black/40 p-4 text-sm"
              >
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  {idx + 1}
                </div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
