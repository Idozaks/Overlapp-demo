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
          content: "You are a JSON API endpoint that returns interest suggestions in a specific format. You must respond with ONLY valid JSON containing an array of interests with name and emoji fields. No explanations, comments, or extra text. Your JSON must match the required schema exactly."
        },
        {
          role: "user",
          content: `I need to generate interest suggestions based on these existing interests: ${interests.join(", ")}.

IMPORTANT RULES:
1. Respond with EXACTLY 15 interest suggestions
2. Include ONLY the required JSON format shown below - no explanations or other text
3. Each suggestion MUST have both a "name" field (string) and "emoji" field (single Unicode emoji)
4. Choose widely supported emojis that display well on mobile
5. Do not duplicate any existing interests in the suggestions

EXAMPLE RESPONSE FORMAT:
{
  "suggestions": [
    {"name": "Travel Photography", "emoji": "📸"},
    {"name": "Mountain Hiking", "emoji": "🏔️"},
    {"name": "Jazz Music", "emoji": "🎷"},
    {"name": "Italian Cooking", "emoji": "🍝"},
    {"name": "Urban Sketching", "emoji": "✏️"}
  ]
}

YOUR RESPONSE MUST BE VALID JSON MATCHING THIS EXACT STRUCTURE.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    
    console.log("[OpenAI] Raw response content:", content);
    
    const parsed = JSON.parse(content);
    console.log("[OpenAI] Parsed JSON response:", parsed);

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