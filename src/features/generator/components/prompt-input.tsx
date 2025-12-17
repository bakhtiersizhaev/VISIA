import React, { useRef } from 'react';
import { Plus, ZoomIn, X } from 'lucide-react';
import type { InputValue } from '@/types/generator-types';
import type { ModelConfig } from '@/lib/ai/models';

interface PromptInputProps {
    selectedModel: ModelConfig;
    promptValue: string;
    inputValues: Record<string, InputValue>;
    onPromptChange: (value: string) => void;
    onGenerateImage: () => void;
    onFileSelect: (files: FileList) => void;
    onRemoveRefImage: (index: number) => void;
    onPreviewImage: (src: string) => void;
}

export function PromptInput({
    selectedModel,
    promptValue,
    inputValues,
    onPromptChange,
    onGenerateImage,
    onFileSelect,
    onRemoveRefImage,
    onPreviewImage,
}: PromptInputProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Get reference images from input values
    const getReferenceImages = () => {
        const images: { file: File | string; index: number }[] = [];
        const single = inputValues['image_url'];
        const multi = inputValues['image_urls'];

        if (single instanceof File) images.push({ file: single, index: 0 });
        else if (typeof single === 'string' && single) images.push({ file: single, index: 0 });

        if (Array.isArray(multi)) {
            multi.forEach((item, idx) => {
                if (item instanceof File || (typeof item === 'string' && item)) {
                    images.push({ file: item, index: idx });
                }
            });
        }

        return images;
    };

    // Preview helper for file or URL
    const previewRef = (file: File | string) => {
        if (typeof file === 'string') return file;
        return URL.createObjectURL(file);
    };

    // Trigger file select programmatically
    const triggerHandleFileSelect = (files: FileList) => {
        onFileSelect(files);
    };

    const showImageUpload = selectedModel.inputParams?.some(
        (p) => p.name === 'image_url' || p.name === 'image_urls'
    );

    return (
        <>
            {/* Row 1: Asset Slots */}
            {showImageUpload ? (
                <div className="flex items-center gap-3 px-5 pt-5">
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
                            onChange={(e) => {
                                if (e.target.files) {
                                    onFileSelect(e.target.files);
                                }
                            }}
                            accept="image/*"
                        />
                    </div>

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
                                        onPreviewImage(previewRef(ref.file));
                                    }}
                                    className="rounded-full bg-white/20 p-1.5 hover:bg-white/40"
                                >
                                    <ZoomIn className="h-3 w-3 text-white" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveRefImage(ref.index);
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
                    value={promptValue}
                    onChange={(e) => {
                        onPromptChange(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onGenerateImage();
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
        </>
    );
}
