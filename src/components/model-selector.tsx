import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
          className="w-full justify-between"
        >
          {selectedModel ? selectedModel.name : 'Select model...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover border-border shadow-xl">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {AI_MODELS.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.name}
                  onSelect={() => {
                    onSelect(model);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedModel.id === model.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {model.type}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
