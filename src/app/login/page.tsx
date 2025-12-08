import { login, signup, signInWithGoogle } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; error: string };
}) {
  return (
    <div className="animated-bg bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px]" />
      </div>

      <div className="z-10 w-full max-w-md">
        {/* Logo above card */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl transition-transform hover:scale-105">
              <Image
                src="/logo-header-mini.png"
                alt="VISIA"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">VISIA</span>
          </Link>
        </div>

        <Card className="glass-strong border-white/10 p-2 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
            <CardDescription className="text-white/50">
              Sign in to continue creating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={signInWithGoogle}>
              <Button
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 hover:text-white"
                type="submit"
              >
                <svg
                  className="mr-2 h-4 w-4 opacity-70"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Sign in with Google
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#050505] px-2 text-white/30">
                  Or continue with email
                </span>
              </div>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/70">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              {searchParams?.error && (
                <div className="text-center text-sm text-red-400">
                  {searchParams.error}
                </div>
              )}
              {searchParams?.message && (
                <div className="text-center text-sm text-green-400">
                  {searchParams.message}
                </div>
              )}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  formAction={login}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] hover:shadow-purple-500/40"
                >
                  Sign In
                </Button>
                <Button
                  formAction={signup}
                  variant="ghost"
                  className="w-full text-white/50 hover:bg-white/5 hover:text-white"
                >
                  Don&apos;t have an account? Sign Up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
