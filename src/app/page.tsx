'use client';

import * as React from 'react';
import { fal } from '@fal-ai/client';
import { Wand2, Loader2 } from 'lucide-react';
import { AI_MODELS, ModelConfig } from '@/lib/models';
import { ModelSelector } from '@/components/model-selector';
import { PromptInput } from '@/components/prompt-input';
import { ImageUpload } from '@/components/image-upload';
import { HistorySheet, HistoryItem } from '@/components/history-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Configure fal.ai to use the proxy
fal.config({
  proxyUrl: '/api/fal/proxy',
});

export default function Home() {
  const [selectedModel, setSelectedModel] = React.useState<ModelConfig>(
    AI_MODELS[0]
  );
  const [inputValues, setInputValues] = React.useState<Record<string, any>>({});
  const [image, setImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  // Load history from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('visia_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage
  React.useEffect(() => {
    localStorage.setItem('visia_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (url: string, prompt: string, modelId: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      url,
      prompt,
      modelId,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('visia_history');
  };

  // Initialize default values when model changes
  React.useEffect(() => {
    const defaults: Record<string, any> = {};
    selectedModel.inputParams?.forEach((param) => {
      if (param.default !== undefined) {
        defaults[param.name] = param.default;
      }
    });
    setInputValues(defaults);
  }, [selectedModel]);

  const handleInputChange = (name: string, value: any) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const generateImage = async () => {
    const prompt = inputValues['prompt'];
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const result: any = await fal.subscribe(selectedModel.id, {
        input: {
          ...inputValues,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('Queue update:', update.logs);
          }
        },
      });

      console.log('Fal.ai Result:', result);

      if (result.images && result.images.length > 0) {
        const imageUrl = result.images[0].url;
        setImage(imageUrl);
        addToHistory(imageUrl, prompt, selectedModel.id);
      } else if (result.data && result.data.images && result.data.images.length > 0) {
        const imageUrl = result.data.images[0].url;
        setImage(imageUrl);
        addToHistory(imageUrl, prompt, selectedModel.id);
      } else {
        console.warn('No images found in result:', result);
      }
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
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
            <div className="h-8 w-8 rounded-full bg-secondary border border-border" />
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
                      {/* Fallback for other types if needed */}
                      <input
                        type={param.type}
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground backdrop-blur-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:bg-white/10"
                        value={inputValues[param.name] || ''}
                        onChange={(e) => handleInputChange(param.name, e.target.value)}
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
            <div className="flex flex-col items-center gap-4 z-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
                <div className="relative border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              </div>
              <p className="text-muted-foreground animate-pulse font-medium">
                Creating your masterpiece...
              </p>
            </div>
          ) : image ? (
            <div className="relative w-full h-full min-h-[500px] flex items-center justify-center p-4">
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
            <div className="bg-destructive/10 text-destructive absolute bottom-4 rounded-md px-4 py-2 border border-destructive/20 backdrop-blur-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
