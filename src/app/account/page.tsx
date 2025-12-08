/* eslint-disable @next/next/no-img-element */
'use client';

import {useEffect, useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {HistoryItem} from '@/components/history-sheet';
import Link from 'next/link';
import {
  appShell,
  appContainer,
  glassCard,
  subtleText,
  sectionSpacing,
} from '@/components/layout/theme';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {Download, ZoomIn} from 'lucide-react';

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {data} = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = '/login';
        return;
      }
      setEmail(data.user.email ?? null);
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email || '',
      });
      const balanceRes = await supabase
        .from('users')
        .select('token_balance')
        .eq('id', data.user.id)
        .maybeSingle();
      if (!balanceRes.error && balanceRes.data) {
        setBalance(balanceRes.data.token_balance);
      }
      const historyRes = await fetch('/api/history');
      if (historyRes.ok) {
        const json = await historyRes.json();
        if (json.history) setHistory(json.history.slice(0, 10));
      }
      setLoading(false);
    };
    void load();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <main className={`${appShell} ${sectionSpacing}`}>
      <div className={`${appContainer} flex flex-col gap-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Account</h1>
            <p className={subtleText}>
              Profile, balance, and recent generations.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="text-muted-foreground rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Back to app
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-muted-foreground text-sm">Email</div>
              <div className="text-base font-medium">{email ?? '-'}</div>
            </CardContent>
          </Card>

          <Card className={glassCard}>
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
              <CardDescription>Current available tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-white">
                {balance ?? '...'}
              </div>
              <div className="flex gap-3">
                <Button disabled>Top up (soon)</Button>
                <Button variant="outline" disabled>
                  Transactions (stub)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={glassCard}>
          <CardHeader>
            <CardTitle>Recent generations</CardTitle>
            <CardDescription>Last 10 entries from history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No history yet
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span className="text-foreground/80 font-mono">
                        {item.modelId}
                      </span>
                    </div>
                    <div className="text-foreground mt-1 text-sm">
                      {item.prompt}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        className="relative h-12 w-12 overflow-hidden rounded-md border border-white/10 bg-black/30"
                        onClick={() => {
                          setPreviewSrc(item.url);
                          setPreviewOpen(true);
                        }}
                        aria-label="Open preview"
                      >
                        <img
                          src={item.url}
                          alt={item.prompt}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
                          <ZoomIn className="h-4 w-4 text-white" />
                        </div>
                      </button>
                      <div className="text-muted-foreground flex flex-col text-xs">
                        <button
                          type="button"
                          className="text-primary flex items-center gap-1 hover:underline"
                          onClick={() => {
                            setPreviewSrc(item.url);
                            setPreviewOpen(true);
                          }}
                        >
                          <ZoomIn className="h-3 w-3" />
                          Preview
                        </button>
                        <button
                          type="button"
                          className="text-primary flex items-center gap-1 hover:underline"
                          onClick={async () => {
                            const response = await fetch(item.url);
                            const blob = await response.blob();
                            const objectUrl = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = objectUrl;
                            link.download = 'image.png';
                            link.click();
                            URL.revokeObjectURL(objectUrl);
                          }}
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl border border-white/10 bg-black/90">
          {previewSrc && (
            <img
              src={previewSrc}
              alt="Preview"
              className="h-full max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
