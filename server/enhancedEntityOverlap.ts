import OpenAI from "openai";
import { User, Entity, EntityContent } from '@shared/schema';
import { log } from './vite';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interface for the response from the enhanced analysis
export interface EnhancedEntityOverlapResponse {
  summary: string;
  detailedAnalysis: string;
  overallScore: number;
  dimensionalScores: {
    interests: number;
    relevance: number;
    engagement: number;
    values: number;
    learning: number;
  };
  confidenceLevel: number;
  exactMatchInterests: string[];
  semanticMatchInterests: Array<{
    userInterest: string;
    entityTopic: string;
    similarityScore: number;
    confidence: number;
  }>;
  uniqueUserInterests: string[];
  uniqueEntityTopics: string[];
  keyInsights: string[];
  conversationStarters: Array<string | {
    opener: string;
    followUps: string[];
    relevantTopics: string[];
  }>;
  recommendedActivities: {
    quick: string[];
    projects: string[];
    learning: string[];
  };
}

/**
 * Extract interests and themes from entity content
 */
function extractEntityThemes(entityContent: EntityContent[]): string[] {
  if (!entityContent || !entityContent.length) {
    return [];
  }

  const themes = new Set<string>();
  
  entityContent.forEach(content => {
    // Add content type as a theme
    if (content.contentType) {
      themes.add(content.contentType);
    }
    
    // Add content category as a theme
    if (content.category) {
      themes.add(content.category);
    }
    
    // Extract keywords from title
    if (content.title) {
      const words = content.title.split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) {
          themes.add(word);
        }
      });
    }
    
    // Extract keywords from description
    if (content.description) {
      const words = content.description.split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) {
          themes.add(word);
        }
      });
    }
    
    // Add tags
    if (content.tags && Array.isArray(content.tags)) {
      content.tags.forEach(tag => themes.add(tag));
    }
  });
  
  return Array.from(themes);
}

/**
 * Find exact matches between user interests and entity themes
 */
function findExactMatches(userInterests: string[], entityThemes: string[]): string[] {
  if (!userInterests || !userInterests.length || !entityThemes || !entityThemes.length) {
    return [];
  }
  
  const userInterestsLower = userInterests.map(i => i.toLowerCase());
  const entityThemesLower = entityThemes.map(t => t.toLowerCase());
  
  return userInterestsLower.filter(interest => 
    entityThemesLower.some(theme => theme === interest)
  );
}

/**
 * Generate enhanced entity-user overlap analysis
 */
export async function generateEnhancedEntityUserOverlapAnalysis(
  user: User,
  entity: Entity,
  entityContent: EntityContent[],
  userInterests: string[]
): Promise<EnhancedEntityOverlapResponse> {
  try {
    // Extract themes and interests from entity content
    const entityThemes = extractEntityThemes(entityContent);
    
    // Find exact matches
    const exactMatches = findExactMatches(userInterests, entityThemes);
    
    // Create a prompt for OpenAI to analyze the overlap
    const prompt = `
# User-Entity Overlap Analysis

## User Information
- Name: ${user.displayName || user.username}
- Age Range: ${user.ageRange || 'Not specified'}
- Gender: ${user.gender || 'Not specified'}
- Occupation: ${user.occupation || 'Not specified'}
- Location: ${user.location || 'Not specified'}
- Cultural Background: ${user.culturalBackground || 'Not specified'}
- Personal Values: ${user.personalValues || 'Not specified'}

## User Interests (${userInterests.length})
${userInterests.map(interest => `- ${interest}`).join('\n')}

## Entity Information
- Name: ${entity.name}
- Type: ${entity.entityType}
- Category: ${entity.category}
- Description: ${entity.description || 'Not provided'}

## Entity Themes (${entityThemes.length})
${entityThemes.map(theme => `- ${theme}`).join('\n')}

## Exact Match Interests (${exactMatches.length})
${exactMatches.map(match => `- ${match}`).join('\n')}

## Analysis Request

I need a comprehensive analysis of the compatibility and potential engagement between this user and entity. Please include:

1. A brief summary (2-3 sentences) of the overall compatibility
2. A more detailed analysis (paragraph) of the relationship potential
3. An overall compatibility score (0.0-1.0) and confidence level (0.0-1.0)
4. Dimensional scores (0.0-1.0) for:
   - interests alignment
   - relevance to user
   - potential engagement level
   - values alignment
   - learning opportunities
5. Semantic matches between user interests and entity themes (beyond exact matches)
6. Key insights about this specific compatibility (3-5 points)
7. Conversation starters based on the overlap (3-5 suggestions)
8. Recommended activities in three categories:
   - Quick/immediate activities (2-3)
   - Project-based activities (1-2)
   - Learning activities (1-2)

Format your response as a structured JSON object with these fields.
`;

    // Call OpenAI for analysis
    log(`Calling OpenAI for entity-user overlap analysis (entity ID: ${entity.id})`);
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this.
      messages: [
        {
          role: "system",
          content: "You are an expert in social psychology and interest-based matching, specialized in analyzing compatibility between people and entities (organizations, platforms, locations). Your analysis should be balanced, data-driven, and focused on providing actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1800
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the response
    const parsedResponse = JSON.parse(content);
    
    log(`Entity-user overlap analysis completed for entity ${entity.id}, score: ${parsedResponse.overallScore}`);
    
    // Create the structured response
    return {
      summary: parsedResponse.summary || "Analysis not available",
      detailedAnalysis: parsedResponse.detailedAnalysis || "Detailed analysis not available",
      overallScore: parsedResponse.overallScore || 0.5,
      dimensionalScores: parsedResponse.dimensionalScores || {
        interests: 0.5,
        relevance: 0.5,
        engagement: 0.5,
        values: 0.5,
        learning: 0.5
      },
      confidenceLevel: parsedResponse.confidenceLevel || 0.7,
      exactMatchInterests: exactMatches,
      semanticMatchInterests: parsedResponse.semanticMatches || [],
      uniqueUserInterests: userInterests.filter(interest => !exactMatches.includes(interest)),
      uniqueEntityTopics: entityThemes.filter(theme => !exactMatches.includes(theme)),
      keyInsights: parsedResponse.keyInsights || [],
      conversationStarters: parsedResponse.conversationStarters || [],
      recommendedActivities: parsedResponse.recommendedActivities || {
        quick: [],
        projects: [],
        learning: []
      }
    };
  } catch (error) {
    log("Error generating enhanced entity-user overlap analysis:", error instanceof Error ? error.message : String(error));
    
    // Provide a fallback response with basic information
    return {
      summary: "We couldn't generate a complete analysis at this time.",
      detailedAnalysis: "Our analysis system encountered an issue while processing the compatibility between this user and entity. Please try again later.",
      overallScore: 0.5,
      dimensionalScores: {
        interests: 0.5,
        relevance: 0.5,
        engagement: 0.5,
        values: 0.5,
        learning: 0.5
      },
      confidenceLevel: 0.5,
      exactMatchInterests: findExactMatches(userInterests, extractEntityThemes(entityContent)),
      semanticMatchInterests: [],
      uniqueUserInterests: userInterests,
      uniqueEntityTopics: extractEntityThemes(entityContent),
      keyInsights: [
        "Analysis currently unavailable.",
        "Try refreshing to generate a new analysis."
      ],
      conversationStarters: [],
      recommendedActivities: {
        quick: [],
        projects: [],
        learning: []
      }
    };
  }
}