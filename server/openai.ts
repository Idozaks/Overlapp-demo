import OpenAI from "openai";
import { log } from "./vite";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EnrichInterestsResponse {
  suggestions: Array<{
    name: string;
    emoji: string;
  }>;
}

export async function enrichInterests(interests: string[]): Promise<EnrichInterestsResponse> {
  try {
    // Validate input
    if (!Array.isArray(interests) || interests.length === 0) {
      console.warn("[OpenAI] No interests provided for enrichment");
      return { suggestions: [] };
    }

    // Debug log
    log("[OpenAI] Generating suggestions based on interests:", interests.join(", "));

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a JSON API endpoint that returns interest suggestions in a specific format. You must respond with ONLY valid JSON containing an array of interests with name and emoji fields. No explanations, comments, or extra text."
        },
        {
          role: "user",
          content: `I need to generate interest suggestions based on these existing interests: ${interests.join(", ")}.

IMPORTANT RULES:
1. Respond with EXACTLY 10 interest suggestions
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

    // Get the content from the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    
    // Log the raw response for debugging
    log("[OpenAI] Raw response received:", content.substring(0, 100) + "...");
    
    // Handle various content formats and sanitize
    let sanitizedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (sanitizedContent.startsWith("```json")) {
      sanitizedContent = sanitizedContent.replace(/```json\s*/, "").replace(/\s*```\s*$/, "");
    } else if (sanitizedContent.startsWith("```")) {
      sanitizedContent = sanitizedContent.replace(/```\s*/, "").replace(/\s*```\s*$/, "");
    }
    
    // Fix common JSON issues
    sanitizedContent = sanitizedContent
      // Fix trailing commas (common JSON error)
      .replace(/,\s*}/g, '}')
      .replace(/,\s*\]/g, ']')
      // Remove any non-JSON text before the opening brace
      .replace(/^[^{]*({.*)/s, '$1')
      // Remove any non-JSON text after the closing brace
      .replace(/(})[^}]*$/s, '$1');
    
    // Parse the JSON
    try {
      const parsed = JSON.parse(sanitizedContent);
      
      // Basic validation
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error("Invalid response format: missing suggestions array");
      }
      
      // Process and validate the suggestions
      let validSuggestions = [];
      
      // Process each suggestion
      for (const suggestion of parsed.suggestions) {
        // String suggestion case
        if (typeof suggestion === 'string') {
          validSuggestions.push({
            name: suggestion.trim(),
            emoji: '✨'
          });
          continue;
        }
        
        // Invalid object case
        if (!suggestion || typeof suggestion !== 'object') {
          continue;
        }
        
        // Missing name case
        if (!suggestion.name || typeof suggestion.name !== 'string' || suggestion.name.trim() === '') {
          continue;
        }
        
        // Create a properly formatted suggestion
        const name = suggestion.name.trim();
        let emoji = '✨'; // Default fallback
        
        if (suggestion.emoji && typeof suggestion.emoji === 'string' && suggestion.emoji.trim() !== '') {
          emoji = suggestion.emoji.trim();
        }
        
        validSuggestions.push({ name, emoji });
      }
      
      // Filter out duplicates and existing interests
      validSuggestions = validSuggestions.filter(s => !interests.includes(s.name));
      
      // If we couldn't get any valid suggestions, provide fallbacks
      if (validSuggestions.length === 0) {
        const fallbacks = [
          { name: "Creative Writing", emoji: "✍️" },
          { name: "Literature Analysis", emoji: "📚" },
          { name: "Audio Books", emoji: "🎧" },
          { name: "Poetry", emoji: "📝" },
          { name: "Art Exhibitions", emoji: "🖼️" }
        ].filter(s => !interests.includes(s.name));
        
        validSuggestions = fallbacks;
      }
      
      log("[OpenAI] Final suggestions count:", validSuggestions.length);
      return { suggestions: validSuggestions };
      
    } catch (parseError) {
      log("[OpenAI] JSON parse error:", parseError);
      
      // Use fallbacks if JSON parsing fails
      const fallbacks = [
        { name: "Creative Writing", emoji: "✍️" },
        { name: "Literature Analysis", emoji: "📚" },
        { name: "Audio Books", emoji: "🎧" },
        { name: "Poetry", emoji: "📝" },
        { name: "Art Exhibitions", emoji: "🖼️" }
      ].filter(s => !interests.includes(s.name));
      
      log("[OpenAI] Using fallback suggestions");
      return { suggestions: fallbacks };
    }
  } catch (error) {
    log("[OpenAI] Error enriching interests:", error);
    
    // Provide fallbacks even in case of complete API failure
    const fallbacks = [
      { name: "Creative Writing", emoji: "✍️" },
      { name: "Literature Analysis", emoji: "📚" },
      { name: "Audio Books", emoji: "🎧" },
      { name: "Poetry", emoji: "📝" },
      { name: "Art Exhibitions", emoji: "🖼️" }
    ].filter(s => !Array.isArray(interests) ? true : !interests.includes(s.name));
    
    return { suggestions: fallbacks };
  }
}