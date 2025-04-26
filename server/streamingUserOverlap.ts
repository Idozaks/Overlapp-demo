import { OpenAI } from "openai";
import { User } from "@shared/schema";
import { log } from "./vite";
import { findSemanticallySimilarInterests, SemanticMatch } from "./semanticSimilarity";
import { 
  AttributeWeights, 
  DEFAULT_WEIGHTS, 
  DimensionalScores, 
  EnhancedOverlapAnalysisResponse 
} from "./enhancedUserOverlap";
import { analyzeIdentityAttributes, calculateDimensionalScores, generateEnhancedPrompt } from "./enhancedUserOverlap";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
  userPreferences?: AttributeWeights
): Promise<{
  analysis: EnhancedOverlapAnalysisResponse;
  streamingThoughts: ReadableStream<Uint8Array>;
}> {
  try {
    // Find semantic matches between interests
    const semanticResult = await findSemanticallySimilarInterests(
      currentUserInterests,
      targetUserInterests
    );
    
    // Analyze identity attributes
    const identityAnalysis = analyzeIdentityAttributes(
      currentUser,
      targetUser
    );
    
    // Calculate dimensional and overall scores
    const scoreAnalysis = calculateDimensionalScores(
      currentUser,
      targetUser,
      semanticResult,
      userPreferences
    );
    
    // Generate enhanced prompt for OpenAI
    const prompt = generateEnhancedPrompt(
      currentUser,
      targetUser,
      semanticResult,
      scoreAnalysis.dimensionalScores,
      scoreAnalysis.overallScore,
      scoreAnalysis.confidenceLevel,
      identityAnalysis,
      userPreferences
    );
    
    log("Generating streaming overlap analysis with OpenAI");
    
    // Create a streaming response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert social psychologist specializing in human connections and compatibility analysis. 
          Your task is to analyze the overlap between two users and provide insightful, structured observations about their compatibility, shared traits, and potential for meaningful connection.
          First, think step by step through your reasoning process, explaining your thoughts as you analyze the profiles.
          Then, provide your final analysis in valid JSON format that matches this exact structure:
          {
            "summary": "Brief 1-2 paragraph summary of compatibility",
            "detailedAnalysis": "More in-depth 3-5 paragraph analysis",
            "keyInsights": ["3-5 key compatibility insights as strings"],
            "conversationStarters": [
              {
                "context": "professional|social|learning|collaboration",
                "starters": [
                  {
                    "opener": "Initial conversation starter",
                    "followUps": ["2-3 follow-up questions"],
                    "relevantTopics": ["Related topics"]
                  }
                ]
              }
            ],
            "recommendedActivities": {
              "quick": ["2-3 immediate low-commitment activities"],
              "projects": ["2-3 longer-term collaboration ideas"],
              "learning": ["2-3 mutual learning opportunities"]
            },
            "growthAreas": [
              {
                "description": "Description of growth opportunity",
                "relevantAttributes": ["Related attributes/interests"]
              }
            ]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2500
    });
    
    // Transform the streaming data for client consumption
    const streamingThoughts = new ReadableStream({
      async start(controller) {
        let accumulatedResponse = '';
        let jsonStartIdx = -1;
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          accumulatedResponse += content;
          controller.enqueue(new TextEncoder().encode(content));
          
          // Check if we've started JSON output
          if (jsonStartIdx === -1) {
            jsonStartIdx = accumulatedResponse.indexOf('{');
          }
        }
        
        controller.close();
      }
    });
    
    // Generate the final analysis 
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert social psychologist specializing in human connections and compatibility analysis. 
          Your task is to analyze the overlap between two users and provide insightful, structured observations about their compatibility, shared traits, and potential for meaningful connection.
          Always format your response as valid JSON that can be parsed with JSON.parse().`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Extract and parse the JSON response
    const responseContent = response.choices[0].message.content || "{}";
    let parsedResponse: any;
    
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (e) {
      log("Error parsing OpenAI response as JSON:", e);
      throw new Error("Failed to parse AI response as JSON");
    }
    
    // Construct the enhanced response
    const enhancedResponse: EnhancedOverlapAnalysisResponse = {
      // Text analysis from AI
      summary: parsedResponse.summary || "Analysis could not be generated.",
      detailedAnalysis: parsedResponse.detailedAnalysis || "Detailed analysis unavailable.",
      
      // Score data from our calculations
      overallScore: scoreAnalysis.overallScore,
      dimensionalScores: scoreAnalysis.dimensionalScores,
      confidenceLevel: scoreAnalysis.confidenceLevel,
      
      // Shared elements from our analysis
      exactMatchInterests: semanticResult.exactMatches,
      semanticMatchInterests: semanticResult.semanticMatches,
      commonIdentities: identityAnalysis.commonIdentities,
      differentIdentities: identityAnalysis.differentIdentities,
      
      // Actionable elements from AI
      keyInsights: parsedResponse.keyInsights || [],
      conversationStarters: parsedResponse.conversationStarters || [],
      recommendedActivities: parsedResponse.recommendedActivities || {
        quick: [],
        projects: [],
        learning: []
      },
      growthAreas: parsedResponse.growthAreas || []
    };
    
    return {
      analysis: enhancedResponse,
      streamingThoughts
    };
    
  } catch (error) {
    log("Error generating streaming user overlap analysis:", error instanceof Error ? error.message : String(error));
    
    // Provide a fallback response with basic information
    const fallbackResponse: EnhancedOverlapAnalysisResponse = {
      summary: "We couldn't generate a complete analysis at this time.",
      detailedAnalysis: "Our analysis system encountered an issue while processing the compatibility between these users. Please try again later.",
      overallScore: 0,
      dimensionalScores: {
        interests: 0,
        values: 0,
        professional: 0,
        cultural: 0,
        communication: 0,
        physical: 0,
        learning: 0
      },
      confidenceLevel: 0,
      exactMatchInterests: [],
      semanticMatchInterests: [],
      commonIdentities: [],
      differentIdentities: {},
      keyInsights: [
        "Analysis currently unavailable.",
        "Try refreshing to generate a new analysis."
      ],
      conversationStarters: [],
      recommendedActivities: {
        quick: [],
        projects: [],
        learning: []
      },
      growthAreas: []
    };
    
    // Create an empty stream for errors
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Error generating analysis. Please try again."));
        controller.close();
      }
    });
    
    return {
      analysis: fallbackResponse,
      streamingThoughts: errorStream
    };
  }
}