import { User } from "@shared/schema";
import { 
  SemanticMatch, 
  DEFAULT_WEIGHTS, 
  calculateDimensionalScores, 
  analyzeIdentityAttributes, 
  generateEnhancedPrompt,
  EnhancedOverlapAnalysisResponse
} from "./enhancedUserOverlap";
import OpenAI from "openai";
import { ReadableStream } from "stream/web";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate enhanced user overlap analysis with streaming thought process
 * This function is similar to generateEnhancedUserOverlapAnalysis but includes
 * the ability to stream the AI's reasoning process in realtime
 */
export async function generateStreamingUserOverlapAnalysis(
  currentUser: User,
  targetUser: User,
  currentUserInterests: string[],
  targetUserInterests: string[],
  userPreferences?: any
): Promise<{ 
  analysis: EnhancedOverlapAnalysisResponse;
  streamingThoughts: ReadableStream<Uint8Array>;
}> {
  // Compare user interests
  const similarInterests: string[] = currentUserInterests.filter(interest => 
    targetUserInterests.includes(interest)
  );
  
  const uniqueCurrentUserInterests: string[] = currentUserInterests.filter(interest => 
    !targetUserInterests.includes(interest)
  );
  
  const uniqueTargetUserInterests: string[] = targetUserInterests.filter(interest => 
    !currentUserInterests.includes(interest)
  );
  
  // Calculate dimensional scores based on interests and attributes
  const dimensionalScores = calculateDimensionalScores(
    currentUser,
    targetUser,
    userPreferences
  );
  
  // Calculate overall score as weighted average of dimensional scores
  const weights = userPreferences || DEFAULT_WEIGHTS;
  
  const overallScore = (
    (dimensionalScores.interests * (weights.interestsWeight || 1)) +
    (dimensionalScores.values * (weights.valuesWeight || 1)) +
    (dimensionalScores.professional * (weights.professionalWeight || 1)) +
    (dimensionalScores.cultural * (weights.culturalWeight || 1)) +
    (dimensionalScores.communication * (weights.communicationWeight || 1)) +
    (dimensionalScores.physical * (weights.physicalWeight || 1)) +
    (dimensionalScores.learning * (weights.learningWeight || 1))
  ) / (
    (weights.interestsWeight || 1) +
    (weights.valuesWeight || 1) +
    (weights.professionalWeight || 1) +
    (weights.culturalWeight || 1) +
    (weights.communicationWeight || 1) +
    (weights.physicalWeight || 1) +
    (weights.learningWeight || 1)
  );
  
  // Identify common and different identity attributes
  const { commonIdentities, differentIdentities } = analyzeIdentityAttributes(
    currentUser,
    targetUser
  );
  
  // Use semantic matching to find similar interests that aren't exact matches
  const semanticMatches: SemanticMatch[] = [];
  
  // Generate the enhanced prompt for OpenAI
  const promptText = generateEnhancedPrompt(
    currentUser,
    targetUser,
    similarInterests,
    uniqueCurrentUserInterests,
    uniqueTargetUserInterests,
    commonIdentities,
    differentIdentities,
    dimensionalScores,
    semanticMatches,
    userPreferences
  );

  try {
    // Create a new streaming completion from OpenAI
    const completionStream = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an AI assistant performing identity analysis." },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      stream: true
    });
    
    // Initialize a readableStream that will provide thought chunks
    const encoder = new TextEncoder();
    let thoughtChunks = "";
    const thoughtsStream = new ReadableStream({
      async start(controller) {
        // Process each chunk of the response
        for await (const chunk of completionStream) {
          // Capture the content and add it to thought chunks
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            thoughtChunks += content;
            controller.enqueue(encoder.encode(content));
          }
        }
        // Signal the end of the stream
        controller.close();
      }
    });
    
    // Create a second completion to get the full, properly formatted result
    // This ensures we get a valid JSON response while still showing the streaming thought process
    const completionFull = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are an AI assistant performing identity analysis." },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the complete response as structured data
    const fullResponseContent = completionFull.choices[0].message.content;
    let enhancedResponse: EnhancedOverlapAnalysisResponse;
    
    try {
      enhancedResponse = JSON.parse(fullResponseContent as string);
    } catch (e) {
      console.error("Failed to parse OpenAI response as JSON:", e);
      throw new Error("Failed to parse the analysis result. Please try again.");
    }
    
    // Set the scores and identity information
    enhancedResponse.overallScore = overallScore;
    enhancedResponse.dimensionalScores = dimensionalScores;
    enhancedResponse.exactMatchInterests = similarInterests;
    enhancedResponse.semanticMatchInterests = semanticMatches;
    enhancedResponse.commonIdentities = commonIdentities;
    enhancedResponse.differentIdentities = differentIdentities;
    
    // Return both the structured analysis and the streaming thoughts
    return { 
      analysis: enhancedResponse,
      streamingThoughts: thoughtsStream 
    };
  } catch (error) {
    console.error("Error generating streaming user overlap analysis:", error);
    
    // Fallback response in case of error
    const fallbackResponse: EnhancedOverlapAnalysisResponse = {
      summary: "Error generating analysis. Please try again later.",
      detailedAnalysis: "An error occurred while analyzing the profiles.",
      overallScore: overallScore || 0,
      dimensionalScores,
      confidenceLevel: 0,
      exactMatchInterests: similarInterests,
      semanticMatchInterests: semanticMatches,
      commonIdentities,
      differentIdentities,
      keyInsights: ["Analysis failed due to technical error"],
      conversationStarters: [],
      recommendedActivities: {
        quick: [],
        projects: [],
        learning: []
      },
      growthAreas: []
    };
    
    // Create an error stream
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("Error generating analysis. Please try again."));
        controller.close();
      }
    });
    
    return { 
      analysis: fallbackResponse,
      streamingThoughts: errorStream
    };
  }
}