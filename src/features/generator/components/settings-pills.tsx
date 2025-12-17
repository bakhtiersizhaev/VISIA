import React from 'react';
import {
    Globe,
    RectangleHorizontal,
    Maximize2,
    Copy,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ModelConfig } from '@/lib/ai/models';
import type { InputValue } from '@/types/generator-types';
import { AspectRatioIcon, getAspectRatioDisplayName } from '@/features/generator/utils/aspect-ratio';
import { getCommonAspectRatios, allModelsSupportsNumImages } from '@/features/generator/utils/compare-mode';

interface SettingsPillsProps {
    selectedModel: ModelConfig;
    inputValues: Record<string, InputValue>;
    compareMode: boolean;
    selectedModels: Set<string>;
    onInputChange: (name: string, value: InputValue) => void;
}

export function SettingsPills({
    selectedModel,
    inputValues,
    compareMode,
    selectedModels,
    onInputChange,
}: SettingsPillsProps) {
    // In Compare Mode with multiple models, show common settings
    if (compareMode && selectedModels.size > 1) {
        const commonAspectRatios = getCommonAspectRatios(selectedModels);
        const showNumImages = allModelsSupportsNumImages(selectedModels);

        return (
            <>
                {/* Common Aspect Ratio Pill */}
                {commonAspectRatios.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm font-medium transition-colors hover:bg-white/10 text-white"
                                title="Aspect Ratio"
                            >
                                <RectangleHorizontal className="h-3.5 w-3.5 text-white/50" />
                                <span className="text-white">
                                    {String(inputValues['aspect_ratio'] ?? inputValues['image_size'] ?? commonAspectRatios[0])}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[160px] border-white/10 bg-[#0a0a0a] p-2 shadow-xl">
                            <div className="mb-2 px-2 text-[10px] text-white/40 uppercase tracking-wide">
                                Aspect Ratio
                            </div>
                            <div className="space-y-0.5">
                                {commonAspectRatios.map((opt) => (
                                    <div
                                        key={opt}
                                        onClick={() => {
                                            onInputChange('aspect_ratio', opt);
                                            onInputChange('image_size', opt);
                                        }}
                                        className={cn(
                                            'cursor-pointer rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                                            (inputValues['aspect_ratio'] === opt || inputValues['image_size'] === opt)
                                                ? 'bg-purple-500/20 text-purple-300'
                                                : 'text-white hover:bg-white/10'
                                        )}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {/* Num Images Pill (only if all models support it) */}
                {showNumImages && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm font-medium transition-colors hover:bg-white/10 text-white"
                                title="Number of Images"
                            >
                                <Copy className="h-3.5 w-3.5 text-white/50" />
                                <span className="text-white">
                                    {String(inputValues['num_images'] ?? 1)}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[120px] border-white/10 bg-[#0a0a0a] p-2 shadow-xl">
                            <div className="mb-2 px-2 text-[10px] text-white/40 uppercase tracking-wide">
                                Images
                            </div>
                            <input
                                type="number"
                                min={1}
                                max={4}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
                                value={String(inputValues['num_images'] ?? 1)}
                                onChange={(e) => onInputChange('num_images', Number(e.target.value))}
                            />
                        </PopoverContent>
                    </Popover>
                )}

                {/* Warning if no common settings */}
                {commonAspectRatios.length === 0 && (
                    <span className="text-xs text-yellow-500/70">
                        ⚠ No common aspect ratios
                    </span>
                )}
            </>
        );
    }

    // Normal mode - show selected model's settings
    return (
        <>
            {selectedModel.inputParams
                ?.filter((p) => !['prompt', 'image_url', 'image_urls'].includes(p.name))
                .map((param) => {
                    // Boolean type - render as compact icon button
                    if (param.type === 'boolean') {
                        const isEnabled = Boolean(inputValues[param.name] ?? param.default);
                        return (
                            <button
                                key={param.name}
                                onClick={() => onInputChange(param.name, !isEnabled)}
                                className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg border transition-all',
                                    isEnabled
                                        ? 'border-purple-500/50 bg-purple-500/20 text-purple-400'
                                        : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                                )}
                                title={`${param.label}${param.description ? ': ' + param.description : ''}`}
                            >
                                <Globe className="h-4 w-4" />
                            </button>
                        );
                    }

                    // Get icon based on param name
                    const getParamIcon = (name: string) => {
                        switch (name) {
                            case 'aspect_ratio':
                            case 'image_size':
                                return <RectangleHorizontal className="h-3.5 w-3.5" />;
                            case 'resolution':
                                return <Maximize2 className="h-3.5 w-3.5" />;
                            case 'num_images':
                                return <Copy className="h-3.5 w-3.5" />;
                            default:
                                return null;
                        }
                    };

                    // Check if this is an aspect ratio parameter
                    const isAspectRatio = param.name === 'aspect_ratio' || param.name === 'image_size';
                    const currentValue = String(inputValues[param.name] ?? param.default ?? '');

                    // Other types - compact popover with icon + value only
                    return (
                        <Popover key={param.name}>
                            <PopoverTrigger asChild>
                                <button
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm font-medium transition-colors hover:bg-white/10 text-white"
                                    title={param.label}
                                >
                                    {isAspectRatio ? (
                                        <AspectRatioIcon ratio={currentValue} className="text-white/50" />
                                    ) : (
                                        <span className="text-white/50">{getParamIcon(param.name)}</span>
                                    )}
                                    <span className="text-white">
                                        {isAspectRatio ? getAspectRatioDisplayName(currentValue) : currentValue}
                                    </span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className={cn(
                                "border-white/10 bg-[#0a0a0a] p-2 shadow-xl",
                                isAspectRatio ? "w-[180px]" : "w-[160px]"
                            )}>
                                <div className="mb-2 px-2 text-[10px] text-white/40 uppercase tracking-wide">
                                    {param.label}
                                </div>
                                {param.type === 'select' ? (
                                    <div className="space-y-0.5">
                                        {param.options?.map((opt) => (
                                            <div
                                                key={opt}
                                                onClick={() => onInputChange(param.name, opt)}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                                                    inputValues[param.name] === opt
                                                        ? 'bg-purple-500/20 text-purple-300'
                                                        : 'text-white hover:bg-white/10'
                                                )}
                                            >
                                                {isAspectRatio && (
                                                    <AspectRatioIcon
                                                        ratio={opt}
                                                        className={inputValues[param.name] === opt ? 'text-purple-400' : 'text-white/40'}
                                                    />
                                                )}
                                                <span>{isAspectRatio ? getAspectRatioDisplayName(opt) : opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={param.type}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500"
                                        value={String(inputValues[param.name] ?? '')}
                                        onChange={(e) =>
                                            onInputChange(
                                                param.name,
                                                param.type === 'number'
                                                    ? Number(e.target.value)
                                                    : e.target.value
                                            )
                                        }
                                    />
                                )}
                            </PopoverContent>
                        </Popover>
                    );
                })}
        </>
    );
}
