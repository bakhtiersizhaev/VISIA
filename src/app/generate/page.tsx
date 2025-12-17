'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { GeneratorUI } from '@/features/generator/components/generator-ui';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();
    const supabase = React.useMemo(() => createClient(), []);

    React.useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data.user) {
                router.push('/login');
                return;
            }
            setUser(data.user);
            setLoading(false);
        };
        void init();
    }, [supabase, router]);

    if (loading) {
        return (
            <div className="animated-bg flex min-h-screen items-center justify-center">
                <Sparkles className="h-8 w-8 animate-bounce text-purple-400" />
            </div>
        );
    }

    if (user) {
        return <GeneratorUI user={user} />;
    }

    return null;
}
