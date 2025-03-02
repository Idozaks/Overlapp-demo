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
          content: "You are an expert at identifying related interests and hobbies. For each interest provided, suggest 2-3 related or more specific interests. Provide output as a JSON array of strings."
        },
        {
          role: "user",
          content: `Please suggest related interests for: ${interests.join(", ")}. For example, if given "Water Sports", suggest specific activities like "Scuba Diving", "Surfing", "Jet Skiing". Return only the array of suggestions without the original interests.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content || "{}");

    // Filter out duplicates and original interests
    const suggestions = Array.isArray(parsed.suggestions) 
      ? parsed.suggestions.filter((s: string) => !interests.includes(s))
      : [];

    log("[OpenAI] Generated suggestions:", suggestions);
    return { suggestions };
  } catch (error) {
    log("[OpenAI] Error enriching interests:", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to enrich interests");
  }
}