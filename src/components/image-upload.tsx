'use client';

import * as React from 'react';
import { Upload, X, Loader2, Download, ZoomIn } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { fal } from '@fal-ai/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (url: string | string[]) => void;
    className?: string;
    multiple?: boolean;
}

export function ImageUpload({ value, onChange, className, multiple = false }: ImageUploadProps) {
    const [uploading, setUploading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
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

    const handleUpload = React.useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;

            setUploading(true);
            setError(null);

            try {
                const uploadPromises = files.map((file) => fal.storage.upload(file));
                const urls = await Promise.all(uploadPromises);

                if (multiple) {
                    const currentValues = Array.isArray(value) ? value : value ? [value] : [];
                    onChange([...currentValues, ...urls]);
                } else {
                    onChange(urls[0]);
                }
            } catch (err: unknown) {
                console.error('Upload error:', err);
                setError('Failed to upload image');
            } finally {
                setUploading(false);
            }
        },
        [onChange, multiple, value]
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
        maxFiles: multiple ? 4 : 1, // Limit to 4 for now if multiple
        multiple,
    });

    // Handle paste events
    React.useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const files: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
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
        if (multiple && Array.isArray(value)) {
            if (typeof index === 'number') {
                const newValues = [...value];
                newValues.splice(index, 1);
                onChange(newValues);
            } else {
                onChange([]);
            }
        } else {
            onChange('');
        }
    };

    const renderPreview = () => {
        if (multiple && Array.isArray(value) && value.length > 0) {
            return (
                <div className="grid grid-cols-2 gap-2 p-2 w-full">
                    {value.map((url, idx) => (
                        <div key={url} className="relative aspect-square">
                            <img
                                src={url}
                                alt={`Uploaded ${idx}`}
                                className="h-full w-full object-cover rounded-md border border-white/10"
                            />
                            <div className="absolute right-1 top-1 flex gap-1">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewSrc(url);
                                        setPreviewOpen(true);
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white border border-white/10 shadow-sm transition hover:bg-black/85"
                                    aria-label="Открыть превью"
                                >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadImage(url);
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black border border-white/20 shadow-sm transition hover:bg-white/90"
                                    aria-label="Скачать"
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

        if (!multiple && typeof value === 'string' && value) {
            return (
                <div className="relative h-full w-full p-2">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="h-full max-h-[200px] w-full object-contain rounded-md"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreviewSrc(value);
                                setPreviewOpen(true);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white border border-white/10 shadow-sm transition hover:bg-black/85"
                            aria-label="Открыть превью"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(value);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black border border-white/20 shadow-sm transition hover:bg-white/90"
                            aria-label="Скачать"
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
            <div className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="rounded-full bg-white/10 p-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">
                        Click to upload, drag & drop, or paste (Ctrl+V)
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {multiple ? 'Up to 4 images' : 'Single image'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className={cn('w-full', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/5 transition-colors hover:bg-white/10',
                    isDragActive && 'border-primary bg-primary/5',
                    error && 'border-destructive/50',
                    ((!multiple && value) || (multiple && Array.isArray(value) && value.length > 0)) && 'border-solid border-white/20'
                )}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
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
