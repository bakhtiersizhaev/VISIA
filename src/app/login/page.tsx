import { login, signup, signInWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wand2 } from 'lucide-react'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <div className="absolute inset-0 bg-[url('https://v3b.fal.media/files/b/0a850fb3/5i6PM3Sea9hCFz7_ntvJF_a2ff27ad91484781a093fd79a4cd0daa.png')] bg-cover bg-center opacity-10 blur-3xl" />

            <Card className="z-10 w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                        <Wand2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={signInWithGoogle}>
                        <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10" type="submit">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Sign in with Google
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        {searchParams?.error && (
                            <div className="text-sm text-destructive text-center">
                                {searchParams.error}
                            </div>
                        )}
                        {searchParams?.message && (
                            <div className="text-sm text-green-500 text-center">
                                {searchParams.message}
                            </div>
                        )}
                        <div className="flex flex-col gap-4 pt-2">
                            <Button
                                formAction={login}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                            >
                                Sign In
                            </Button>
                            <Button
                                formAction={signup}
                                variant="outline"
                                className="w-full border-white/10 bg-transparent hover:bg-white/5"
                            >
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
