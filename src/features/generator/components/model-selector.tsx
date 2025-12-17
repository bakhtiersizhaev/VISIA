import React from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { AI_MODELS, type ModelConfig } from '@/lib/ai/models';

interface ModelSelectorProps {
    selectedModel: ModelConfig;
    compareMode: boolean;
    selectedModels: Set<string>;
    onModelSelect: (model: ModelConfig) => void;
}

export function ModelSelector({
    selectedModel,
    compareMode,
    selectedModels,
    onModelSelect,
}: ModelSelectorProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
                    <Sparkles className="text-purple-400 h-4 w-4" />
                    {compareMode && selectedModels.size > 1
                        ? `${selectedModels.size} Models`
                        : selectedModel.name}
                    <ChevronDown className="h-3.5 w-3.5 text-white/40" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[280px] border-white/10 bg-[#0a0a0a] p-2 shadow-xl"
            >
                {AI_MODELS.map((model) => (
                    <div
                        key={model.id}
                        onClick={() => onModelSelect(model)}
                        className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors',
                            selectedModel.id === model.id
                                ? 'bg-white/10 text-white'
                                : 'hover:bg-white/5 text-white/70'
                        )}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm">
                            {model.id.includes('nano') ? '⚡' : '🎨'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white">
                                {model.name}
                            </div>
                            <div className="truncate text-[11px] text-zinc-500">
                                {model.description}
                            </div>
                        </div>
                    </div>
                ))}
            </PopoverContent>
        </Popover>
    );
}
