import OpenAI from "openai";
import { log } from "./vite";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EnrichInterestsResponse {
  suggestions: Array<{
    parentInterest: string;
    suggestions: string[];
  }>;
}

export async function enrichInterests(interests: string[]): Promise<EnrichInterestsResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at identifying related interests and hobbies. For each interest provided, suggest 2-3 very specific and related sub-interests or specialized categories. Keep suggestions concise and focused on maintaining a clear parent-child relationship."
        },
        {
          role: "user",
          content: `For each of these interests, suggest 2-3 specific related sub-interests or specialized categories that would fall under it: ${interests.join(", ")}. 
          For example: 
          - Photography → Street Photography, Nature Photography, Portrait Photography
          - Sports → Basketball, Soccer, Tennis
          - Gaming → Strategy Games, RPGs, eSports
          Return the suggestions in this exact JSON format:
          {
            "suggestions": [
              {
                "parentInterest": "interest1",
                "suggestions": ["sub1", "sub2", "sub3"]
              },
              {
                "parentInterest": "interest2",
                "suggestions": ["sub1", "sub2", "sub3"]
              }
            ]
          }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Validate and clean the response structure
    const cleanedSuggestions = parsed.suggestions.map((item: any) => ({
      parentInterest: item.parentInterest.trim(),
      suggestions: Array.isArray(item.suggestions) 
        ? item.suggestions
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0 && !interests.includes(s))
        : []
    })).filter((item: any) => item.suggestions.length > 0);

    log("[OpenAI] Generated structured suggestions:", cleanedSuggestions);
    return { suggestions: cleanedSuggestions };
  } catch (error) {
    log("[OpenAI] Error enriching interests:", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to enrich interests");
  }
}