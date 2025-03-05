import OpenAI from "openai";
import { log } from "./vite";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EnrichInterestsResponse {
  suggestions: string[];
}

export async function enrichInterests(interests: string[]): Promise<EnrichInterestsResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying related interests and hobbies. For each interest provided, suggest 2-3 very specific and related interests or sub-categories. Keep suggestions concise and focused."
        },
        {
          role: "user",
          content: `For each of these interests, suggest 2-3 specific related interests or sub-categories: ${interests.join(", ")}. 
          For example: 
          - Photography → Street Photography, Nature Photography, Portrait Photography
          - Sports → Basketball, Soccer, Tennis
          - Gaming → Strategy Games, RPGs, eSports
          Return only an array of new suggestions in this exact format: {"suggestions": ["suggestion1", "suggestion2", "suggestion3"]}`
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
          .filter((s: string) => !interests.includes(s))
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
      : [];

    log("[OpenAI] Generated suggestions:", suggestions);
    return { suggestions };
  } catch (error) {
    log("[OpenAI] Error enriching interests:", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to enrich interests");
  }
}