import { OpenAI } from "openai";
import { User, Entity, EntityContent } from "@shared/schema";
import { log } from "./vite";
import { calculateInterestSimilarity, SemanticMatch } from "./semanticSimilarity";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhanced response interface for entity-user overlap analysis
 */
export interface EnhancedEntityOverlapAnalysisResponse {
  // Overview information
  summary: string;                           // Brief overview of compatibility (1-2 paragraphs)
  detailedAnalysis: string;                  // More in-depth analysis (3-5 paragraphs)
  
  // Score data
  overallScore: number;                      // 0-1 aggregate score
  confidenceLevel: number;                   // 0-1 confidence in analysis
  
  // Interest and content data
  exactMatchInterests: string[];             // Exact interest matches with entity
  semanticMatchInterests: SemanticMatch[];   // Semantic interest matches with entity
  relevantContent: Array<{                   // Entity content most relevant to user
    contentId: number;
    title: string;
    type: string;
    relevanceScore: number;                  // 0-1 relevance score
  }>;
  
  // Actionable information
  keyInsights: string[];                     // List of 3-5 key insights about compatibility
  personalizedRecommendations: string[];     // Customized recommendations based on user profile
  suggestedActivities: Array<{               // Specific activities related to the entity
    activity: string;
    description: string;
    relevantInterests: string[];
  }>;
  
  // Future engagement suggestions
  futureEngagementOpportunities: Array<{     // Long-term engagement opportunities
    opportunity: string;
    benefitDescription: string;
  }>;
}

/**
 * Calculate the relevance of entity content to user interests
 */
function calculateContentRelevance(
  entityContent: EntityContent[],
  userInterests: string[],
  semanticMatches: SemanticMatch[]
): Array<{
  contentId: number;
  title: string;
  type: string;
  relevanceScore: number;
}> {
  // If no content or interests, return empty array
  if (entityContent.length === 0 || (userInterests.length === 0 && semanticMatches.length === 0)) {
    return [];
  }
  
  // Process each content item
  return entityContent.map(content => {
    // Clean and prepare text
    const contentTitle = content.title?.toLowerCase() || "";
    const contentDescription = content.description?.toLowerCase() || "";
    const combinedText = `${contentTitle} ${contentDescription}`;
    
    // Score based on direct interest matches
    let matchScore = 0;
    let matchCount = 0;
    
    // Check for exact matches
    userInterests.forEach(interest => {
      const interestLower = interest.toLowerCase();
      if (combinedText.includes(interestLower)) {
        matchScore += 1;
        matchCount++;
      }
    });
    
    // Check for semantic matches
    semanticMatches.forEach(match => {
      const interest1Lower = match.interest1.toLowerCase();
      const interest2Lower = match.interest2.toLowerCase();
      
      if (combinedText.includes(interest1Lower) || combinedText.includes(interest2Lower)) {
        // Weight by similarity score
        matchScore += match.similarityScore;
        matchCount++;
      }
    });
    
    // Calculate final relevance score
    const relevanceScore = matchCount > 0 ? matchScore / matchCount : 0;
    
    return {
      contentId: content.id,
      title: content.title || "",
      type: content.type || "unknown",
      relevanceScore: Math.min(1, relevanceScore)
    };
  })
  .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance (descending)
}

/**
 * Generate enhanced prompt for entity-user overlap analysis
 */
function generateEnhancedPrompt(
  user: User,
  entity: Entity,
  entityContent: EntityContent[],
  userInterests: string[],
  semanticMatches: SemanticMatch[],
  relevantContent: Array<{
    contentId: number;
    title: string;
    type: string;
    relevanceScore: number;
  }>,
  overallScore: number
): string {
  // Extract user attributes for the prompt
  const userAttributes = [
    user.gender,
    user.ageRange,
    user.countryOfOrigin,
    user.languagesSpoken,
    user.culturalBackground,
    user.education,
    user.professionalField,
    user.personalValues
  ].filter(Boolean);
  
  // Format semantic matches for inclusion in the prompt
  const formattedSemanticMatches = semanticMatches
    .map(match => `${match.interest1} ⟷ ${match.interest2} (similarity: ${Math.round(match.similarityScore * 100)}%)`)
    .join("\n");
  
  // Get top relevant content
  const topContent = relevantContent
    .filter(item => item.relevanceScore > 0.2)
    .slice(0, 5);
  
  // Format content items by type
  const reviewContent = entityContent
    .filter(c => c.type === 'review')
    .map(c => `${c.title}: ${c.description?.substring(0, 150)}...`)
    .join("\n");
    
  const eventContent = entityContent
    .filter(c => c.type === 'event')
    .map(c => `${c.title}: ${c.description?.substring(0, 150)}...`)
    .join("\n");
    
  const productContent = entityContent
    .filter(c => c.type === 'product')
    .map(c => `${c.title}: ${c.description?.substring(0, 150)}...`)
    .join("\n");
    
  const postContent = entityContent
    .filter(c => c.type === 'post')
    .map(c => `${c.title}: ${c.description?.substring(0, 150)}...`)
    .join("\n");
  
  return `
# Entity-User Compatibility Analysis Request

## User Profile
- Name: ${user.displayName || user.username}
- Bio: ${user.bio || "No bio provided"}
${userAttributes.length > 0 ? `- Attributes: ${userAttributes.join(", ")}` : ""}
- Stated Interests: ${userInterests.join(", ") || "No interests specified"}

## Entity Profile
- Name: ${entity.name}
- Type: ${entity.entityType} (${entity.category})
- Description: ${entity.description || "No description provided"}
- Location: ${entity.coordinates ? `Lat: ${entity.coordinates.latitude}, Lng: ${entity.coordinates.longitude}` : "No location data"}

## Entity Content Summary
${reviewContent ? `### Reviews\n${reviewContent}\n` : ""}
${eventContent ? `### Events\n${eventContent}\n` : ""}
${productContent ? `### Products\n${productContent}\n` : ""}
${postContent ? `### Posts\n${postContent}\n` : ""}

## Overlap Analysis

### Interest Relevance
- Exact Matching Interests: ${semanticMatches.filter(m => m.similarityScore === 1).length > 0 
  ? semanticMatches.filter(m => m.similarityScore === 1).map(m => m.interest1).join(", ") 
  : "None"}
- Semantically Similar Interests:
${formattedSemanticMatches || "None identified"}

### Most Relevant Content to User
${topContent.length > 0 
  ? topContent.map(c => `- ${c.title} (${c.type}, relevance: ${Math.round(c.relevanceScore * 100)}%)`).join("\n") 
  : "No highly relevant content identified"}

### Overall Compatibility
- Calculated Compatibility Score: ${Math.round(overallScore * 100)}%

## Analysis Request

Using the data above, please generate a structured response in valid JSON format that includes ALL of the following elements:

1. summary: A brief overview of compatibility (1-2 paragraphs)
2. detailedAnalysis: More comprehensive analysis (3-5 paragraphs)
3. keyInsights: Array of 3-5 specific insights about user-entity compatibility
4. personalizedRecommendations: Array of 3-5 personalized recommendations based on user profile
5. suggestedActivities: Array of objects containing "activity", "description", and "relevantInterests" fields
6. futureEngagementOpportunities: Array of objects with "opportunity" and "benefitDescription" fields

Your response must be in proper JSON format that can be parsed by JavaScript.
`;
}

/**
 * Enhanced function to generate entity-user overlap analysis with semantic understanding
 * and structured output
 */
export async function generateEnhancedEntityUserOverlapAnalysis(
  user: User,
  entity: Entity,
  entityContent: EntityContent[],
  userInterests: string[]
): Promise<EnhancedEntityOverlapAnalysisResponse> {
  try {
    // Extract entity category and name for analysis
    const entityCategory = entity.category;
    const entityType = entity.entityType;
    const entityName = entity.name;
    
    // Generate content keywords from entity data
    const entityKeywords = [
      entityCategory, 
      ...entityName.split(" "), 
      ...(entity.description || "").split(/\s+/).filter(w => w.length > 4)
    ];
    
    // Use semantic similarity to find matches between user interests and entity
    const semanticMatches = await calculateInterestSimilarity(
      userInterests,
      entityKeywords,
      0.65 // slightly lower threshold for entities
    );
    
    // Calculate content relevance
    const relevantContent = calculateContentRelevance(
      entityContent,
      userInterests,
      semanticMatches
    );
    
    // Calculate a simple overlap score
    const relevantInterestCount = new Set([
      ...semanticMatches.map(m => m.interest1)
    ]).size;
    
    const overlapScore = userInterests.length > 0 
      ? relevantInterestCount / userInterests.length 
      : 0;
    
    // Adjust score based on content relevance
    const contentRelevanceAvg = relevantContent.length > 0
      ? relevantContent.reduce((sum, item) => sum + item.relevanceScore, 0) / relevantContent.length
      : 0;
    
    // Combine interest and content scores
    const combinedScore = overlapScore * 0.7 + contentRelevanceAvg * 0.3;
    
    // Generate enhanced prompt
    const prompt = generateEnhancedPrompt(
      user,
      entity,
      entityContent,
      userInterests,
      semanticMatches,
      relevantContent,
      combinedScore
    );
    
    log("Generating enhanced entity-user overlap analysis with OpenAI");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert digital-physical identity analyst specializing in understanding compatibility between users and entities. 
          Your task is to analyze the overlap between a user and an entity (${entityType}: ${entityName}) and provide insightful, structured observations about their compatibility and personalized recommendations.
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
    
    // Extract exact match interests
    const exactMatchInterests = semanticMatches
      .filter(match => match.similarityScore === 1)
      .map(match => match.interest1);
    
    // Extract semantic match interests (non-exact matches)
    const nonExactMatches = semanticMatches
      .filter(match => match.similarityScore < 1);
    
    // Build full response
    const enhancedResponse: EnhancedEntityOverlapAnalysisResponse = {
      // Text analysis
      summary: parsedResponse.summary || "Analysis could not be generated.",
      detailedAnalysis: parsedResponse.detailedAnalysis || "Detailed analysis unavailable.",
      
      // Score data
      overallScore: combinedScore,
      confidenceLevel: 0.7, // Fixed for now - could be dynamic based on data quality
      
      // Interest and content data
      exactMatchInterests,
      semanticMatchInterests: nonExactMatches,
      relevantContent,
      
      // Actionable information
      keyInsights: parsedResponse.keyInsights || [],
      personalizedRecommendations: parsedResponse.personalizedRecommendations || [],
      suggestedActivities: parsedResponse.suggestedActivities || [],
      
      // Future engagement opportunities
      futureEngagementOpportunities: parsedResponse.futureEngagementOpportunities || []
    };
    
    return enhancedResponse;
    
  } catch (error) {
    log("Error generating enhanced entity-user overlap analysis:", error instanceof Error ? error.message : String(error));
    
    // Provide a fallback response
    return {
      summary: "We couldn't generate a complete analysis at this time.",
      detailedAnalysis: "Our analysis system encountered an issue while processing the compatibility between this user and entity. Please try again later.",
      overallScore: 0,
      confidenceLevel: 0,
      exactMatchInterests: [],
      semanticMatchInterests: [],
      relevantContent: [],
      keyInsights: [
        "Analysis currently unavailable.",
        "Try refreshing to generate a new analysis."
      ],
      personalizedRecommendations: [],
      suggestedActivities: [],
      futureEngagementOpportunities: []
    };
  }
}