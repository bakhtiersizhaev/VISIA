```
'use client';

import * as React from 'react';
import { useState } from 'react'; // Added useState import
import { fal } from '@fal-ai/client';
import { AI_MODELS, ModelConfig } from '@/lib/models';
import { ModelSelector } from '@/components/model-selector';
import { PromptInput } from '@/components/prompt-input';
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
  const [prompt, setPrompt] = React.useState('');
  const [image, setImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1'); // Added aspectRatio state

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const result: any = await fal.subscribe(selectedModel.id, {
        input: {
          prompt,
          aspect_ratio: aspectRatio, // Use state
          num_images: 1,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('Queue update:', update.logs);
          }
        },
      });

      console.log('Fal.ai Result:', result); // DEBUG LOG

      if (result.images && result.images.length > 0) {
        setImage(result.images[0].url);
      } else if (result.data && result.data.images && result.data.images.length > 0) {
        // Fallback for different response structure
        setImage(result.data.images[0].url);
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
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-background/80 sticky top-0 z-50 w-full border-b px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600" />
            <span className="text-xl font-bold tracking-tight">VISIA</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              💎 100 Tokens
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
        {/* Controls */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Create with AI
            </h1>
            <p className="text-muted-foreground">
              Select a model and describe your vision.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="w-full md:w-1/3 space-y-4">
              <ModelSelector
                selectedModel={selectedModel}
                onSelect={setSelectedModel}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Aspect Ratio
                </label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                    <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-card text-muted-foreground rounded-lg border p-4 text-sm">
                <p className="text-foreground font-medium">
                  {selectedModel.name}
                </p>
                <p className="mt-1">{selectedModel.description}</p>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={generateImage}
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="mt-8 flex min-h-[400px] w-full items-center justify-center rounded-xl border-2 border-dashed bg-zinc-50/50 dark:bg-zinc-900/50">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground animate-pulse">
                Generating masterpiece...
              </p>
            </div>
          ) : image ? (
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <img
                src={image}
                alt={prompt}
                className="max-h-[600px] w-auto object-contain"
              />
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2">
              <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                <span className="text-2xl">✨</span>
              </div>
              <p>Your creation will appear here</p>
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive absolute bottom-4 rounded-md px-4 py-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
