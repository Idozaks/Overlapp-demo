import OpenAI from "openai";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Create OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(process.cwd(), 'public', 'tts-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Define voice options
const VOICE_OPTIONS = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type TTSVoice = typeof VOICE_OPTIONS[number];

// Default TTS settings
const DEFAULT_VOICE: TTSVoice = "nova";
const DEFAULT_MODEL = "tts-1";

/**
 * Generate a speech file from text input
 * @param text The text to convert to speech
 * @param options Optional configuration parameters
 * @returns Path to the generated audio file
 */
export async function generateSpeech(
  text: string,
  options?: {
    voice?: TTSVoice;
    model?: string;
    speed?: number;
    forceRefresh?: boolean;
  }
): Promise<string> {
  // Sanitize and normalize options
  const voice = options?.voice && VOICE_OPTIONS.includes(options.voice) ? options.voice : DEFAULT_VOICE;
  const model = options?.model || DEFAULT_MODEL;
  const speed = options?.speed || 1.0;
  const forceRefresh = options?.forceRefresh || false;
  
  // Generate a unique hash for the text and options combination
  const hash = crypto
    .createHash('md5')
    .update(`${text}-${voice}-${model}-${speed}`)
    .digest('hex');
  
  const cacheFilePath = path.join(CACHE_DIR, `${hash}.mp3`);
  
  // Check cache if not forcing refresh
  if (!forceRefresh && fs.existsSync(cacheFilePath)) {
    return `/tts-cache/${hash}.mp3`;
  }
  
  try {
    // Generate speech with OpenAI
    const mp3 = await openai.audio.speech.create({
      model: model,
      voice: voice,
      input: text,
      speed: speed,
    });
    
    // Convert to Buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Save to file
    fs.writeFileSync(cacheFilePath, buffer);
    
    // Return the URL path
    return `/tts-cache/${hash}.mp3`;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech audio');
  }
}

/**
 * Split text into smaller chunks suitable for TTS processing
 * @param text The text to split
 * @param maxLength Maximum character length per chunk
 * @returns Array of text chunks
 */
export function splitTextForTTS(text: string, maxLength: number = 4000): string[] {
  // If text is short enough, return as is
  if (text.length <= maxLength) {
    return [text];
  }
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed max length, save current chunk and start a new one
    if (currentChunk.length + sentence.length > maxLength) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      // Otherwise add the sentence to the current chunk
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}