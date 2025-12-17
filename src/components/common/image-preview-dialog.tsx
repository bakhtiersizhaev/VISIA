/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImagePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    src: string | null;
}

export function ImagePreviewDialog({
    open,
    onOpenChange,
    src,
}: ImagePreviewDialogProps) {
    if (!src) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-none">
                <DialogTitle className="sr-only">Image preview</DialogTitle>
                <DialogDescription className="sr-only">
                    Enlarged preview of the generated or reference image.
                </DialogDescription>
                <div className="relative h-full w-full flex items-center justify-center">

                    {/* Close button for convenience (though clicking outside works too) */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <img
                        src={src}
                        alt="Preview"
                        className="h-full w-full cursor-pointer object-contain transition-transform duration-300"
                        onClick={() => onOpenChange(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
