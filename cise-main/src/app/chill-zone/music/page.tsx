'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function MusicRedirectPage() {

  useEffect(() => {
    window.location.href = 'https://music.inlinks.site';
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4 p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-headline font-bold">Redirecting to Music Zone</h1>
            <p className="text-muted-foreground">Please wait while we take you to our dedicated music platform.</p>
            <p className="text-sm text-muted-foreground">
                If you are not redirected automatically, <a href="https://music.inlinks.site" className="underline text-primary hover:text-primary/80">click here</a>.
            </p>
        </div>
    </div>
  );
}
