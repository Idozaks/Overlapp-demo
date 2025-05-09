import OpenAI from "openai";
import { log } from "./vite";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the store analysis request structure
export interface StoreAnalysisRequest {
  storeId: number;
  storeName?: string;
  storeCategory?: string;
  storeDescription?: string;
  storeProducts?: string[];
  storeTags?: string[];
  userInterests: string[];
}

// Define the store analysis result structure
export interface StoreAnalysisResult {
  overlapScore: number;
  analysisReasoning: string;
  matchingInterests: string[];
  recommendations: string[];
  bestTimesToVisit: string[];
}

/**
 * Generates an AI-powered analysis of how well a store matches a user's interests
 * 
 * @param request The store analysis request containing store data and user interests
 * @returns A detailed analysis of the store-user overlap
 */
export async function generateStoreOverlapAnalysis(
  request: StoreAnalysisRequest
): Promise<StoreAnalysisResult> {
  try {
    log("Starting store overlap analysis with user interests:", JSON.stringify(request.userInterests));

    // Create a system prompt that instructs the model how to analyze the store
    const systemPrompt = `
      You are an AI retail analysis expert for Overlapp, a platform that connects users with businesses
      based on shared interests and values. Analyze the overlap between a user's interests and a retail store
      to provide personalized recommendations.
      
      Provide a detailed analysis structured in JSON format with the following information:
      1. overlapScore: A numerical score from 0-100 representing how well the store matches the user's interests
      2. analysisReasoning: A 2-3 sentence explanation of the overlap score
      3. matchingInterests: An array of the user's interests that match well with this store
      4. recommendations: An array of 3-5 specific product recommendations or activities at this store
      5. bestTimesToVisit: An array of 2-3 suggestions for optimal times to visit this store based on the user's interests
    `;

    // Format the store information for the AI prompt
    const storeInfo = {
      id: request.storeId,
      name: request.storeName || `Store ID ${request.storeId}`,
      category: request.storeCategory || "Retail",
      description: request.storeDescription || "",
      products: request.storeProducts || [],
      tags: request.storeTags || [],
    };

    // Create the user message containing the store info and user interests
    const userPrompt = `
      Please analyze the overlap between the following store and user interests:
      
      STORE INFORMATION:
      ID: ${storeInfo.id}
      Name: ${storeInfo.name}
      Category: ${storeInfo.category}
      Description: ${storeInfo.description}
      Products: ${storeInfo.products.join(", ")}
      Tags: ${storeInfo.tags.join(", ")}
      
      USER INTERESTS:
      ${request.userInterests.join(", ")}
      
      Provide a comprehensive analysis in the specified JSON format.
    `;

    // Call the OpenAI API to generate the analysis
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    log("Calling OpenAI for store overlap analysis");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Extract and parse the analysis from the response
    const analysisContent = response.choices[0].message.content;
    if (!analysisContent) {
      throw new Error("OpenAI returned an empty response");
    }

    log("Store analysis response received from OpenAI");
    
    // Parse the JSON response from OpenAI
    const analysisResult = JSON.parse(analysisContent) as StoreAnalysisResult;
    
    // Ensure the analysis has all required fields
    return {
      overlapScore: analysisResult.overlapScore || 0,
      analysisReasoning: analysisResult.analysisReasoning || "Analysis could not be generated.",
      matchingInterests: analysisResult.matchingInterests || [],
      recommendations: analysisResult.recommendations || [],
      bestTimesToVisit: analysisResult.bestTimesToVisit || [],
    };
  } catch (error) {
    log("Error generating store overlap analysis:", String(error));
    throw new Error(`Failed to generate store analysis: ${error instanceof Error ? error.message : String(error)}`);
  }
}