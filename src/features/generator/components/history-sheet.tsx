/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { History, Trash2, Copy, Check, Download, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ImagePreviewDialog } from '@/components/common/image-preview-dialog';

export interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  modelId: string;
  timestamp: number;
}

interface HistorySheetProps {
  history: HistoryItem[];
  onClear: () => void;
  onSelect?: (item: HistoryItem) => void;
}

export function HistorySheet({ history, onClear, onSelect }: HistorySheetProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);

  const downloadImage = async (url: string) => {
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

  const copyPrompt = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <History className="h-5 w-5" />
            {history.length > 0 && (
              <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
                {history.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full border-l border-white/10 bg-zinc-950 sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>History</SheetTitle>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
            <SheetDescription>
              Your recent generations. Click to view or copy prompt.
            </SheetDescription>
          </SheetHeader>

          <div className="custom-scrollbar mt-6 h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            {history.length === 0 ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center">
                <History className="mb-4 h-12 w-12 opacity-20" />
                <p>No history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                    onClick={() => onSelect?.(item)}
                    role={onSelect ? 'button' : undefined}
                    tabIndex={onSelect ? 0 : undefined}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black/20">
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white shadow-sm hover:bg-black/85"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewSrc(item.url);
                            setPreviewOpen(true);
                          }}
                          aria-label="Open preview"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(item.url);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white text-black shadow-sm hover:bg-white/90"
                          aria-label="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-foreground/90 line-clamp-2 text-sm font-medium">
                          {item.prompt}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground h-6 w-6 shrink-0"
                          onClick={(e) => copyPrompt(e, item.prompt, item.id)}
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span>{item.modelId.split('/').pop()}</span>
                        <span>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        src={previewSrc}
      />
    </>
  );
}
