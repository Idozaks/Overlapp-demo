import OpenAI from "openai";
import { log } from "./vite";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interface for connection analysis result
export interface ConnectionAnalysisResult {
  compatibilityScore: number;
  compatibilityReasoning: string;
  conversationStarters: string[];
  sharedInterests: string[];
  complementaryDifferences: string[];
  recommendedActivities: string[];
}

/**
 * Analyze connection potential between two users based on their interests and bios
 * @param userInterests - Array of the current user's interests
 * @param targetInterests - Array of the target user's interests
 * @param userBio - Bio of the current user
 * @param targetBio - Bio of the target user
 * @returns ConnectionAnalysisResult containing compatibility analysis
 */
export async function analyzeConnectionPotential(
  userInterests: string[],
  targetInterests: string[],
  userBio: string = "",
  targetBio: string = ""
): Promise<ConnectionAnalysisResult> {
  try {
    log("[Connection Analysis] Analyzing connection potential");
    log(`[Connection Analysis] User interests: ${userInterests.join(", ")}`);
    log(`[Connection Analysis] Target interests: ${targetInterests.join(", ")}`);
    
    if (!Array.isArray(userInterests) || !Array.isArray(targetInterests)) {
      throw new Error("User interests and target interests must be arrays");
    }

    // Calculate overlapping interests
    const sharedInterests = userInterests.filter(interest => 
      targetInterests.includes(interest)
    );

    // Define system message for focused connection analysis
    const systemMessage = `You are an AI assistant specializing in analyzing social connections and compatibility.
Your task is to evaluate the connection potential between two people based on their interests and bios.
Provide an honest, balanced assessment of compatibility with reasoning.
Focus on finding meaningful connection points and conversation starters based on shared and complementary interests.
Keep your analysis concise and actionable.`;

    // Construct the prompt with all the information
    const userMessage = `Analyze the connection potential between two people:

Person 1 Interests: ${userInterests.join(", ")}
Person 1 Bio: ${userBio || "No bio provided"}

Person 2 Interests: ${targetInterests.join(", ")}
Person 2 Bio: ${targetBio || "No bio provided"}

Shared Interests: ${sharedInterests.length > 0 ? sharedInterests.join(", ") : "None"}

Provide a JSON response with the following structure:
{
  "compatibilityScore": [a number between 0-100 representing overall compatibility],
  "compatibilityReasoning": [1-2 sentences explaining the compatibility score],
  "conversationStarters": [array of 3 specific conversation starter questions based on shared interests],
  "sharedInterests": [array of their shared interests with brief explanation of why each creates connection],
  "complementaryDifferences": [array of 2-3 interests that are different but complementary],
  "recommendedActivities": [array of 3 specific activities these two people might enjoy together]
}`;

    // Make the OpenAI API call
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    try {
      const result = JSON.parse(content) as ConnectionAnalysisResult;
      
      // Validate and ensure we have all required fields with defaults if missing
      return {
        compatibilityScore: Math.min(100, Math.max(0, result.compatibilityScore || 50)),
        compatibilityReasoning: result.compatibilityReasoning || "Based on shared interests and complementary profiles.",
        conversationStarters: result.conversationStarters || ["What do you enjoy most about your interests?"],
        sharedInterests: result.sharedInterests || sharedInterests,
        complementaryDifferences: result.complementaryDifferences || [],
        recommendedActivities: result.recommendedActivities || ["Meet for coffee to discuss shared interests."]
      } as ConnectionAnalysisResult;
    } catch (parseError) {
      log("[Connection Analysis] Error parsing OpenAI response:", 
        parseError instanceof Error ? parseError.message : String(parseError));
      throw new Error("Failed to parse connection analysis result");
    }
  } catch (error) {
    log("[Connection Analysis] Error:", 
      error instanceof Error ? error.message : String(error));
    // Return default values in case of error
    return {
      compatibilityScore: 50,
      compatibilityReasoning: "Unable to complete full analysis due to technical issues.",
      conversationStarters: ["What are you most passionate about these days?"],
      sharedInterests: [],
      complementaryDifferences: [],
      recommendedActivities: ["Meet for coffee to learn more about each other."]
    };
  }
}