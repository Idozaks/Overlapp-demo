import OpenAI from "openai";
import { log } from "./vite";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EnrichInterestsResponse {
  suggestions: Array<{
    name: string;
    emoji: string;
  }>;
}

export async function enrichInterests(interests: string[]): Promise<EnrichInterestsResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying related interests and hobbies. Your task is to suggest highly relevant, specific interests based on a user's current interests, and pair each with the most appropriate emoji. Ensure all JSON is perfectly formatted and valid. Always include both the 'name' and 'emoji' fields for each suggestion."
        },
        {
          role: "user",
          content: `Based on these interests: ${interests.join(", ")}, generate 15-20 highly specific and related new interest suggestions.

For each suggestion:
1. Choose a single, visually distinct emoji that best represents the interest
2. Use widely supported Unicode emojis that render well on mobile devices
3. Ensure each suggestion is unique and not a duplicate of existing interests
4. Format your response as perfect, valid JSON with the exact structure shown below

Examples of good emoji-interest pairings:
- 📚 Books (general reading)
- 🧠 Philosophy (intellectual pursuits)
- 🎨 Painting (visual arts)
- 🏃 Running (specific fitness activity)
- 🌱 Gardening (plant cultivation)
- 🎸 Guitar (specific instrument)
- 💻 Programming (technical skill)
- 🍳 Cooking (food preparation)
- 🎭 Theater (performing arts)
- 🔭 Astronomy (scientific field)

Respond ONLY with valid JSON in exactly this format:
{"suggestions": [{"name": "Interest Name 1", "emoji": "🔍"}, {"name": "Interest Name 2", "emoji": "🎯"}, ...]}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Filter out duplicates and original interests
    const suggestions = Array.isArray(parsed.suggestions) 
      ? parsed.suggestions
          .filter((s: { name: string }) => !interests.includes(s.name))
          .map((s: { name: string, emoji: string }) => ({
            name: s.name.trim(),
            emoji: s.emoji.trim()
          }))
          .filter((s: { name: string }) => s.name.length > 0)
      : [];

    log("[OpenAI] Generated suggestions:", suggestions);
    return { suggestions };
  } catch (error) {
    log("[OpenAI] Error enriching interests:", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to enrich interests");
  }
}