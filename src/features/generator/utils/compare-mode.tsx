import * as React from 'react';
import { Layers, Check, ChevronDown } from 'lucide-react';
import { AI_MODELS, ModelConfig } from '@/lib/ai/models';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CompareModeSelectorProps {
    enabled: boolean;
    selectedModels: Set<string>;
    onToggle: () => void;
    onModelToggle: (modelId: string) => void;
    maxModels?: number;
}

export function CompareModeSelector({
    enabled,
    selectedModels,
    onToggle,
    onModelToggle,
    maxModels = 5,
}: CompareModeSelectorProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg border transition-all',
                        enabled
                            ? 'border-purple-500/50 bg-purple-500/20 text-purple-400'
                            : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                    )}
                    title={enabled ? 'Compare Mode ON' : 'Compare Models'}
                >
                    <Layers className="h-4 w-4" />
                    {enabled && selectedModels.size > 1 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                            {selectedModels.size}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[300px] border-white/10 bg-[#0a0a0a] p-3 shadow-xl"
            >
                {/* Header with Toggle */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Compare Models</span>
                    <button
                        onClick={onToggle}
                        className={cn(
                            'h-6 w-11 rounded-full p-0.5 transition-colors',
                            enabled ? 'bg-purple-500' : 'bg-white/20'
                        )}
                    >
                        <div
                            className={cn(
                                'h-5 w-5 rounded-full bg-white transition-transform',
                                enabled ? 'translate-x-5' : 'translate-x-0'
                            )}
                        />
                    </button>
                </div>

                {/* Description */}
                <p className="mb-3 text-xs text-white/50">
                    {enabled
                        ? 'Select models to generate with the same prompt'
                        : 'Enable to generate with multiple models at once'}
                </p>

                {/* Model List */}
                <div className="space-y-1">
                    {AI_MODELS.map((model) => {
                        const isSelected = selectedModels.has(model.id);
                        const isDisabled = !enabled || (!isSelected && selectedModels.size >= maxModels);

                        return (
                            <button
                                key={model.id}
                                onClick={() => enabled && onModelToggle(model.id)}
                                disabled={isDisabled && !isSelected}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                                    enabled
                                        ? isSelected
                                            ? 'bg-purple-500/20 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        : 'cursor-not-allowed text-white/30'
                                )}
                            >
                                {/* Checkbox */}
                                <div
                                    className={cn(
                                        'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                                        enabled
                                            ? isSelected
                                                ? 'border-purple-500 bg-purple-500'
                                                : 'border-white/30 bg-transparent'
                                            : 'border-white/10 bg-transparent'
                                    )}
                                >
                                    {isSelected && enabled && <Check className="h-3 w-3 text-white" />}
                                </div>

                                {/* Model Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium">{model.name}</div>
                                    <div className="truncate text-[10px] text-white/40">
                                        {model.description}
                                    </div>
                                </div>

                                {/* Price */}
                                {model.basePriceUsd && (
                                    <span className="text-[10px] text-white/40">
                                        ~{Math.ceil((model.basePriceUsd * 1.2) / 0.01)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                {enabled && selectedModels.size > 0 && (
                    <div className="mt-3 border-t border-white/10 pt-3 text-center text-xs text-white/50">
                        {selectedModels.size} model{selectedModels.size > 1 ? 's' : ''} selected
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

/**
 * Normalize aspect ratio to canonical format
 * Maps different naming conventions to a common format
 */
const ASPECT_RATIO_MAP: Record<string, string> = {
    // Standard format
    '1:1': '1:1',
    '16:9': '16:9',
    '9:16': '9:16',
    '4:3': '4:3',
    '3:4': '3:4',
    '3:2': '3:2',
    '2:3': '2:3',
    '5:4': '5:4',
    '4:5': '4:5',
    '21:9': '21:9',
    // Seedream format -> Standard
    'square_hd': '1:1',
    'square': '1:1',
    'landscape_16_9': '16:9',
    'portrait_16_9': '9:16',
    'landscape_4_3': '4:3',
    'portrait_4_3': '3:4',
    // Keep auto options as-is (they won't match)
    'auto_2K': 'auto_2K',
    'auto_4K': 'auto_4K',
};

/**
 * Reverse map: canonical format -> model-specific format
 */
const CANONICAL_TO_MODEL_MAP: Record<string, Record<string, string>> = {
    '1:1': { 'aspect_ratio': '1:1', 'image_size': 'square_hd' },
    '16:9': { 'aspect_ratio': '16:9', 'image_size': 'landscape_16_9' },
    '9:16': { 'aspect_ratio': '9:16', 'image_size': 'portrait_16_9' },
    '4:3': { 'aspect_ratio': '4:3', 'image_size': 'landscape_4_3' },
    '3:4': { 'aspect_ratio': '3:4', 'image_size': 'portrait_4_3' },
};

/**
 * Get common aspect ratios across selected models
 * Normalizes different format styles (1:1 vs square_hd) to find intersections
 */
export function getCommonAspectRatios(selectedModelIds: Set<string>): string[] {
    if (selectedModelIds.size === 0) return [];

    const models = AI_MODELS.filter((m) => selectedModelIds.has(m.id));
    if (models.length === 0) return [];

    // Get normalized aspect ratio sets for each model
    const normalizedSets: Set<string>[] = models.map((model) => {
        const aspectParam = model.inputParams?.find(
            (p) => p.name === 'aspect_ratio' || p.name === 'image_size'
        );
        const options = aspectParam?.options || [];

        // Normalize each option to canonical format
        const normalized = new Set<string>();
        for (const opt of options) {
            const canonical = ASPECT_RATIO_MAP[opt];
            if (canonical) {
                normalized.add(canonical);
            }
        }
        return normalized;
    });

    // Find intersection of all sets
    if (normalizedSets.length === 0) return [];

    let common = normalizedSets[0];
    for (let i = 1; i < normalizedSets.length; i++) {
        common = new Set(Array.from(common).filter((x) => normalizedSets[i].has(x)));
    }

    return Array.from(common);
}

/**
 * Get model-specific aspect ratio value from canonical format
 */
export function getModelAspectRatioValue(canonical: string, paramName: string): string {
    const mapping = CANONICAL_TO_MODEL_MAP[canonical];
    if (mapping && mapping[paramName]) {
        return mapping[paramName];
    }
    // Fallback to canonical
    return canonical;
}

/**
 * Check if all selected models support num_images
 */
export function allModelsSupportsNumImages(selectedModelIds: Set<string>): boolean {
    if (selectedModelIds.size === 0) return true;

    const models = AI_MODELS.filter((m) => selectedModelIds.has(m.id));
    return models.every((model) =>
        model.inputParams?.some((p) => p.name === 'num_images')
    );
}
