/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fal } from '@fal-ai/client';
import {
  Loader2,
  Image as ImageIcon,
  Zap,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { AI_MODELS, ModelConfig } from '@/lib/ai/models';
import { HistorySheet, HistoryItem } from '@/features/generator/components/history-sheet';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ImagePreviewDialog } from '@/components/common/image-preview-dialog';
import { CompareModeSelector, getCommonAspectRatios, allModelsSupportsNumImages, getModelAspectRatioValue } from '@/features/generator/utils/compare-mode';
import { AspectRatioIcon, getAspectRatioDisplayName } from '@/features/generator/utils/aspect-ratio';
import { JobCard } from '@/features/generator/components/job-card';
import { useGeneratorState } from '@/features/generator/hooks/useGeneratorState';
import { useJobQueue } from '@/features/generator/hooks/useJobQueue';
import { SettingsPills } from '@/features/generator/components/settings-pills';
import { ModelSelector } from '@/features/generator/components/model-selector';
import { PromptInput } from '@/features/generator/components/prompt-input';
import type {
  InputValue,
  FalImage,
  FalResponse,
  FalQueueUpdate,
  GenerationJob
} from '@/types/generator-types';
import { USD_PER_TOKEN, MAX_PARALLEL_JOBS } from '@/types/generator-types';

fal.config({
  proxyUrl: '/api/fal/proxy',
});

interface GeneratorUIProps {
  user: User;
}

export function GeneratorUI({ user }: GeneratorUIProps) {
  // ============================================================================
  // STATE - Generator State Hook
  // ============================================================================
  const {
    selectedModel,
    setSelectedModel,
    inputValues,
    setInputValues,
    handleInputChange,
    compareMode,
    setCompareMode,
    selectedModels,
    setSelectedModels,
    toggleModelSelection,
  } = useGeneratorState();

  // Job Queue Hook
  const {
    jobs,
    activeJobs,
    addJob,
    updateJob,
    removeJob,
    cancelJob,
    clearJobs,
  } = useJobQueue();

  // Other state
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = React.useState<number | null>(null);
  const [promptText, setPromptText] = React.useState('');
  const [uiError, setUiError] = React.useState<string | null>(null);
  const [isUploadingRefs, setIsUploadingRefs] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const supabase = createClient();
  const feedRef = React.useRef<HTMLDivElement | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

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

  // Load history
  React.useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch('/api/history');
      if (!res.ok) return;
      const json = (await res.json()) as { history?: HistoryItem[] };
      if (json.history) setHistory(json.history);
    };
    fetchHistory();
  }, [user.id]);

  // Defaults for model inputs
  React.useEffect(() => {
    setInputValues((prev) => {
      const next: Record<string, InputValue> = {};
      selectedModel.inputParams?.forEach((param) => {
        let carry: InputValue | undefined = prev[param.name];

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
      if (prev['prompt']) next['prompt'] = prev['prompt'];
      return next;
    });
  }, [selectedModel, setInputValues]);

  // Keep local promptText in sync with inputValues when it changes externally
  React.useEffect(() => {
    const currentPrompt = typeof inputValues['prompt'] === 'string' ? inputValues['prompt'] : '';
    if (currentPrompt !== promptText) {
      setPromptText(currentPrompt);
    }
  }, [inputValues, promptText]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const MAX_SIZE = 50 * 1024 * 1024;
    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image. Only image uploads are allowed.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const supportMulti = selectedModel.inputParams?.find((p) => p.name === 'image_urls');

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
    const supportMulti = selectedModel.inputParams?.find((p) => p.name === 'image_urls');
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

  const getPrice = (model?: ModelConfig) => {
    const targetModel = model || selectedModel;
    if (!targetModel.basePriceUsd) return null;
    const numImages =
      typeof inputValues['num_images'] === 'number'
        ? Math.max(1, inputValues['num_images'] as number)
        : 1;
    const estimate =
      ((targetModel.basePriceUsd * 1.2) / USD_PER_TOKEN) * numImages;
    return Math.max(1, Math.ceil(estimate));
  };

  const getTotalPrice = () => {
    if (compareMode && selectedModels.size > 0) {
      let total = 0;
      selectedModels.forEach((modelId) => {
        const model = AI_MODELS.find((m) => m.id === modelId);
        if (model) {
          const price = getPrice(model);
          if (price) total += price;
        }
      });
      return total;
    }
    return getPrice();
  };

  const previewRef = (file: File | string) => {
    if (typeof file === 'string') return file;
    return URL.createObjectURL(file);
  };

  // Derive disabled state for Generate button with a human-readable reason (for debugging)
  const generateDisabledReason = React.useMemo(() => {
    if (!promptText || !promptText.trim()) {
      return 'prompt_empty';
    }
    if (isUploadingRefs) {
      return 'uploading_refs';
    }
    if (isSubmitting) {
      return 'busy';
    }
    if (activeJobs.length >= MAX_PARALLEL_JOBS) {
      return 'max_parallel_jobs';
    }
    if (compareMode && selectedModels.size === 0) {
      return 'no_selected_models';
    }
    const totalPrice = getTotalPrice();
    if (
      typeof tokenBalance === 'number' &&
      totalPrice !== null &&
      tokenBalance < totalPrice
    ) {
      return 'insufficient_tokens';
    }
    return null;
  }, [promptText, isUploadingRefs, isSubmitting, activeJobs.length, compareMode, selectedModels.size, tokenBalance]);

  // Log disabled reason to help diagnose "button not clickable"
  React.useEffect(() => {
    if (generateDisabledReason) {
      console.warn('[Generate disabled]', generateDisabledReason, {
        prompt: promptText,
        activeJobs: activeJobs.length,
        compareMode,
        selectedModels: Array.from(selectedModels),
        tokenBalance,
        totalPrice: getTotalPrice(),
        isUploadingRefs,
        isSubmitting,
      });
    }
  }, [
    generateDisabledReason,
    promptText,
    activeJobs.length,
    compareMode,
    selectedModels,
    tokenBalance,
    isUploadingRefs,
    isSubmitting,
  ]);

  // ============================================================================
  // GENERATION LOGIC
  // ============================================================================

  const uploadWithRetry = async (file: File, maxAttempts = 3): Promise<string> => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          await new Promise((res) => setTimeout(res, 300 * attempt));
        }
        return await fal.storage.upload(file);
      } catch (err) {
        lastError = err;
        console.warn('[Upload retry]', attempt, err);
      }
    }
    throw lastError;
  };

  const uploadReferencePayload = async (values: Record<string, InputValue>) => {
    const uploads: Record<string, string | string[] | undefined> = {};

    const single = values['image_url'];
    if (single instanceof File) {
      uploads.image_url = await uploadWithRetry(single);
    } else if (typeof single === 'string' && single) {
      uploads.image_url = single;
    }

    const multi = values['image_urls'];
    if (Array.isArray(multi)) {
      const urls: string[] = [];
      for (const item of multi) {
        if (item instanceof File) {
          urls.push(await uploadWithRetry(item));
        } else if (typeof item === 'string' && item) {
          urls.push(item);
        }
      }
      if (urls.length) uploads.image_urls = urls;
    }

    return uploads;
  };

  const generateImage = async () => {
    setUiError(null);
    if (isUploadingRefs || isSubmitting) return;
    if (typeof promptText !== 'string' || !promptText.trim()) {
      setUiError('Add a prompt to start generation.');
      return;
    }
    const prompt = promptText.trim();

    // Determine which models to use
    const modelsToGenerate: ModelConfig[] = [];

    if (compareMode && selectedModels.size > 0) {
      // Compare Mode: use all selected models
      selectedModels.forEach((modelId) => {
        const model = AI_MODELS.find((m) => m.id === modelId);
        if (model) modelsToGenerate.push(model);
      });
    } else {
      // Normal Mode: use single selected model
      modelsToGenerate.push(selectedModel);
    }

    // Check parallel limit
    setIsSubmitting(true);

    try {
      const runningJobs = jobs.filter((j) => j.status === 'running' || j.status === 'pending');
      const availableSlots = MAX_PARALLEL_JOBS - runningJobs.length;

      if (availableSlots <= 0) {
        setUiError(`Maximum ${MAX_PARALLEL_JOBS} parallel generations allowed. Please wait for current jobs to complete.`);
        return;
      }

      if (modelsToGenerate.length > availableSlots) {
        setUiError(`Only ${availableSlots} slots available. Please select fewer models or wait for current jobs to complete.`);
        return;
      }

      // Check token balance for total cost
      const totalCost = getTotalPrice();
      if (typeof tokenBalance === 'number' && totalCost !== null && tokenBalance < totalCost) {
        setUiError(`Not enough tokens. Required: ${totalCost}, Available: ${tokenBalance}`);
        return;
      }

      const hasRef = getReferenceImages().length > 0;

      // Upload reference images once and reuse across all models
      let uploadedRefs: Record<string, string | string[] | undefined> = {};
      if (hasRef) {
        try {
          setIsUploadingRefs(true);
          uploadedRefs = await uploadReferencePayload(inputValues);
          console.log('[Generate] uploaded reference payload', uploadedRefs);
        } catch (err) {
          console.error('[Generate] reference upload failed', err);
          setUiError('Reference upload failed. Please try again or use a smaller image.');
          return;
        } finally {
          setIsUploadingRefs(false);
        }
      }

      // Create and start jobs for each model
      for (const model of modelsToGenerate) {
        const modelIdToUse = model.editId && hasRef ? model.editId : model.id;
        const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const abortController = new AbortController();

        // Add to queue
        const newJob: GenerationJob = {
          id: jobId,
          prompt,
          model,
          modelIdUsed: modelIdToUse,
          status: 'pending',
          images: [],
          error: null,
          logs: [],
          elapsedTime: 0,
          startTime: Date.now(),
          abortController,
          inputValues: { ...inputValues, prompt, ...uploadedRefs },
        };

        addJob(newJob);

        // Small delay between job starts to avoid race conditions
        await new Promise((resolve) => setTimeout(resolve, 120));

        // Start generation in background (don't await)
        executeJob(newJob);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeJob = async (job: GenerationJob) => {
    // Mark as running
    updateJob(job.id, { status: 'running', startTime: Date.now() });

    try {
      const inputPayload: Record<string, InputValue> = {
        ...job.inputValues,
      };

      // Convert canonical aspect ratio to model-specific format
      const modelAspectParam = job.model.inputParams?.find(
        (p) => p.name === 'aspect_ratio' || p.name === 'image_size'
      );
      if (modelAspectParam) {
        const canonicalValue = (inputPayload['aspect_ratio'] as string) || (inputPayload['image_size'] as string);
        if (canonicalValue) {
          const modelSpecificValue = getModelAspectRatioValue(canonicalValue, modelAspectParam.name);
          // Set the correct parameter for this model
          inputPayload[modelAspectParam.name] = modelSpecificValue;
          // Clean up the other parameter if it exists
          if (modelAspectParam.name === 'image_size') {
            delete inputPayload['aspect_ratio'];
          } else {
            delete inputPayload['image_size'];
          }
        }
      }

      if (job.modelIdUsed.includes('/edit')) {
        delete inputPayload.num_images;
        delete inputPayload.resolution;
      } else {
        delete inputPayload.image_url;
        delete inputPayload.image_urls;
      }

      const result = await fal.subscribe(job.modelIdUsed, {
        input: inputPayload,
        logs: true,
        onQueueUpdate: (update: FalQueueUpdate) => {
          if (update.status === 'IN_PROGRESS' && update.logs?.length) {
            const msgs = update.logs
              .map((l) => l.message)
              .filter(Boolean) as string[];
            updateJob(job.id, { logs: [...job.logs, ...msgs] });
          }
        },
      });

      const parsed = result as FalResponse;
      const urls: string[] =
        parsed.images?.map((img) => img.url).filter(Boolean) ||
        parsed.data?.images?.map((img) => img.url).filter(Boolean) ||
        [];

      if (urls.length) {
        updateJob(job.id, {
          status: 'done',
          images: urls,
          elapsedTime: (Date.now() - job.startTime) / 1000,
        });

        // Save to history
        const now = Date.now();
        const newItems: HistoryItem[] = urls.map((url, idx) => ({
          id: `${now}-${idx}`,
          url,
          prompt: job.prompt,
          modelId: job.modelIdUsed,
          timestamp: now,
        }));
        setHistory((prev) => [...newItems, ...prev]);
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: urls.map((url) => ({
              imageUrl: url,
              prompt: job.prompt,
              modelId: job.modelIdUsed,
              timestamp: now,
            })),
          }),
        });
        void refreshBalance();
      } else {
        updateJob(job.id, {
          status: 'error',
          error: 'No images returned from model.',
        });
      }
    } catch (err) {
      const error = err as { body?: { detail?: string }; message?: string } | null;
      const msg = error?.body?.detail || error?.message || 'Generation failed';
      console.error('[Generate error]', job.modelIdUsed, msg, err);
      updateJob(job.id, {
        status: 'error',
        error: typeof msg === 'string' ? msg : JSON.stringify(msg),
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const completedJobs = jobs.filter((j) => j.status === 'done' || j.status === 'error');

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <main className="animated-bg text-white selection:bg-purple-500/30 flex min-h-screen flex-col">
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

      <div className="flex w-full flex-1 flex-col">
        {/* Results Feed Area */}
        <div
          ref={feedRef}
          className="flex-1 overflow-y-auto px-6 py-8"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Active Jobs (Running/Pending) */}
            {activeJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onCancel={() => cancelJob(job.id)}
                onPreview={(src) => {
                  setPreviewSrc(src);
                  setPreviewOpen(true);
                }}
              />
            ))}

            {/* Completed Jobs */}
            {completedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onRemove={() => removeJob(job.id)}
                onPreview={(src) => {
                  setPreviewSrc(src);
                  setPreviewOpen(true);
                }}
              />
            ))}

            {/* Empty State */}
            {jobs.length === 0 && (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-zinc-600">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-dashed border-current">
                  <ImageIcon className="h-10 w-10" />
                </div>
                <p className="font-medium tracking-tight">Ready to create</p>
                <p className="text-sm text-zinc-500">Enter a prompt below and hit Generate</p>
              </div>
            )}
          </div>
        </div>

        {/* THE COMMAND CENTER */}
        <div
          className="sticky bottom-0 z-10 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-6 px-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              triggerHandleFileSelect(e.dataTransfer.files);
            }
          }}
        >
          <div className="mx-auto max-w-4xl">
            {/* Active Jobs Counter */}
            {activeJobs.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span>
                    {activeJobs.length} generation{activeJobs.length > 1 ? 's' : ''} in progress
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg border border-white/10 bg-white/10 px-3 text-xs text-white/80 hover:bg-white/20"
                  onClick={clearJobs}
                >
                  Clear queue
                </Button>
              </div>
            )}

          <div className="glass-strong rounded-2xl shadow-2xl">
            {uiError && (
              <div className="px-5 pt-4">
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {uiError}
                </div>
              </div>
            )}
            <PromptInput
              selectedModel={selectedModel}
              promptValue={promptText}
              inputValues={inputValues}
              onPromptChange={(value: string) => {
                setPromptText(value);
                handleInputChange('prompt', value);
              }}
              onGenerateImage={generateImage}
              onFileSelect={(files) => triggerHandleFileSelect(files)}
              onRemoveRefImage={removeRefImage}
              onPreviewImage={(src: string) => {
                setPreviewSrc(src);
                setPreviewOpen(true);
              }}
            />

            {/* Row 3: Controls + Generate */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 pb-5">
              {/* Left: Model & Settings Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Compare Mode Icon Button */}
                <div className="relative">
                  <CompareModeSelector
                    enabled={compareMode}
                    selectedModels={selectedModels}
                    onToggle={() => {
                      setCompareMode(!compareMode);
                      if (!compareMode) {
                        setSelectedModels(new Set([selectedModel.id]));
                      }
                    }}
                    onModelToggle={toggleModelSelection}
                  />
                </div>

                {/* Model Selector Pill */}
                <ModelSelector
                  selectedModel={selectedModel}
                  compareMode={compareMode}
                  selectedModels={selectedModels}
                  onModelSelect={setSelectedModel}
                />

                {/* Settings Pills - Smart based on mode */}
                <SettingsPills
                  selectedModel={selectedModel}
                  inputValues={inputValues}
                  compareMode={compareMode}
                  selectedModels={selectedModels}
                  onInputChange={handleInputChange}
                />
              </div>

              {/* Right: Generate Button */}
              <Button
                onClick={generateImage}
                disabled={!!generateDisabledReason}
                title={generateDisabledReason || undefined}
                className="h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-40 disabled:shadow-none"
              >
                {isUploadingRefs ? 'Uploading refs…' : isSubmitting ? 'Preparing…' : 'Generate'}
              </Button>
            </div>
          </div>

          {/* Cost estimate */}
          {getTotalPrice() !== null && (
            <p className="mt-3 text-center text-xs text-white/40">
              Cost estimate: ~{getTotalPrice()} tokens
              {compareMode && selectedModels.size > 1 && (
                <span className="ml-1">({selectedModels.size} models)</span>
              )}
            </p>
          )}
          </div>
        </div>
      </div >

      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        src={previewSrc}
      />
    </main >
  );
}
