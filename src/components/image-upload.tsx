'use client';

import * as React from 'react';
import { Upload, X, Loader2, Download, ZoomIn } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type UploadValue = string | File;

interface ImageUploadProps {
  value?: UploadValue | UploadValue[];
  onChange: (value: UploadValue | UploadValue[]) => void;
  className?: string;
  multiple?: boolean;
  compact?: boolean;
}

export function ImageUpload({ value, onChange, className, multiple = false, compact = false }: ImageUploadProps) {
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

  const items = React.useMemo<UploadValue[]>(() => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }, [value]);

  // Build preview URLs and clean up object URLs for files
  React.useEffect(() => {
    const urls = items.map((item) =>
      item instanceof File ? URL.createObjectURL(item) : item
    );
    setPreviewUrls(urls);
    return () => {
      items.forEach((item, idx) => {
        if (item instanceof File) {
          URL.revokeObjectURL(urls[idx]);
        }
      });
    };
  }, [items]);

  const downloadImage = async (item: UploadValue, previewUrl: string) => {
    try {
      if (item instanceof File) {
        const objectUrl = URL.createObjectURL(item);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = item.name || 'image.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        return;
      }
      const response = await fetch(previewUrl || item);
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

  const handleUpload = React.useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setProcessing(true);
      setError(null);
      try {
        if (multiple) {
          const current = Array.isArray(value) ? value : value ? [value] : [];
          onChange([...current, ...files]);
        } else {
          onChange(files[0]);
        }
      } finally {
        setProcessing(false);
      }
    },
    [multiple, onChange, value]
  );

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      handleUpload(acceptedFiles);
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: multiple ? 4 : 1,
    multiple,
  });

  // Paste support
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const itemsList = e.clipboardData?.items;
      if (!itemsList) return;
      const files: File[] = [];
      for (let i = 0; i < itemsList.length; i++) {
        if (itemsList[i].type.indexOf('image') !== -1) {
          const file = itemsList[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        handleUpload(files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleUpload]);

  const clearImage = (e: React.MouseEvent, index?: number) => {
    e.stopPropagation();
    if (multiple) {
      if (Array.isArray(value)) {
        const newValues = [...value];
        if (typeof index === 'number') {
          newValues.splice(index, 1);
        }
        onChange(newValues);
      } else {
        onChange([]);
      }
    } else {
      onChange('');
    }
  };

  const renderPreview = () => {
    if (multiple && items.length > 0) {
      return (
        <div className={cn(compact ? 'flex flex-col gap-2 p-1' : 'grid grid-cols-2 gap-2 p-2 w-full')}>
          {items.map((item, idx) => (
            <div key={idx} className={cn('relative', compact ? 'h-12 w-full rounded-md border border-white/10 bg-black/40' : 'aspect-square')}>
              <img
                src={previewUrls[idx]}
                alt={`Uploaded ${idx}`}
                className={cn(
                  'object-cover',
                  compact ? 'h-full w-full rounded-md' : 'h-full w-full rounded-md border border-white/10'
                )}
              />
              <div className={cn('absolute right-1 top-1 flex gap-1', compact && 'scale-90 origin-top-right')}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewSrc(previewUrls[idx]);
                    setPreviewOpen(true);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white border border-white/10 shadow-sm transition hover:bg-black/85"
                  aria-label="Open preview"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(item, previewUrls[idx]);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black border border-white/20 shadow-sm transition hover:bg-white/90"
                  aria-label="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-full opacity-90 hover:opacity-100"
                  onClick={(e) => clearImage(e, idx)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!multiple && items.length === 1) {
      const item = items[0];
      const preview = previewUrls[0];
      return (
        <div className={cn('relative h-full w-full', compact ? 'p-1' : 'p-2')}>
          <img
            src={preview}
            alt="Uploaded"
            className={cn(
              'w-full object-contain rounded-md',
              compact ? 'h-16' : 'h-full max-h-[200px]'
            )}
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewSrc(preview);
                setPreviewOpen(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white border border-white/10 shadow-sm transition hover:bg-black/85"
              aria-label="Open preview"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(item, preview);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black border border-white/20 shadow-sm transition hover:bg-white/90"
              aria-label="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={(e) => clearImage(e)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={cn('flex items-center justify-center', compact ? 'p-2' : 'p-3')}>
        <div className="rounded-full bg-white/10 p-2">
          <Upload className={cn('text-muted-foreground', compact ? 'h-4 w-4' : 'h-5 w-5')} />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/5 transition-colors hover:bg-white/10',
          compact ? 'min-h-[64px] p-2' : 'min-h-[120px]',
          isDragActive && 'border-primary bg-primary/5',
          error && 'border-destructive/50',
          (multiple ? items.length > 0 : items.length === 1) && 'border-solid border-white/20'
        )}
      >
        <input {...getInputProps()} />

        {processing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        ) : (
          renderPreview()
        )}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl bg-black/90 border border-white/10">
          {previewSrc && (
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
