'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function DashboardNav({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-semibold">
              SEO Writer
            </Link>
            <div className="hidden md:flex gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Articles
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 hidden sm:inline">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

