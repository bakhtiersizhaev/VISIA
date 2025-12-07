'use client';

import * as React from 'react';
import { Play, Sparkles, Zap, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = React.useState<User | null>(null);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    void checkUser();
  }, [supabase]);

  return (
    <main className="animated-bg relative min-h-screen overflow-hidden text-white">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 w-full px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl transition-transform hover:scale-105">
              <Image
                src="/logo-header-mini.png"
                alt="VISIA"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              VISIA
            </span>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/generate">
                <Button className="h-10 rounded-full bg-white px-6 font-semibold text-black transition-all hover:scale-105 hover:bg-white/90">
                  Open Studio
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
                >
                  Log in
                </Link>
                <Link href="/login">
                  <Button className="h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 hover:shadow-purple-500/40">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-20 text-center lg:py-32">
        {/* Mascot with glow */}
        <div className="relative animate-float">
          <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-purple-500/20 blur-[80px]" />
          <Image
            src="/logo-cat.png"
            alt="VISIA Cat Artist"
            width={320}
            height={320}
            className="relative h-56 w-56 object-contain drop-shadow-2xl sm:h-72 sm:w-72 lg:h-80 lg:w-80"
            priority
          />
        </div>

        {/* Headline */}
        <div className="space-y-6">
          <h1 className="text-5xl font-black leading-none tracking-tighter sm:text-7xl lg:text-8xl">
            <span className="text-white">DREAM IT.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              GENERATE IT.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-white/60 sm:text-xl">
            Your imagination, unleashed by AI. Create stunning visuals in
            seconds with the most advanced image generation platform.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href={user ? '/generate' : '/login'}>
            <Button className="h-14 rounded-full bg-white px-10 text-lg font-bold text-black shadow-2xl shadow-white/10 transition-all hover:scale-105 hover:bg-white/90">
              {user ? 'Open Studio' : 'Start Creating Free'}
            </Button>
          </Link>
          <p className="text-sm text-white/40">No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="glass-strong group relative overflow-hidden rounded-3xl p-6 transition-all hover:-translate-y-1 hover:border-white/10">
            <div className="mb-4 h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 to-blue-900/50">
              <Image
                src="/bg-styles.png"
                alt="Styles"
                width={600}
                height={400}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <h3 className="text-xl font-bold text-white">Unlimited Styles</h3>
            <p className="mt-1 text-sm text-white/50">
              From photorealism to abstract art, any style you can imagine.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-strong group relative overflow-hidden rounded-3xl p-6 transition-all hover:-translate-y-1 hover:border-white/10">
            <div className="mb-4 h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 to-cyan-900/50">
              <Image
                src="/bg-tools.png"
                alt="Tools"
                width={600}
                height={400}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <h3 className="text-xl font-bold text-white">Creative Tools</h3>
            <p className="mt-1 text-sm text-white/50">
              Remix, upscale, and expand your visions with powerful tools.
            </p>
          </div>

          {/* Card 3 - CTA */}
          <div className="glass-strong group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl p-8 text-center transition-all hover:-translate-y-1 hover:border-white/10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30">
              <Play className="h-7 w-7 fill-white text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Start for Free</h3>
            <p className="mt-1 text-sm text-white/50">
              Join thousands of creators already using VISIA.
            </p>
            <Link href={user ? '/generate' : '/login'} className="mt-4">
              <Button className="rounded-full bg-white px-6 font-bold text-black transition-transform hover:scale-105">
                {user ? 'Open Studio' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t-0 py-8 text-center">
        <p className="text-sm text-white/30">
          © {new Date().getFullYear()} VISIA AI. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
