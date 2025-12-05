'use client';

import * as React from 'react';
import { fal } from '@fal-ai/client';
import {
  Wand2,
  Loader2,
  Download,
  ZoomIn,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { AI_MODELS, ModelConfig } from '@/lib/models';
import { ModelSelector } from '@/components/model-selector';
import { PromptInput } from '@/components/prompt-input';
import { HistorySheet, HistoryItem } from '@/components/history-sheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type InputValue = string | number | string[] | File | File[] | null | undefined;
type FalImage = { url: string };
type FalResponse = { images?: FalImage[]; data?: { images?: FalImage[] } };
type FalQueueUpdate = { status?: string; logs?: { message?: string | null | undefined }[] };

const USD_PER_TOKEN = 0.01;

fal.config({ proxyUrl: '/api/fal/proxy' });

export default function Home() {
  const [selectedModel, setSelectedModel] = React.useState<ModelConfig>(AI_MODELS[0]);
  const [inputValues, setInputValues] = React.useState<Record<string, InputValue>>({});
  const [image, setImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [tokenBalance, setTokenBalance] = React.useState<number | null>(null);
  const supabase = React.useMemo(() => createClient(), []);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const addReferences = React.useCallback(
    (files: File[]) => {
      if (!files.length) return;
      const current = Array.isArray(inputValues['image_urls'])
        ? (inputValues['image_urls'] as InputValue[])
        : inputValues['image_urls']
        ? [inputValues['image_urls']]
        : inputValues['image_url']
        ? [inputValues['image_url']]
        : [];
      handleInputChange('image_urls', [...current, ...files]);
    },
    [inputValues]
  );

  const getTokenCost = () => {
    if (!selectedModel.basePriceUsd || USD_PER_TOKEN <= 0) return null;
    return Number(((selectedModel.basePriceUsd * 1.2) / USD_PER_TOKEN).toFixed(2));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  React.useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUser(data.user);
      await supabase.from('users').upsert({ id: data.user.id, email: data.user.email || '' });
      const balanceRes = await supabase
        .from('users')
        .select('token_balance')
        .eq('id', data.user.id)
        .maybeSingle();
      if (!balanceRes.error && balanceRes.data) setTokenBalance(balanceRes.data.token_balance);
      const historyRes = await supabase
        .from('history')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });
      if (!historyRes.error && historyRes.data) {
        setHistory(
          historyRes.data.map((item) => ({
            id: item.id,
            url: item.image_url,
            prompt: item.prompt,
            modelId: item.model_id,
            timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
          }))
        );
      }
    };
    void init();
  }, [supabase]);

  // Hidden file input for references
  React.useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);
    fileInputRef.current = input;

    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files ? Array.from(target.files) : [];
      addReferences(files);
      target.value = '';
    };
    input.addEventListener('change', handleChange);

    return () => {
      input.removeEventListener('change', handleChange);
      document.body.removeChild(input);
      fileInputRef.current = null;
    };
  }, [addReferences]);

  // Paste handler for images
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) addReferences(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addReferences]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      const startTime = Date.now();
      setElapsedTime(0);
      interval = setInterval(() => setElapsedTime((Date.now() - startTime) / 1000), 50);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const addToHistory = async (url: string, prompt: string, modelId: string) => {
    if (!user) return;
    const newItem: HistoryItem = { id: Date.now().toString(), url, prompt, modelId, timestamp: Date.now() };
    setHistory((prev) => [newItem, ...prev]);
    await supabase.from('history').insert({ user_id: user.id, image_url: url, prompt, model_id: modelId });
  };

  const clearHistory = async () => {
    if (user) await supabase.from('history').delete().eq('user_id', user.id);
    setHistory([]);
  };

  React.useEffect(() => {
    setInputValues((prev) => {
      const next: Record<string, InputValue> = {};
      selectedModel.inputParams?.forEach((param) => {
        let carry: InputValue | undefined = prev[param.name];
        if (carry === undefined && param.name === 'image_urls' && prev['image_url'] !== undefined) {
          const src = prev['image_url'];
          carry = Array.isArray(src) ? src : src ? [src] : [];
        }
        if (carry === undefined && param.name === 'image_url' && prev['image_urls'] !== undefined) {
          const src = prev['image_urls'];
          if (Array.isArray(src) && src.length > 0) carry = src[0];
        }
        if (carry !== undefined) next[param.name] = carry;
        else if (param.default !== undefined) next[param.name] = param.default;
        else next[param.name] = '';
      });
      return next;
    });
  }, [selectedModel]);

  const handleInputChange = (name: string, value: InputValue) => setInputValues((prev) => ({ ...prev, [name]: value }));

  const openPreview = (url: string) => {
    setPreviewSrc(url);
    setPreviewOpen(true);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'image.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const generateImage = async () => {
    const promptValue = inputValues['prompt'];
    if (typeof promptValue !== 'string' || !promptValue.trim()) return;
    const prompt = promptValue.trim();
    const hasRef = Boolean(inputValues['image_url']) || (Array.isArray(inputValues['image_urls']) && inputValues['image_urls'].length > 0);
    const modelIdToUse = selectedModel.editId && hasRef ? selectedModel.editId : selectedModel.id;

    const uploadReferences = async () => {
      const uploads: Record<string, string | string[] | undefined> = {};
      const single = inputValues['image_url'];
      if (single instanceof File) uploads.image_url = await fal.storage.upload(single);
      else if (typeof single === 'string' && single) uploads.image_url = single;
      const multi = inputValues['image_urls'];
      if (Array.isArray(multi)) {
        const urls: string[] = [];
        for (const item of multi) {
          if (item instanceof File) urls.push(await fal.storage.upload(item));
          else if (typeof item === 'string' && item) urls.push(item);
        }
        if (urls.length) uploads.image_urls = urls;
      }
      return uploads;
    };

    setLoading(true);
    setError(null);
    setImage(null);
    setLogs([]);

    try {
      const uploadedRefs = await uploadReferences();
      const inputPayload: Record<string, InputValue> = { ...inputValues, ...uploadedRefs };
      if (modelIdToUse.includes('/edit')) {
        delete inputPayload.num_images;
        delete inputPayload.resolution;
      } else {
        delete inputPayload.image_url;
        delete inputPayload.image_urls;
      }

      const result = await fal.subscribe(modelIdToUse, {
        input: { ...inputPayload },
        logs: true,
        onQueueUpdate: (update: FalQueueUpdate) => {
          if (update.status === 'IN_PROGRESS' && update.logs && update.logs.length) {
            const newLogs = update.logs.map((l) => l.message).filter((msg): msg is string => Boolean(msg));
            if (newLogs.length) setLogs((prev) => [...prev, ...newLogs]);
          }
        },
      });

      const parsed = result as FalResponse;
      if (parsed.images && parsed.images.length > 0) {
        const imageUrl = parsed.images[0].url;
        setImage(imageUrl);
        await addToHistory(imageUrl, prompt, modelIdToUse);
      } else if (parsed.data && parsed.data.images && parsed.data.images.length > 0) {
        const imageUrl = parsed.data.images[0].url;
        setImage(imageUrl);
        await addToHistory(imageUrl, prompt, modelIdToUse);
      }
    } catch (err: unknown) {
      type FalError = { message?: string; body?: unknown };
      const falError = err as FalError;
      let errorMessage = falError.message || 'Failed to generate image';
      if (falError.body) {
        try {
          const body = typeof falError.body === 'string' ? JSON.parse(falError.body) : falError.body;
          if ((body as { detail?: unknown }).detail) {
            const detail = (body as { detail?: unknown }).detail;
            errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
          } else if ((body as { message?: unknown }).message) {
            const msg = (body as { message?: unknown }).message;
            errorMessage = typeof msg === 'string' ? msg : JSON.stringify(msg);
          }
        } catch (e) {
          errorMessage = String(falError.body);
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = Boolean(user);
  const paramList = selectedModel.inputParams || [];
  const referenceParams = paramList.filter((p) => p.name === 'image_url' || p.name === 'image_urls');
  const controlParams = paramList.filter((p) => p.name !== 'prompt' && p.name !== 'image_url' && p.name !== 'image_urls');

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_20px_rgba(239,68,68,0.45)]">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight">VISIA</p>
              <p className="text-xs text-muted-foreground">Visual intelligence studio</p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <HistorySheet history={history} onClear={clearHistory} />
              <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/90">
                {tokenBalance ?? '...'} tokens
              </div>
              <Link
                href="/account"
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-muted-foreground transition hover:border-white/30 hover:text-white hover:bg-white/5"
              >
                Account
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="#features" className="text-sm text-muted-foreground transition hover:text-white">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground transition hover:text-white">
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
          )}
        </div>
      </header>

      {isAuthenticated ? (
        <div className="relative z-10 flex h-[calc(100vh-72px)] flex-col">
          <div className="flex-1 px-3 py-4 md:px-6">
            <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">VISIA STUDIO</p>
                <h1 className="mt-2 text-4xl font-bold text-white">Create premium visuals</h1>
                <p className="mt-1 text-sm text-muted-foreground">Text or references - we pick the right model automatically</p>
              </div>

              <div className="relative flex h-[55vh] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0c] p-4">
                {loading ? (
                  <div className="z-10 flex max-w-md w-full flex-col items-center gap-4 px-4 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
                      <div className="relative h-14 w-14 rounded-full border-4 border-t-transparent border-primary animate-spin shadow-[0_0_12px_rgba(239,68,68,0.45)]" />
                    </div>
                    <p className="text-base font-medium text-foreground animate-pulse">Creating...</p>
                    <p className="font-mono text-xs text-muted-foreground">{elapsedTime.toFixed(1)}s</p>
                    {logs.length > 0 && (
                      <div className="mt-2 w-full rounded-md border border-white/10 bg-black/60 p-2 text-left text-[11px] font-mono text-muted-foreground">
                        {logs.slice(-3).map((log, i) => (
                          <div key={i} className="line-clamp-1">&gt; {log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : image ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="absolute right-4 top-4 z-20 flex gap-2">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-sm transition hover:bg-black/85"
                        onClick={() => openPreview(image)}
                        aria-label="Open preview"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white text-black shadow-sm transition hover:bg-white/90"
                        aria-label="Download image"
                        onClick={() => handleDownload(image)}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                    <img
                      src={image}
                      alt={inputValues['prompt'] as string}
                      className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="z-10 flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="rounded-full border border-white/15 bg-secondary/30 p-5 shadow-inner">
                      <Wand2 className="h-8 w-8 opacity-70" />
                    </div>
                    <p className="text-lg text-white/85">Your result will appear here</p>
                    <p className="text-sm">Add text or a reference and click "Generate".</p>
                  </div>
                )}

                {error && (
                  <div className="absolute bottom-4 z-20 max-w-[90%] rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-destructive backdrop-blur-md">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto fixed inset-x-0 bottom-4 px-3">
            <div className="relative mx-auto flex max-w-4xl items-center gap-3 rounded-[18px] border border-white/10 bg-[#0b0b0b]/95 px-3 py-3 shadow-[0_12px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl md:px-4 overflow-visible">
              {referenceParams.length > 0 && (
                <div className="absolute -left-6 top-3 z-30">
                  <button
                    type="button"
                    aria-label="Add references"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/80 text-sm font-semibold text-white transition hover:border-white/40"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    +
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      if (!files.length) return;
                      const current = Array.isArray(inputValues['image_urls'])
                        ? (inputValues['image_urls'] as InputValue[])
                        : inputValues['image_urls']
                        ? [inputValues['image_urls']]
                        : inputValues['image_url']
                        ? [inputValues['image_url']]
                        : [];
                      handleInputChange('image_urls', [...current, ...files]);
                      e.target.value = '';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <PromptInput
                      value={inputValues['prompt'] || ''}
                      onChange={(val) => handleInputChange('prompt', val)}
                      onSubmit={generateImage}
                      loading={loading}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="min-w-[140px]">
                        <ModelSelector selectedModel={selectedModel} onSelect={setSelectedModel} />
                      </div>
                      {controlParams.map((param) => (
                        <div key={param.name} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px]">
                          <span className="text-muted-foreground">{param.label}</span>
                          {param.type === 'select' ? (
                            <Select
                              value={String(inputValues[param.name] || param.default || '')}
                              onValueChange={(val) => handleInputChange(param.name, val)}
                            >
                              <SelectTrigger className="h-8 w-18 border-white/10 bg-black/40 text-foreground text-[11px]">
                                <SelectValue placeholder={param.label} />
                              </SelectTrigger>
                              <SelectContent>
                                {param.options?.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <input
                              type={param.type}
                              className="h-8 w-12 rounded-md border border-white/10 bg-black/40 px-2 text-[11px] text-foreground"
                              value={inputValues[param.name] || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                const parsed = param.type === 'number' ? (value === '' ? '' : Number(value)) : value;
                                handleInputChange(param.name, parsed);
                              }}
                            />
                          )}
                        </div>
                      ))}
                      <HistorySheet history={history} onClear={clearHistory} />
                    </div>

                  </div>

                  <div className="w-full max-w-[190px] space-y-2">
                    <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Estimate</p>
                      <p className="text-base font-semibold text-white">
                        {getTokenCost() !== null ? `${getTokenCost()} tokens` : '...'}
                      </p>
                    </div>
                    <Button
                      onClick={generateImage}
                      disabled={loading || !inputValues['prompt']}
                      className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-sm font-semibold text-white shadow-[0_0_16px_rgba(220,38,38,0.5)] transition-all hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(220,38,38,0.6)] disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </div>
                    </Button>
                    <p className="text-[11px] text-muted-foreground">Balance: {tokenBalance ?? '...'} tokens.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-4 py-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" />
                AI Visual Studio
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">Create premium visuals from text and references</h1>
              <p className="text-lg text-muted-foreground">
                VISIA - generative design studio: pick models, add examples, get images and history in one place.
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
                  className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-white"
                >
                  See how it works
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                <div>
                  <p className="text-lg font-semibold text-white">References + text</p>
                  <p>Automatically switch to edit mode if references are provided.</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Project history</p>
                  <p>We keep all results in your account.</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Transparent pricing</p>
                  <p>We show cost estimate before run.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-blue-500/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Quick preview
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Live</span>
                </div>
                <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Model</span>
                    <span className="font-semibold text-white">Nano Banana Pro</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Mode</span>
                    <span className="font-semibold text-white">Edit (with reference)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Cost estimate</span>
                    <span className="font-semibold text-white">12 tokens</span>
                  </div>
                </div>
                <div className="mt-4 h-72 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-black/70" />
              </div>
            </div>
          </div>

          <div id="features" className="grid gap-6 md:grid-cols-3">
            {[{ title: 'Production-ready', desc: 'We keep generations tied to account and billing-ready.', icon: Shield }, { title: 'Smart mode selection', desc: 'If references exist use edit model, otherwise base.', icon: Sparkles }, { title: 'Clear visualization', desc: 'Preview in-app and download in one click.', icon: Zap }].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-white/25"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div id="how-it-works" className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
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
              {['Sign in and connect your account.', 'Add prompt and references if needed.', 'Run generation, preview, and download.'].map((step, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-muted-foreground">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                    {idx + 1}
                  </div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl border border-white/10 bg-black/90">
          {previewSrc && (
            <img src={previewSrc} alt="Preview" className="h-full max-h-[80vh] w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
