import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  loading,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-2">
      <Textarea
        placeholder="Describe your imagination... (e.g. A futuristic city with flying cars, cyberpunk style)"
        className="border-white/10 bg-white/5 backdrop-blur-sm focus-visible:ring-primary/50 min-h-[120px] resize-none pr-12 text-base shadow-sm transition-all focus-visible:ring-2 hover:bg-white/10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute bottom-3 right-3">
        <Button
          size="icon"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="h-8 w-8 transition-all hover:scale-105 active:scale-95"
        >
          <Wand2 className={loading ? 'animate-spin' : ''} size={16} />
        </Button>
      </div>
    </div>
  );
}
