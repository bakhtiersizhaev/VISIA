import React from 'react';
import {
    Loader2,
    Download,
    X,
    ZoomIn,
    Sparkles,
    Square,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GenerationJob } from '@/types/generator-types';

interface JobCardProps {
    job: GenerationJob;
    onCancel?: () => void;
    onRemove?: () => void;
    onPreview: (src: string) => void;
}

export function JobCard({ job, onCancel, onRemove, onPreview }: JobCardProps) {
    const isRunning = job.status === 'running' || job.status === 'pending';
    const isDone = job.status === 'done';
    const isError = job.status === 'error';

    // Adaptive grid classes based on image count
    const getGridClasses = (count: number) => {
        if (count === 1) return 'flex justify-center';
        if (count === 2) return 'grid grid-cols-2 gap-4 max-w-2xl mx-auto';
        if (count === 3) return 'grid grid-cols-3 gap-4 max-w-3xl mx-auto';
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
    };

    return (
        <div
            className={cn(
                'rounded-2xl border p-5 transition-all duration-300',
                isRunning && 'border-purple-500/30 bg-purple-500/5',
                isDone && 'border-white/10 bg-white/5',
                isError && 'border-red-500/30 bg-red-500/5'
            )}
        >
            {/* Job Header */}
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">
                            {job.model.name}
                        </span>
                        {isRunning && (
                            <span className="flex items-center gap-1 text-purple-400">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs">Generating...</span>
                            </span>
                        )}
                        {isDone && (
                            <span className="flex items-center gap-1 text-green-400">
                                <Sparkles className="h-3 w-3" />
                                <span className="text-xs">Complete</span>
                            </span>
                        )}
                        {isError && (
                            <span className="flex items-center gap-1 text-red-400">
                                <X className="h-3 w-3" />
                                <span className="text-xs">Failed</span>
                            </span>
                        )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-white/80">{job.prompt}</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Timer */}
                    <div className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="h-3 w-3" />
                        <span>{job.elapsedTime.toFixed(1)}s</span>
                    </div>

                    {/* Cancel/Remove Button */}
                    {isRunning && onCancel && (
                        <button
                            onClick={onCancel}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                            title="Cancel"
                        >
                            <Square className="h-3 w-3" fill="currentColor" />
                        </button>
                    )}
                    {!isRunning && onRemove && (
                        <button
                            onClick={onRemove}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                            title="Remove"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Indicator for Running Jobs */}
            {isRunning && (
                <div className="mb-4">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                            style={{
                                width: '100%',
                                animation: 'pulse 2s ease-in-out infinite',
                            }}
                        />
                    </div>
                    {job.logs.length > 0 && (
                        <p className="mt-2 truncate text-xs text-white/40">
                            {job.logs[job.logs.length - 1]}
                        </p>
                    )}
                </div>
            )}

            {/* Error Message */}
            {isError && job.error && (
                <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {job.error}
                </div>
            )}

            {/* Images Grid */}
            {isDone && job.images.length > 0 && (
                <div className={getGridClasses(job.images.length)}>
                    {job.images.map((img, idx) => (
                        <div key={img} className="group relative">
                            <img
                                src={img}
                                alt={`Generated ${idx + 1}`}
                                className={cn(
                                    'cursor-zoom-in rounded-xl border border-white/10 shadow-lg object-cover transition-transform hover:scale-[1.02]',
                                    job.images.length === 1 ? 'max-h-[50vh] w-auto' : 'aspect-square w-full'
                                )}
                                onClick={() => onPreview(img)}
                            />
                            <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPreview(img);
                                    }}
                                    className="rounded-full bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                                <button
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
                                    className="rounded-full bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
