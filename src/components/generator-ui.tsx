/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fal } from '@fal-ai/client';
import {
  Loader2,
  Download,
  Plus,
  Image as ImageIcon,
  X,
  ChevronDown,
  Zap,
  User as UserIcon,
  LogOut,
  ZoomIn,
  Sparkles,
} from 'lucide-react';
import { AI_MODELS, ModelConfig } from '@/lib/models';
import { HistorySheet, HistoryItem } from '@/components/history-sheet';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ImagePreviewDialog } from '@/components/image-preview-dialog';


type InputValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | File
  | File[]
  | (string | File | number | boolean)[]
  | null
  | undefined;
type FalImage = { url: string };
type FalResponse = { images?: FalImage[]; data?: { images?: FalImage[] } };
type FalQueueUpdate = {
  status?: string;
  logs?: { message?: string | null | undefined }[];
};

const USD_PER_TOKEN = 0.01;

fal.config({
  proxyUrl: '/api/fal/proxy',
});

interface GeneratorUIProps {
  user: User;
}

export function GeneratorUI({ user }: GeneratorUIProps) {
  const [selectedModel, setSelectedModel] = React.useState<ModelConfig>(
    AI_MODELS[0]
  );
  const [inputValues, setInputValues] = React.useState<
    Record<string, InputValue>
  >({});
  const [images, setImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = React.useState<number | null>(null);

  const supabase = createClient();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const refreshBalance = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('token_balance')
      .eq('id', user.id)
      .maybeSingle();
    if (!error && data) {
      setTokenBalance(data.token_balance);
    }
  }, [supabase, user.id]);

  // Sync user profile and balance
  React.useEffect(() => {
    const syncUser = async () => {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email || '',
      });
      await refreshBalance();
    };
    syncUser();
  }, [supabase, user.email, user.id, refreshBalance]);

  // Load history (server endpoint to avoid client-side writes)
  React.useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch('/api/history');
      if (!res.ok) return;
      const json = (await res.json()) as { history?: HistoryItem[] };
      if (json.history) setHistory(json.history);
    };
    fetchHistory();
  }, [user.id]);

  // Timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      const startTime = Date.now();
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Defaults
  React.useEffect(() => {
    setInputValues((prev) => {
      const next: Record<string, InputValue> = {};
      selectedModel.inputParams?.forEach((param) => {
        // Keep image/prompt if switching models
        let carry: InputValue | undefined = prev[param.name];

        // Helper to migrate single <-> multi image params if model changes
        if (
          carry === undefined &&
          param.name === 'image_urls' &&
          prev['image_url'] !== undefined
        ) {
          const src = prev['image_url'];
          carry = Array.isArray(src) ? src : src ? [src] : [];
        }
        if (
          carry === undefined &&
          param.name === 'image_url' &&
          prev['image_urls'] !== undefined
        ) {
          const src = prev['image_urls'];
          if (Array.isArray(src) && src.length > 0) carry = src[0];
        }

        if (carry !== undefined) {
          next[param.name] = carry;
        } else if (param.default !== undefined) {
          next[param.name] = param.default;
        } else {
          next[param.name] = '';
        }
      });
      // Ensure prompt persists
      if (prev['prompt']) next['prompt'] = prev['prompt'];
      return next;
    });
  }, [selectedModel]);

  const handleInputChange = (name: string, value: InputValue) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        // Enforce image-only uploads to avoid invalid payloads
        setError(`File "${file.name}" is not an image. Only image uploads are allowed.`);
        alert(`File "${file.name}" is not an image. Only image uploads are allowed.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        // Show error immediately
        setError(`File "${file.name}" is too large. Maximum size is 50MB.`);
        // Also alert for visibility
        alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    // Determine if model supports multiple
    const supportMulti = selectedModel.inputParams?.find(
      (p) => p.name === 'image_urls'
    );

    if (supportMulti) {
      const current = (inputValues['image_urls'] as (File | string)[]) || [];
      handleInputChange('image_urls', [...current, ...validFiles]);
    } else {
      handleInputChange('image_url', validFiles[0]);
    }
    e.target.value = '';
  };

  const triggerHandleFileSelect = (files: FileList) => {
    const syntheticEvent = {
      target: { files },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(syntheticEvent);
  };

  const removeRefImage = (index: number) => {
    const supportMulti = selectedModel.inputParams?.find(
      (p) => p.name === 'image_urls'
    );
    if (supportMulti) {
      const current = (inputValues['image_urls'] as (File | string)[]) || [];
      const next = [...current];
      next.splice(index, 1);
      handleInputChange('image_urls', next);
    } else {
      handleInputChange('image_url', null);
    }
  };

  const getReferenceImages = () => {
    const single = inputValues['image_url'];
    const multi = inputValues['image_urls'];
    const refs: { file: File | string; isMulti: boolean; index: number }[] = [];

    if (multi && Array.isArray(multi)) {
      multi.forEach((f, i) => {
        if (f instanceof File || typeof f === 'string') {
          refs.push({ file: f, isMulti: true, index: i });
        }
      });
    } else if (single) {
      refs.push({ file: single as File | string, isMulti: false, index: 0 });
    }
    return refs;
  };

  const generateImage = async () => {
    const promptValue = inputValues['prompt'];
    if (typeof promptValue !== 'string' || !promptValue.trim()) return;
    const prompt = promptValue.trim();
    const hasRef = getReferenceImages().length > 0;
    const modelIdToUse =
      selectedModel.editId && hasRef ? selectedModel.editId : selectedModel.id;
    const cost = getPrice();

    if (typeof tokenBalance === 'number' && cost !== null && tokenBalance < cost) {
      setError('Not enough tokens to generate.');
      return;
    }

    const uploadReferences = async () => {
      const uploads: Record<string, string | string[] | undefined> = {};
      const single = inputValues['image_url'];
      if (single instanceof File)
        uploads.image_url = await fal.storage.upload(single);
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
    setImages([]);
    setLogs([]);

    try {
      const uploadedRefs = await uploadReferences();
      const inputPayload: Record<string, InputValue> = {
        ...inputValues,
        ...uploadedRefs,
      };

      // Clean up payload based on mode
      if (modelIdToUse.includes('/edit')) {
        delete inputPayload.num_images;
        delete inputPayload.resolution;
      } else {
        delete inputPayload.image_url;
        delete inputPayload.image_urls;
      }

      const result = await fal.subscribe(modelIdToUse, {
        input: inputPayload,
        logs: true,
        onQueueUpdate: (update: FalQueueUpdate) => {
          if (update.status === 'IN_PROGRESS' && update.logs?.length) {
            const msgs = update.logs
              .map((l) => l.message)
              .filter(Boolean) as string[];
            setLogs((p) => [...p, ...msgs]);
          }
        },
      });

      const parsed = result as FalResponse;
      const urls: string[] =
        parsed.images?.map((img) => img.url).filter(Boolean) ||
        parsed.data?.images?.map((img) => img.url).filter(Boolean) ||
        [];

      if (urls.length) {
        setImages(urls);
        const now = Date.now();
        const newItems: HistoryItem[] = urls.map((url, idx) => ({
          id: `${now}-${idx}`,
          url,
          prompt,
          modelId: modelIdToUse,
          timestamp: now,
        }));
        setHistory((prev) => [...newItems, ...prev]);
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: urls.map((url) => ({
              imageUrl: url,
              prompt,
              modelId: modelIdToUse,
              timestamp: now,
            })),
          }),
        });
        void refreshBalance();
      } else {
        setError('No images returned from model.');
      }
    } catch (err) {
      const error = err as { body?: { detail?: string }; message?: string } | null;
      const msg = error?.body?.detail || error?.message || 'Generation failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const getPrice = () => {
    if (!selectedModel.basePriceUsd) return null;
    const numImages =
      typeof inputValues['num_images'] === 'number'
        ? Math.max(1, inputValues['num_images'] as number)
        : 1;
    const estimate =
      ((selectedModel.basePriceUsd * 1.2) / USD_PER_TOKEN) * numImages;
    return Math.max(1, Math.ceil(estimate));
  };

  const previewRef = (file: File | string) => {
    if (typeof file === 'string') return file;
    return URL.createObjectURL(file);
  };

  return (
    <main className="animated-bg text-white selection:bg-purple-500/30 flex min-h-screen flex-col items-center">
      {/* Header */}
      <header className="glass sticky top-0 z-50 w-full px-6 py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl">
              <Image
                src="/logo-header-mini.png"
                alt="VISIA"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="block text-lg font-bold leading-none tracking-tight text-white">
                VISIA
              </span>
              <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                Intelligence Studio
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <HistorySheet history={history} onClear={() => setHistory([])} />
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <Zap className="text-purple-400 h-3 w-3" fill="currentColor" />
              <span className="text-sm font-medium text-white">
                {tokenBalance ?? '...'}
              </span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <UserIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-56 border-white/40 bg-[#0A0A0A] p-2 text-white"
              >
                <div className="mb-1 truncate border-b border-white/5 px-2 py-1.5 text-sm text-zinc-400">
                  {user.email}
                </div>
                <Link
                  href="/account"
                  className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <UserIcon className="h-4 w-4 text-zinc-400" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="flex w-full max-w-[1400px] flex-1 flex-col items-center gap-8 p-6">
        {/* Result Area (Dynamic Height) */}
        <div className="flex min-h-[400px] w-full max-w-4xl flex-1 flex-col items-center justify-center">
          {loading ? (
            <div className="relative flex flex-col items-center justify-center gap-6 p-12 transition-all">
              <div className="relative">
                <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-2xl" />
                <div className="border-t-primary relative h-20 w-20 animate-spin rounded-full border-[3px] border-white/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="text-purple-400 h-8 w-8 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="animate-pulse text-xl font-medium text-slate-900 leading-snug tracking-tight bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Dreaming...
                </p>
                <p className="font-mono text-sm text-white/50">
                  {elapsedTime.toFixed(1)}s
                </p>
              </div>
              {logs.length > 0 && (
                <div className="w-full max-w-xs overflow-hidden text-center">
                  <p className="animate-pulse truncate text-xs text-white/40">
                    {logs[logs.length - 1]}
                  </p>
                </div>
              )}
            </div>
          ) : images.length > 0 ? (
            <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
              {images.map((img, idx) => (
                <div
                  key={img}
                  className="group relative flex items-center justify-center"
                >
                  <img
                    src={img}
                    alt={`Generated ${idx + 1}`}
                    className="max-h-[60vh] w-full cursor-zoom-in rounded-2xl border border-white/5 shadow-2xl object-contain"
                    onClick={() => {
                      setPreviewSrc(img);
                      setPreviewOpen(true);
                    }}
                  />
                  <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full border border-white/10 bg-black/60 text-white backdrop-blur hover:bg-black/80 shadow-md"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const response = await fetch(img);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `visia-${Date.now()}-${idx + 1}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('Download failed:', err);
                          window.open(img, '_blank');
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex select-none flex-col items-center justify-center gap-4 text-zinc-700 opacity-50">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-dashed border-current">
                <ImageIcon className="h-10 w-10" />
              </div>
              <p className="font-medium tracking-tight">Ready to create</p>
            </div>
          )}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* THE COMMAND CENTER */}
        <div
          className="z-10 mt-auto w-full max-w-4xl pb-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              triggerHandleFileSelect(e.dataTransfer.files);
            }
          }}
        >
          <div className="glass-strong rounded-2xl shadow-2xl">
            {/* Row 1: Asset Slots */}
            {selectedModel.inputParams?.some(
              (p) => p.name === 'image_url' || p.name === 'image_urls'
            ) ? (
              <div className="flex items-center gap-3 px-5 pt-5">
                {/* Upload Trigger */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex h-14 w-14 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <Plus className="h-5 w-5 text-white/50 transition-colors group-hover:text-white" />
                  <span className="text-[9px] font-medium text-white/40 group-hover:text-white/60">
                    Image
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                  />
                </div>

                {/* Active Assets */}
                {getReferenceImages().map((ref, i) => (
                  <div
                    key={i}
                    className="group relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/40"
                  >
                    <img
                      src={previewRef(ref.file)}
                      className="h-full w-full object-cover"
                      alt="ref"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewSrc(previewRef(ref.file));
                          setPreviewOpen(true);
                        }}
                        className="rounded-full bg-white/20 p-1.5 hover:bg-white/40"
                      >
                        <ZoomIn className="h-3 w-3 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRefImage(ref.index);
                        }}
                        className="rounded-full bg-white/20 p-1.5 hover:bg-red-500/80"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Row 2: Prompt Input */}
            <div className="px-5 py-4">
              <textarea
                className="custom-scrollbar min-h-[40px] max-h-[240px] w-full resize-none border-none bg-transparent text-base font-medium text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
                rows={1}
                placeholder="Describe your imagination..."
                value={(inputValues['prompt'] as string) || ''}
                onChange={(e) => {
                  handleInputChange('prompt', e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateImage();
                  }
                }}
                onPaste={(e) => {
                  const items = e.clipboardData.items;
                  const files: File[] = [];
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                      const file = items[i].getAsFile();
                      if (file) files.push(file);
                    }
                  }
                  if (files.length > 0) {
                    e.preventDefault();
                    const dt = new DataTransfer();
                    files.forEach((f) => dt.items.add(f));
                    triggerHandleFileSelect(dt.files);
                  }
                }}
              />
            </div>

            {/* Row 3: Controls + Generate (single row) */}
            <div className="flex items-center justify-between gap-4 px-5 pb-5">
              {/* Left: Settings Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Model Pill */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
                      <Sparkles className="text-purple-400 h-4 w-4" />
                      {selectedModel.name}
                      <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[280px] border-white/10 bg-[#0a0a0a] p-2 shadow-xl"
                  >
                    {AI_MODELS.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors',
                          selectedModel.id === model.id
                            ? 'bg-white/10 text-white'
                            : 'hover:bg-white/5 text-white/70'
                        )}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm">
                          {model.id.includes('nano') ? '⚡' : '🎨'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white">
                            {model.name}
                          </div>
                          <div className="truncate text-[11px] text-zinc-500">
                            {model.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>

                {/* Other Settings Pills */}
                {selectedModel.inputParams
                  ?.filter(
                    (p) =>
                      !['prompt', 'image_url', 'image_urls'].includes(p.name)
                  )
                  .map((param) => (
                    <Popover key={param.name}>
                      <PopoverTrigger asChild>
                        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium transition-colors hover:bg-white/10 text-white">
                          <span className="text-white/50">{param.label}:</span>
                          <span className="text-white">
                            {String(
                              inputValues[param.name] ?? param.default ?? ''
                            )}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[180px] border-white/10 bg-[#0a0a0a] p-2 shadow-xl">
                        {param.type === 'select' ? (
                          <div className="space-y-1">
                            {param.options?.map((opt) => (
                              <div
                                key={opt}
                                onClick={() =>
                                  handleInputChange(param.name, opt)
                                }
                                className={cn(
                                  'cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors',
                                  inputValues[param.name] === opt
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-white hover:bg-white/10'
                                )}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <input
                            type={param.type}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
                            value={String(inputValues[param.name] ?? '')}
                            onChange={(e) =>
                              handleInputChange(
                                param.name,
                                param.type === 'number'
                                  ? Number(e.target.value)
                                  : e.target.value
                              )
                            }
                          />
                        )}
                      </PopoverContent>
                    </Popover>
                  ))}
              </div>

              {/* Right: Generate Button */}
              <Button
                onClick={generateImage}
                disabled={
                  loading ||
                  !inputValues['prompt'] ||
                  (typeof tokenBalance === 'number' &&
                    getPrice() !== null &&
                    tokenBalance < (getPrice() as number))
                }
                className="h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-40 disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
          </div>

          {/* Cost estimate */}
          {getPrice() !== null && (
            <p className="mt-3 text-center text-xs text-white/40">
              Cost estimate: ~{getPrice()} tokens
            </p>
          )}
        </div>
      </div>

      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        src={previewSrc}
      />
    </main>
  );
}
