import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AI_MODELS, ModelConfig } from '@/lib/models';

interface ModelSelectorProps {
  selectedModel: ModelConfig;
  onSelect: (model: ModelConfig) => void;
}

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
        >
          {selectedModel ? selectedModel.name : 'Select model...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1 z-[100] bg-zinc-950 border border-zinc-800 shadow-2xl">
        <div className="flex flex-col gap-1">
          {AI_MODELS.map((model) => (
            <div
              key={model.id}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-zinc-800 hover:text-white",
                selectedModel.id === model.id && "bg-zinc-800 text-white"
              )}
              onClick={() => {
                onSelect(model);
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedModel.id === model.id ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="flex flex-col">
                <span className="font-medium">{model.name}</span>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
