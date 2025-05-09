import OpenAI from "openai";
import { log } from "./vite";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EnrichInterestsResponse {
  suggestions: Array<{
    name: string;
    emoji: string;
    reason?: string;
  }>;
}

interface GenerateEmojisResponse {
  interests: Array<{
    id: number;
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
          content: "You are a JSON API endpoint that returns interest suggestions in a specific format. You must respond with ONLY valid JSON containing an array of interests with name, emoji, and reason fields. The reason field should explain why the suggestion fits the user's existing interests. No explanations, comments, or extra text."
        },
        {
          role: "user",
          content: `I need to generate interest suggestions based on these existing interests: ${interests.join(", ")}.

IMPORTANT RULES:
1. Respond with EXACTLY 5 interest suggestions
2. Include ONLY the required JSON format shown below - no explanations or other text
3. Each suggestion MUST have a "name" field (string), "emoji" field (single Unicode emoji), and a "reason" field that briefly explains why it relates to the user's interests
4. Make each reason concise (15-25 words) and personalized
5. Choose widely supported emojis that display well on mobile
6. Do not duplicate any existing interests in the suggestions

EXAMPLE RESPONSE FORMAT:
{
  "suggestions": [
    {"name": "Travel Photography", "emoji": "📸", "reason": "Since you enjoy Travel and Photography, combining these passions could enhance your experiences in both areas."},
    {"name": "Mountain Hiking", "emoji": "🏔️", "reason": "Given your interest in Fitness and Travel, exploring mountain trails offers adventure and exercise together."},
    {"name": "Jazz Music", "emoji": "🎷", "reason": "Your interest in Music suggests you might enjoy exploring the rich complexity of jazz."},
    {"name": "Italian Cooking", "emoji": "🍝", "reason": "Because you like Food & Cooking, exploring Italian cuisine could expand your culinary repertoire."},
    {"name": "Urban Sketching", "emoji": "✏️", "reason": "Combining your interests in Art & Design with Travel, urban sketching lets you capture places you visit."}
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
      .replace(/,\s*\]/g, ']');

    // Find the first opening brace and last closing brace
    const openBraceIndex = sanitizedContent.indexOf('{');
    const closeBraceIndex = sanitizedContent.lastIndexOf('}');

    // Extract only the JSON part if both braces are found
    if (openBraceIndex !== -1 && closeBraceIndex !== -1 && closeBraceIndex > openBraceIndex) {
      sanitizedContent = sanitizedContent.substring(openBraceIndex, closeBraceIndex + 1);
    }

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

        // Create a properly formatted suggestion with normalized emoji
        const name = suggestion.name.trim();
        let emoji = '✨'; // Default fallback
        let reason = suggestion.reason || 'Based on your selected interests';

        if (suggestion.emoji && typeof suggestion.emoji === 'string') {
          // The MVP doesn't display emojis, so we'll just set it to empty string
        emoji = ''; // Explicitly set to empty string to avoid rendering issues
        }

        validSuggestions.push({ name, emoji, reason });
      }

      // Filter out duplicates and existing interests
      validSuggestions = validSuggestions.filter(s => !interests.includes(s.name));

      // If we couldn't get any valid suggestions, provide fallbacks
      if (validSuggestions.length === 0) {
        const fallbacks = [
          { name: "Creative Writing", emoji: "✍️", reason: "Express yourself creatively through writing stories, essays or articles." },
          { name: "Literature Analysis", emoji: "📚", reason: "Deepen your understanding of texts by examining themes, characters, and author intentions." },
          { name: "Audio Books", emoji: "🎧", reason: "Enjoy literature through listening - perfect for busy schedules or multitasking." },
          { name: "Poetry", emoji: "📝", reason: "Explore emotional expression and linguistic creativity through verse." },
          { name: "Art Exhibitions", emoji: "🖼️", reason: "Appreciate visual creativity and artistic expression in curated spaces." }
        ].filter(s => !interests.includes(s.name));

        validSuggestions = fallbacks;
      }

      log("[OpenAI] Final suggestions count: " + validSuggestions.length);
      return { suggestions: validSuggestions };

    } catch (parseError) {
      log("[OpenAI] JSON parse error: " + parseError);

      // Use fallbacks if JSON parsing fails
      const fallbacks = [
        { name: "Creative Writing", emoji: "✍️", reason: "Express yourself creatively through writing stories, essays or articles." },
        { name: "Literature Analysis", emoji: "📚", reason: "Deepen your understanding of texts by examining themes, characters, and author intentions." },
        { name: "Audio Books", emoji: "🎧", reason: "Enjoy literature through listening - perfect for busy schedules or multitasking." },
        { name: "Poetry", emoji: "📝", reason: "Explore emotional expression and linguistic creativity through verse." },
        { name: "Art Exhibitions", emoji: "🖼️", reason: "Appreciate visual creativity and artistic expression in curated spaces." }
      ].filter(s => !interests.includes(s.name));

      log("[OpenAI] Using fallback suggestions");
      return { suggestions: fallbacks };
    }
  } catch (error) {
    log("[OpenAI] Error enriching interests: " + error);

    // Provide fallbacks even in case of complete API failure
    const fallbacks = [
        { name: "Creative Writing", emoji: "✍️", reason: "Express yourself creatively through writing stories, essays or articles." },
        { name: "Literature Analysis", emoji: "📚", reason: "Deepen your understanding of texts by examining themes, characters, and author intentions." },
        { name: "Audio Books", emoji: "🎧", reason: "Enjoy literature through listening - perfect for busy schedules or multitasking." },
        { name: "Poetry", emoji: "📝", reason: "Explore emotional expression and linguistic creativity through verse." },
        { name: "Art Exhibitions", emoji: "🖼️", reason: "Appreciate visual creativity and artistic expression in curated spaces." }
    ].filter(s => !Array.isArray(interests) ? true : !interests.includes(s.name));

    return { suggestions: fallbacks };
  }
}

export async function generateEmojisForInterests(interests: Array<{id: number, name: string}>): Promise<GenerateEmojisResponse> {
  try {
    // Validate input
    if (!Array.isArray(interests) || interests.length === 0) {
      log("[OpenAI] No interests provided for emoji generation");
      return { interests: [] };
    }

    // Process interests in batches of 20
    const batchSize = 20;
    const batches = [];
    for (let i = 0; i < interests.length; i += batchSize) {
      batches.push(interests.slice(i, i + batchSize));
    }

    const processedInterests: Array<{id: number, name: string, emoji: string}> = [];

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const progress = Math.round(((i + 1) / batches.length) * 100);
      log(`[OpenAI] Processing batch ${i + 1}/${batches.length} (${progress}%) for emoji generation`);

      // Make API call to OpenAI for current batch
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a JSON API endpoint that assigns highly relevant and visually appropriate emojis to interest topics. Your selections should precisely match the semantic meaning of each interest category. You must respond with ONLY valid JSON with no additional text or explanations."
          },
          {
            role: "user",
            content: `I need to assign a perfectly matching emoji to each of these interests:
${batch.map(interest => `- ${interest.name}`).join('\n')}

IMPORTANT RULES:
1. Respond with ONLY valid JSON following the exact format shown below
2. Keep the original interest ID and name exactly as provided
3. Choose a SINGLE relevant, widely-supported emoji for each interest
4. The emoji must PERFECTLY represent the interest's specific topic (not general categories)
5. Choose emojis that display well on mobile devices
6. Consider these emoji mapping guidelines:
   - For art-related interests: 🎨 (palette), 🖌️ (paintbrush), 🖼️ (framed picture)
   - For books/reading: 📚 (books), 📖 (open book), 📕 (closed book)
   - For travel: 🧳 (luggage), 🗺️ (map), 🏝️ (island), ✈️ (airplane)
   - For fitness: 💪 (muscle), 🏋️ (weightlifter), 🧘 (yoga pose)
   - For food: 🍽️ (plate/utensils), 🍳 (cooking), 🥗 (salad)
   - For technology: 💻 (laptop), 📱 (smartphone), 🖥️ (desktop)
   - For music: 🎵 (musical note), 🎸 (guitar), 🎹 (piano), 🎧 (headphones)
   - For nature: 🌿 (plant), 🌳 (tree), 🌸 (flower), 🏞️ (landscape)
   - For social activities: 👥 (people), 🎭 (theater masks), 🎮 (gaming)

EXAMPLES OF PERFECT MATCHES:
- "Book Clubs" should get 📚 (books stack)
- "Art" should get 🎨 (artist palette)
- "Fashion" should get 👗 (dress) or 👔 (necktie)
- "Travel" should get ✈️ (airplane) or 🧳 (luggage)
- "Fitness" should get 💪 (muscle) or 🏋️ (weightlifter)

EXAMPLES OF POOR MATCHES TO AVOID:
- Don't use 🛩️ (small airplane) for "Book Clubs"
- Don't use 📊 (chart) for "Art" or creative activities
- Don't use 🧮 (abacus) for "Fashion"

EXAMPLE RESPONSE FORMAT:
{
  "interests": [
    {"id": 1, "name": "Hiking", "emoji": "🥾"},
    {"id": 2, "name": "Reading", "emoji": "📚"},
    {"id": 3, "name": "Photography", "emoji": "📷"}
  ]
}

YOUR RESPONSE MUST BE VALID JSON MATCHING THIS EXACT STRUCTURE.`
          }
        ],
        response_format: { type: "json_object" }
      });

    // Get the content from the response and process it
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      // Log the raw response for debugging
      log("[OpenAI] Raw emoji response received:", content.substring(0, 100) + "...");

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
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']');

      // Find the first opening brace and last closing brace
      const openBraceIndex = sanitizedContent.indexOf('{');
      const closeBraceIndex = sanitizedContent.lastIndexOf('}');

      // Extract only the JSON part if both braces are found
      if (openBraceIndex !== -1 && closeBraceIndex !== -1 && closeBraceIndex > openBraceIndex) {
        sanitizedContent = sanitizedContent.substring(openBraceIndex, closeBraceIndex + 1);
      }

      // Parse the JSON
      try {
        const parsed = JSON.parse(sanitizedContent);

        // Basic validation
        if (!parsed.interests || !Array.isArray(parsed.interests)) {
          throw new Error("Invalid response format: missing interests array");
        }

        // Process batch results
        for (const interest of parsed.interests) {
          try {
            if (!interest || typeof interest !== 'object') continue;
            if (!interest.name || typeof interest.name !== 'string' || interest.name.trim() === '') continue;

            // Use name instead of ID for matching
            const id = interest.id || 0; // Default to 0 if ID is missing
            const name = interest.name.trim();
            const emoji = (interest.emoji && typeof interest.emoji === 'string') ? interest.emoji.trim() : '✨';

            processedInterests.push({ id, name, emoji });
          } catch (err) {
            log(`[OpenAI] Error processing interest: ${err}`);
            // Continue with next interest even if this one fails
            continue;
          }
        }
      } catch (parseError) {
        log(`[OpenAI] Error processing batch: ${parseError}`);
        // Continue with next batch even if this one fails
      }
    }

    log(`[OpenAI] Successfully generated emojis for ${processedInterests.length} interests`);
    return { interests: processedInterests };

    } catch (error) {
      log("[OpenAI] Error generating emojis for interests:", String(error));

      // Return the original interests with no emoji on error
      return { 
        interests: interests.map(interest => ({
          id: interest.id,
          name: interest.name,
          emoji: '' // No emoji if there's an error
        }))
      };
    }
}