import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-semibold">SEO Writer</div>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 max-w-7xl">
        <div className="py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Generate SEO-Optimized Articles with AI
            </h1>
            
            <p className="text-xl text-neutral-600 leading-relaxed">
              Transform topics into comprehensive, SEO-optimized articles. 
              Powered by advanced AI agents for research, writing, and optimization.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <Button asChild size="lg">
                <Link href="/signup">Start Writing</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-20 border-t">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-2xl">
                ✍️
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Writing</h3>
              <p className="text-neutral-600">
                Multiple AI agents work together to research, outline, and write comprehensive articles.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-2xl">
                🎯
              </div>
              <h3 className="text-xl font-semibold">SEO Optimized</h3>
              <p className="text-neutral-600">
                Automatic title optimization, meta descriptions, and keyword integration for better rankings.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
              <h3 className="text-xl font-semibold">Edit & Export</h3>
              <p className="text-neutral-600">
                Edit generated content and export to Markdown for easy publishing anywhere.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-20 border-t">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="text-neutral-600">
              Create your account and start generating SEO-optimized articles today.
            </p>
            <Button asChild size="lg">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <p className="text-center text-sm text-neutral-500">
            © {new Date().getFullYear()} SEO Writer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
