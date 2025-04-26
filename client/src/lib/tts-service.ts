/**
 * Text-to-Speech service using OpenAI's API
 * This service provides audio generation functionality by streaming content from the server
 */

// Audio state management for TTS
export type TTSPlayerState = {
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentAudioUrl: string | null;
  text: string;
};

// Cache mechanism to avoid unnecessary API calls
const audioCache = new Map<string, string>();

/**
 * Generate speech from text using OpenAI's TTS API
 * @param text The text to convert to speech
 * @param cacheKey Optional key for caching
 * @returns Promise with audio URL
 */
export const generateSpeech = async (text: string, cacheKey?: string): Promise<string> => {
  const key = cacheKey || text.substring(0, 100);
  
  // Check cache first
  if (audioCache.has(key)) {
    return audioCache.get(key)!;
  }
  
  try {
    // Request audio generation from our server endpoint
    const response = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }
    
    const { audioUrl } = await response.json();
    
    // Cache the result
    audioCache.set(key, audioUrl);
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
};

/**
 * Clear audio from the cache
 * @param key The cache key to clear
 */
export const clearAudioCache = (key?: string) => {
  if (key) {
    audioCache.delete(key);
  } else {
    audioCache.clear();
  }
};