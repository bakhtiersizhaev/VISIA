'use client';

import * as React from 'react';
import { fal } from '@fal-ai/client';
import { Wand2, Loader2, Download, ZoomIn } from 'lucide-react';
import { AI_MODELS, ModelConfig } from '@/lib/models';
import { ModelSelector } from '@/components/model-selector';
import { PromptInput } from '@/components/prompt-input';
import { ImageUpload } from '@/components/image-upload';
import { HistorySheet, HistoryItem } from '@/components/history-sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type InputValue = string | number | string[] | null | undefined;
type FalImage = { url: string };
type FalResponse = { images?: FalImage[]; data?: { images?: FalImage[] } };
type FalQueueUpdate = { status?: string; logs?: { message?: string | null | undefined }[] };

// Обращаемся к fal.ai через прокси, чтобы не течь ключами с клиента.
fal.config({
    proxyUrl: '/api/fal/proxy',
});

interface GeneratorUIProps {
    user: User;
}

export function GeneratorUI({ user }: GeneratorUIProps) {
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

    const supabase = createClient();

    // Load history from Supabase
    React.useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to load history:', error);
                return;
            }

            if (data) {
                setHistory(data.map(item => ({
                    id: item.id,
                    url: item.image_url,
                    prompt: item.prompt,
                    modelId: item.model_id,
                    timestamp: new Date(item.created_at).getTime()
                })));
            }
        };

        fetchHistory();
    }, [supabase, user.id]);

    // Timer effect
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

    const addToHistory = async (url: string, prompt: string, modelId: string) => {
        // Optimistic update
        const newItem: HistoryItem = {
            id: Date.now().toString(), // Temporary ID
            url,
            prompt,
            modelId,
            timestamp: Date.now(),
        };
        setHistory((prev) => [newItem, ...prev]);

        // Save to Supabase
        const { error } = await supabase.from('history').insert({
            user_id: user.id,
            image_url: url,
            prompt,
            model_id: modelId
        });

        if (error) {
            console.error('Failed to save history:', error);
        }
    };

    const clearHistory = async () => {
        setHistory([]);
        // Optional: Delete from DB? Or just clear local view?
        // For safety, let's just clear local view for now or implement delete all endpoint
        // await supabase.from('history').delete().eq('user_id', user.id);
    };

    // Initialize default values when model changes
    React.useEffect(() => {
        const defaults: Record<string, InputValue> = {};
        selectedModel.inputParams?.forEach((param) => {
            if (param.default !== undefined) {
                defaults[param.name] = param.default;
            }
        });
        setInputValues(defaults);
    }, [selectedModel]);

    const handleInputChange = (name: string, value: InputValue) => {
        setInputValues((prev) => ({ ...prev, [name]: value }));
    };

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

        setLoading(true);
        setError(null);
        setImage(null);
        setLogs([]);

        console.log('Generating with inputs:', {
            model: selectedModel.id,
            inputs: inputValues
        });

        try {
            const result = await fal.subscribe(selectedModel.id, {
                input: {
                    ...inputValues,
                },
                logs: true,
                onQueueUpdate: (update: FalQueueUpdate) => {
                    if (update.status === 'IN_PROGRESS') {
                        if (update.logs && update.logs.length) {
                            const messages = update.logs
                                .map((l) => l.message)
                                .filter((msg): msg is string => Boolean(msg));
                            if (messages.length) {
                                setLogs((prev) => [
                                    ...prev,
                                    ...messages
                                ]);
                            }
                        }
                    }
                },
            });

            console.log('Fal.ai Result:', result);

            const parsed = result as FalResponse;

            if (parsed.images && parsed.images.length > 0) {
                const imageUrl = parsed.images[0].url;
                setImage(imageUrl);
                addToHistory(imageUrl, prompt, selectedModel.id);
            } else if (parsed.data && parsed.data.images && parsed.data.images.length > 0) {
                const imageUrl = parsed.data.images[0].url;
                setImage(imageUrl);
                addToHistory(imageUrl, prompt, selectedModel.id);
            } else {
                console.warn('No images found in result:', result);
            }
        } catch (err: unknown) {
            console.error('Generation Error Full:', err);
            type FalError = { message?: string; body?: unknown };
            const falError = err as FalError;
            let errorMessage = falError.message || 'Failed to generate image';
            if (falError.body) {
                try {
                    const body = typeof falError.body === 'string' ? JSON.parse(falError.body) : falError.body;
                    if (body.detail) errorMessage = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
                    else if (body.message) errorMessage = body.message;
                } catch (e) {
                    console.error('Failed to parse error body', e);
                    errorMessage = String(falError.body);
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 px-6 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                            <Wand2 className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">VISIA</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <HistorySheet history={history} onClear={clearHistory} />
                        <div className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground border border-border">
                            💎 100 Tokens
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                            Log Out
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border border-border" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
                {/* Controls */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Create with AI
                        </h1>
                        <p className="text-muted-foreground">
                            Select a model and describe your vision.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 md:flex-row md:items-start">
                        <div className="w-full md:w-1/3 space-y-6">
                            <div className="space-y-4">
                                <label className="text-sm font-medium leading-none text-muted-foreground">
                                    Model
                                </label>
                                <ModelSelector
                                    selectedModel={selectedModel}
                                    onSelect={setSelectedModel}
                                />
                            </div>

                            {/* Dynamic Inputs (excluding prompt) */}
                            {selectedModel.inputParams?.filter(p => p.name !== 'prompt').map((param) => (
                                <div key={param.name} className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-muted-foreground">
                                        {param.label}
                                    </label>
                                    {param.name === 'image_url' || param.name === 'image_urls' ? (
                                        <ImageUpload
                                            value={inputValues[param.name]}
                                            onChange={(url) => handleInputChange(param.name, url)}
                                            multiple={param.multiple}
                                        />
                                    ) : param.type === 'select' ? (
                                        <Select
                                            value={inputValues[param.name] || param.default || ''}
                                            onValueChange={(val) => handleInputChange(param.name, val)}
                                        >
                                            <SelectTrigger className="border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10 focus:ring-primary/50">
                                                <SelectValue placeholder={`Select ${param.label}`} />
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
                                        <div className="relative">
                                            <input
                                                type={param.type}
                                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground backdrop-blur-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:bg-white/10"
                                                value={inputValues[param.name] || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const parsed = param.type === 'number'
                                                        ? (value === '' ? '' : Number(value))
                                                        : value;
                                                    handleInputChange(param.name, parsed);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10">
                                <p className="text-foreground font-medium">
                                    {selectedModel.name}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">{selectedModel.description}</p>
                            </div>
                        </div>

                        <div className="w-full md:w-2/3 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-muted-foreground">
                                    Prompt
                                </label>
                                <PromptInput
                                    value={inputValues['prompt'] || ''}
                                    onChange={(val) => handleInputChange('prompt', val)}
                                    onSubmit={generateImage}
                                    loading={loading}
                                />
                            </div>

                            <Button
                                onClick={generateImage}
                                disabled={loading || !inputValues['prompt']}
                                className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-lg font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(220,38,38,0.7)] disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-5 w-5" />
                                            Generate Image
                                        </>
                                    )}
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Output Area */}
                <div className="mt-8 flex min-h-[500px] w-full items-center justify-center rounded-xl border border-border bg-card/30 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {loading ? (
                        <div className="flex flex-col items-center gap-4 z-10 max-w-md w-full px-4 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
                                <div className="relative border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-foreground animate-pulse">
                                    Creating your masterpiece...
                                </p>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {elapsedTime.toFixed(1)}s
                                </p>
                            </div>

                            {logs.length > 0 && (
                                <div className="mt-4 w-full rounded-md bg-black/40 p-3 text-left text-xs font-mono text-muted-foreground backdrop-blur-sm border border-white/5">
                                    <div className="flex flex-col gap-1">
                                        {logs.slice(-3).map((log, i) => (
                                            <span key={i} className="line-clamp-1 opacity-80">
                                                &gt; {log}
                                            </span>
                                        ))}
                                        <span className="animate-pulse">_</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : image ? (
                        <div className="relative w-full h-full min-h-[500px] flex items-center justify-center p-4">
                            <div className="absolute right-4 top-4 flex gap-2 z-20">
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white border border-white/15 shadow-sm transition hover:bg-black/80"
                                    onClick={() => openPreview(image)}
                                    aria-label="Открыть превью"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black border border-white/30 shadow-sm transition hover:bg-white/90"
                                    aria-label="Скачать изображение"
                                    onClick={() => handleDownload(image)}
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                            </div>
                            <img
                                src={image}
                                alt={inputValues['prompt']}
                                className="max-h-[700px] w-auto object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    ) : (
                        <div className="text-muted-foreground flex flex-col items-center gap-4 z-10">
                            <div className="rounded-full bg-secondary/50 p-6 border border-border shadow-inner">
                                <Wand2 className="h-8 w-8 opacity-50" />
                            </div>
                            <p className="text-lg">Your creation will appear here</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-destructive/10 text-destructive absolute bottom-4 rounded-md px-4 py-2 border border-destructive/20 backdrop-blur-md max-w-[90%] text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl bg-black/90 border border-white/10">
                    {previewSrc && (
                        <img
                            src={previewSrc}
                            alt="Preview"
                            className="w-full h-full max-h-[80vh] object-contain rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
