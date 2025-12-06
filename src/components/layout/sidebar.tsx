'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    LayoutDashboard,
    images,
    Settings,
    Menu,
    Zap,
    LogOut,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';

const routes = [
    {
        label: 'Generate',
        icon: Sparkles,
        href: '/',
        color: 'text-sky-500',
    },
    {
        label: 'Gallery',
        icon: images,
        href: '/gallery',
        color: 'text-violet-500',
    },
    {
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        color: 'text-pink-700',
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#050907] border-r border-white/10 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Logo placeholder - replace with actual logo later */}
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <Zap className="w-8 h-8 text-primary relative z-10" fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                        VISIA
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                                pathname === route.href
                                    ? 'text-white bg-white/10'
                                    : 'text-zinc-400'
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Token Balance Card */}
            <div className="px-3">
                <div className="bg-gradient-to-br from-primary/10 to-primary/0 border border-primary/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-primary" fill="currentColor" />
                        <span className="text-sm font-semibold text-primary-foreground/90">Pro Plan</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-zinc-400">Available Credits</p>
                            <p className="text-2xl font-bold text-white">1,420</p>
                        </div>
                        <Button size="sm" variant="secondary" className="h-7 text-xs">
                            Top Up
                        </Button>
                    </div>
                </div>
            </div>

            {/* User Profile Teaser */}
            <div className="px-3 py-2 border-t border-white/5">
                <div className="flex items-center gap-x-3 p-2 rounded-lg hover:bg-white/5 transition cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                        <span className="text-xs font-bold">U</span>
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium text-white">User</span>
                        <span className="text-xs text-zinc-500">user@visia.ai</span>
                    </div>
                    <LogOut className="w-4 h-4 text-zinc-500 hover:text-red-400 transition" />
                </div>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch
    if (typeof window !== 'undefined' && !isMounted) {
        setIsMounted(true);
    }

    // if (!isMounted) return null; // Optional: clean hydration handling

    return (
        <Sheet>
            <SheetTrigger>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#050907] border-white/10">
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}
