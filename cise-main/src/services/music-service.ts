'use server';
/**
 * @fileOverview Music service that follows the user's specified logic.
 */
import axios from 'axios';
import ytSearch from 'yt-search';

export interface Song {
  title: string;
  artist?: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

/**
 * Searches for a song using yt-search and gets a download link.
 * @param query The name of the song to search for.
 * @returns A promise that resolves to a Song object or null if not found.
 */
export async function searchAndGetSong(query: string): Promise<Song | null> {
  if (!query) {
    throw new Error('Please provide a song name.');
  }

  try {
    console.log(`[Music Service] Searching YouTube for "${query}"...`);
    
    const searchResults = await ytSearch(query);
    if (!searchResults || !searchResults.videos.length) {
        throw new Error('No videos found on YouTube.');
    }
    const topResult = searchResults.videos[0];

    const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;
    console.log(`[Music Service] Found video: ${topResult.title} (${videoUrl})`);
    
    const downloaderApiUrl = `https://akshit-api-pwht.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=audio`;
    
    const response = await axios.get(downloaderApiUrl);
        
    if (response.status !== 200 || !response.data || !response.data.file_url) {
        console.error('[Music Service] Failed to get download URL from API.', response.data);
        throw new Error('The downloader service failed to provide a link.');
    }

    const downloadUrl = response.data.file_url.replace("http:", "https:");

    return {
      title: topResult.title,
      artist: topResult.author.name,
      thumbnailUrl: topResult.thumbnail,
      downloadUrl,
    };
    
  } catch (e: any) {
    console.error('Music Service Error:', e.message);
    // Re-throw a simpler error for the UI to handle, as requested.
    throw new Error(`Failed to search for song: ${e.message}`);
  }
}
