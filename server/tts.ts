import OpenAI from "openai";
import { createWriteStream } from "fs";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { log } from "./vite";

// Create OpenAI client using the API key from environment
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// Create a directory for audio files if it doesn't exist
const audioDirectory = path.join(process.cwd(), "public", "audio");
if (!fs.existsSync(audioDirectory)) {
  fs.mkdirSync(audioDirectory, { recursive: true });
  log("[TTS] Created audio directory at", audioDirectory);
}

/**
 * Generate speech from text using OpenAI's TTS API
 * 
 * @param text The text to convert to speech
 * @returns Path to the generated audio file
 */
export async function generateSpeech(text: string): Promise<string> {
  try {
    // Generate hash for the text to use as filename
    const hash = crypto.createHash("md5").update(text).digest("hex");
    const fileName = `tts-${hash}.mp3`;
    const filePath = path.join(audioDirectory, fileName);
    const fileUrl = `/audio/${fileName}`;
    
    // Check if we already have this audio generated
    if (fs.existsSync(filePath)) {
      log(`[TTS] Using cached audio file: ${fileName}`);
      return fileUrl;
    }
    
    log(`[TTS] Generating speech for text (${text.length} chars)`);
    
    // Generate speech using OpenAI's TTS API
    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // OpenAI's TTS model
      voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
      input: text,
    });
    
    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Save the audio file
    fs.writeFileSync(filePath, buffer);
    log(`[TTS] Generated and saved audio to ${fileName}`);
    
    return fileUrl;
  } catch (error) {
    log("[TTS] Error generating speech:", error);
    throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : String(error)}`);
  }
}