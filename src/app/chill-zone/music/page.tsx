
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Music, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { searchAndGetSong, type Song } from '@/services/music-service';
import { MusicPlayer } from '@/components/chill-zone/music-player';

export default function MusicZonePage() {
  const [query, setQuery] = useState('');
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsLoading(true);
    setSong(null);
    try {
      const result = await searchAndGetSong(query);
      if (!result) {
        throw new Error('Song not found.');
      }
      setSong(result);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not fetch song. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href="/chill-zone" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Chill Zone
      </Link>
      
      <header className="text-center my-8">
        <h1 className="font-headline text-4xl font-bold">Music Zone</h1>
        <p className="text-lg text-muted-foreground mt-2">Search for a song to play.</p>
      </header>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a song name..."
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music className="h-5 w-5" />}
              <span className="ml-2 hidden md:inline">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Searching for your song...</p>
        </div>
      )}

      {song && (
        <MusicPlayer song={song} />
      )}

    </div>
  );
}
