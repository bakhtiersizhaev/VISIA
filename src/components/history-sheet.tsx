'use client';

import * as React from 'react';
import { History, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface HistoryItem {
    id: string;
    url: string;
    prompt: string;
    modelId: string;
    timestamp: number;
}

interface HistorySheetProps {
    history: HistoryItem[];
    onClear: () => void;
    onSelect?: (item: HistoryItem) => void;
}

export function HistorySheet({ history, onClear, onSelect }: HistorySheetProps) {
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    const copyPrompt = (e: React.MouseEvent, text: string, id: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <History className="h-5 w-5" />
                    {history.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {history.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-l border-white/10">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>History</SheetTitle>
                        {history.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                    <SheetDescription>
                        Your recent generations. Click to view or copy prompt.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                            <History className="mb-4 h-12 w-12 opacity-20" />
                            <p>No history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                                >
                                    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black/20">
                                        <img
                                            src={item.url}
                                            alt={item.prompt}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="line-clamp-2 text-sm text-foreground/90 font-medium">
                                                {item.prompt}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                                onClick={(e) => copyPrompt(e, item.prompt, item.id)}
                                            >
                                                {copiedId === item.id ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{item.modelId.split('/').pop()}</span>
                                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
