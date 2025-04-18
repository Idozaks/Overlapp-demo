import { OpenAI } from "openai";
import { User } from "@shared/schema";
import { log } from "./vite";
import { findSemanticallySimilarInterests, SemanticMatch } from "./semanticSimilarity";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface representing user's attribute weights for personalized analysis
 */
export interface AttributeWeights {
  interestsWeight: number;       // 0-10
  valuesWeight: number;          // 0-10
  professionalWeight: number;    // 0-10
  culturalWeight: number;        // 0-10
  communicationWeight: number;   // 0-10
  physicalWeight: number;        // 0-10
  learningWeight: number;        // 0-10
}

/**
 * Default attribute weights if not specified
 */
const DEFAULT_WEIGHTS: AttributeWeights = {
  interestsWeight: 7,
  valuesWeight: 6,
  professionalWeight: 5,
  culturalWeight: 5,
  communicationWeight: 6,
  physicalWeight: 4,
  learningWeight: 5
};

/**
 * Multi-dimensional scores for different compatibility dimensions
 */
export interface DimensionalScores {
  interests: number;             // 0-1
  values: number;                // 0-1
  professional: number;          // 0-1
  cultural: number;              // 0-1
  communication: number;         // 0-1
  physical: number;              // 0-1
  learning: number;              // 0-1
}

/**
 * Response structure for conversation starters
 */
export interface ConversationStarterSet {
  context: 'professional' | 'social' | 'learning' | 'collaboration';
  starters: Array<{
    opener: string;              // Initial question/statement
    followUps: string[];         // 2-3 follow-up questions
    relevantTopics: string[];    // Related topics to explore
  }>;
}

/**
 * Enhanced response structure for overlap analysis
 */
export interface EnhancedOverlapAnalysisResponse {
  // Text analysis
  summary: string;                           // Brief overview of compatibility (1-2 paragraphs)
  detailedAnalysis: string;                  // More in-depth analysis (3-5 paragraphs)
  
  // Score data
  overallScore: number;                      // 0-1 aggregate score
  dimensionalScores: DimensionalScores;      // Scores by dimension
  confidenceLevel: number;                   // 0-1 confidence in analysis
  
  // Shared elements
  exactMatchInterests: string[];             // Exact interest matches
  semanticMatchInterests: SemanticMatch[];   // Semantic interest matches
  commonIdentities: string[];                // Shared identity attributes
  differentIdentities: Record<string, {current: string; target: string}>;
  
  // Actionable elements
  keyInsights: string[];                     // List of 3-5 key compatibility insights
  conversationStarters: ConversationStarterSet[];
  recommendedActivities: {
    quick: string[];                         // Immediate, low-commitment activities
    projects: string[];                      // Longer-term collaboration ideas
    learning: string[];                      // Mutual learning opportunities
  };
  growthAreas: {
    description: string;                     // Description of growth opportunity
    relevantAttributes: string[];            // Related attributes/interests
  }[];
}

/**
 * Enum for attribute categories to simplify mapping
 */
enum AttributeCategory {
  Values = "values",
  Professional = "professional",
  Cultural = "cultural",
  Communication = "communication",
  Physical = "physical",
  Learning = "learning"
}

/**
 * Map of user attributes to their categories for dimensional scoring
 */
const attributeCategories: Record<string, AttributeCategory> = {
  "personalValues": AttributeCategory.Values,
  "professionalField": AttributeCategory.Professional,
  "education": AttributeCategory.Professional,
  "occupation": AttributeCategory.Professional,
  "countryOfOrigin": AttributeCategory.Cultural,
  "culturalBackground": AttributeCategory.Cultural,
  "languagesSpoken": AttributeCategory.Cultural,
  "culturalExperiences": AttributeCategory.Cultural,
  "collaborationStyle": AttributeCategory.Communication,
  "eventPreferences": AttributeCategory.Communication,
  "digitalIdentity": AttributeCategory.Communication,
  "communityAffiliations": AttributeCategory.Communication,
  "physicalActivityLevel": AttributeCategory.Physical,
  "learningStyle": AttributeCategory.Learning,
};

/**
 * Calculate profile completeness score and identify missing fields
 */
function calculateProfileCompleteness(user: User): {
  score: number;
  missingCriticalFields: string[];
  suggestedImprovements: string[];
} {
  // List of all potential profile fields to check
  const profileFields = [
    "bio", "gender", "ageRange", "countryOfOrigin", "languagesSpoken",
    "culturalBackground", "education", "professionalField", "communityAffiliations",
    "eventPreferences", "collaborationStyle", "personalValues", "digitalIdentity",
    "physicalActivityLevel", "culturalExperiences", "learningStyle"
  ];
  
  // Fields considered critical for good analysis
  const criticalFields = [
    "ageRange", "professionalField", "education", 
    "personalValues", "learningStyle", "collaborationStyle"
  ];
  
  // Count filled fields
  const filledFields = profileFields.filter(field => 
    user[field as keyof User] !== null && 
    user[field as keyof User] !== undefined && 
    user[field as keyof User] !== ""
  );
  
  // Calculate completeness score
  const completenessScore = filledFields.length / profileFields.length;
  
  // Find missing critical fields
  const missingCriticalFields = criticalFields.filter(field => 
    !user[field as keyof User]
  );
  
  // Generate suggestions based on missing fields
  const suggestedImprovements: string[] = [];
  
  if (!user.personalValues) {
    suggestedImprovements.push("Add your personal values to improve value compatibility analysis");
  }
  
  if (!user.professionalField) {
    suggestedImprovements.push("Specify your professional field for better career-related matching");
  }
  
  if (!user.learningStyle) {
    suggestedImprovements.push("Add your learning style to find compatible learning partners");
  }
  
  if (suggestedImprovements.length === 0 && missingCriticalFields.length > 0) {
    suggestedImprovements.push(`Complete your profile by adding: ${missingCriticalFields.join(", ")}`);
  }
  
  return {
    score: completenessScore,
    missingCriticalFields,
    suggestedImprovements
  };
}

/**
 * Calculate dimensional compatibility scores between two users
 */
function calculateDimensionalScores(
  currentUser: User,
  targetUser: User,
  semanticResult: {
    exactMatches: string[];
    semanticMatches: SemanticMatch[];
    overallSimilarity: number;
  },
  weights: AttributeWeights = DEFAULT_WEIGHTS
): {
  dimensionalScores: DimensionalScores;
  overallScore: number;
  confidenceLevel: number;
} {
  // Extract all attributes for comparison
  const userAttributes = [
    "gender", "ageRange", "countryOfOrigin", "languagesSpoken",
    "culturalBackground", "education", "professionalField", "communityAffiliations",
    "eventPreferences", "collaborationStyle", "personalValues", "digitalIdentity",
    "physicalActivityLevel", "culturalExperiences", "learningStyle",
  ];
  
  // Calculate matches by category
  const categoryMatches: Record<AttributeCategory, {matches: number, total: number}> = {
    [AttributeCategory.Values]: { matches: 0, total: 0 },
    [AttributeCategory.Professional]: { matches: 0, total: 0 },
    [AttributeCategory.Cultural]: { matches: 0, total: 0 },
    [AttributeCategory.Communication]: { matches: 0, total: 0 },
    [AttributeCategory.Physical]: { matches: 0, total: 0 },
    [AttributeCategory.Learning]: { matches: 0, total: 0 }
  };
  
  // Count attribute matches by category
  userAttributes.forEach(attr => {
    const currentValue = currentUser[attr as keyof User];
    const targetValue = targetUser[attr as keyof User];
    
    // Skip if either value is missing
    if (!currentValue || !targetValue) return;
    
    const category = attributeCategories[attr] || AttributeCategory.Values;
    categoryMatches[category].total++;
    
    if (currentValue === targetValue) {
      categoryMatches[category].matches++;
    }
  });
  
  // Calculate interest similarity score - already calculated by semanticResult
  const interestScore = semanticResult.overallSimilarity;
  
  // Calculate dimensional scores
  const dimensionalScores: DimensionalScores = {
    interests: interestScore,
    values: categoryMatches[AttributeCategory.Values].total > 0 
      ? categoryMatches[AttributeCategory.Values].matches / categoryMatches[AttributeCategory.Values].total 
      : 0,
    professional: categoryMatches[AttributeCategory.Professional].total > 0 
      ? categoryMatches[AttributeCategory.Professional].matches / categoryMatches[AttributeCategory.Professional].total 
      : 0,
    cultural: categoryMatches[AttributeCategory.Cultural].total > 0 
      ? categoryMatches[AttributeCategory.Cultural].matches / categoryMatches[AttributeCategory.Cultural].total 
      : 0,
    communication: categoryMatches[AttributeCategory.Communication].total > 0 
      ? categoryMatches[AttributeCategory.Communication].matches / categoryMatches[AttributeCategory.Communication].total 
      : 0,
    physical: categoryMatches[AttributeCategory.Physical].total > 0 
      ? categoryMatches[AttributeCategory.Physical].matches / categoryMatches[AttributeCategory.Physical].total 
      : 0,
    learning: categoryMatches[AttributeCategory.Learning].total > 0 
      ? categoryMatches[AttributeCategory.Learning].matches / categoryMatches[AttributeCategory.Learning].total 
      : 0
  };
  
  // Calculate weighted overall score
  const totalWeight = 
    weights.interestsWeight + 
    weights.valuesWeight + 
    weights.professionalWeight + 
    weights.culturalWeight + 
    weights.communicationWeight + 
    weights.physicalWeight + 
    weights.learningWeight;
  
  const weightedScore = 
    (dimensionalScores.interests * weights.interestsWeight) +
    (dimensionalScores.values * weights.valuesWeight) +
    (dimensionalScores.professional * weights.professionalWeight) +
    (dimensionalScores.cultural * weights.culturalWeight) +
    (dimensionalScores.communication * weights.communicationWeight) +
    (dimensionalScores.physical * weights.physicalWeight) +
    (dimensionalScores.learning * weights.learningWeight);
  
  const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
  
  // Calculate confidence level based on profile completeness
  const currentUserCompleteness = calculateProfileCompleteness(currentUser);
  const targetUserCompleteness = calculateProfileCompleteness(targetUser);
  
  const confidenceLevel = (currentUserCompleteness.score + targetUserCompleteness.score) / 2;
  
  return {
    dimensionalScores,
    overallScore,
    confidenceLevel
  };
}

/**
 * Find common and different identity attributes between users
 */
function analyzeIdentityAttributes(
  currentUser: User,
  targetUser: User
): {
  commonIdentities: string[];
  differentIdentities: Record<string, {current: string; target: string}>;
} {
  const userAttributes = [
    "gender", "ageRange", "countryOfOrigin", "languagesSpoken",
    "culturalBackground", "education", "professionalField", "communityAffiliations",
    "eventPreferences", "collaborationStyle", "personalValues", "digitalIdentity",
    "physicalActivityLevel", "culturalExperiences", "learningStyle",
  ];
  
  const commonIdentities: string[] = [];
  const differentIdentities: Record<string, {current: string; target: string}> = {};
  
  userAttributes.forEach(attr => {
    const currentValue = currentUser[attr as keyof User];
    const targetValue = targetUser[attr as keyof User];
    
    if (currentValue && targetValue) {
      if (currentValue === targetValue) {
        commonIdentities.push(String(currentValue));
      } else {
        differentIdentities[attr] = {
          current: String(currentValue),
          target: String(targetValue)
        };
      }
    }
  });
  
  return { commonIdentities, differentIdentities };
}

/**
 * Generate an enhanced prompt for OpenAI that requests the structured response
 */
function generateEnhancedPrompt(
  currentUser: User, 
  targetUser: User,
  semanticResult: {
    exactMatches: string[];
    semanticMatches: SemanticMatch[];
    overallSimilarity: number;
  },
  dimensionalScores: DimensionalScores,
  overallScore: number,
  confidenceLevel: number,
  identityAnalysis: {
    commonIdentities: string[];
    differentIdentities: Record<string, {current: string; target: string}>;
  },
  userPreferences?: AttributeWeights
): string {
  const weights = userPreferences || DEFAULT_WEIGHTS;
  
  // Format semantic matches for inclusion in the prompt
  const formattedSemanticMatches = semanticResult.semanticMatches
    .map(match => `${match.interest1} ⟷ ${match.interest2} (similarity: ${Math.round(match.similarityScore * 100)}%)`)
    .join("\n");
  
  // Format different identity attributes
  const formattedDifferences = Object.entries(identityAnalysis.differentIdentities)
    .map(([attr, values]) => `${attr}: ${values.current} (User 1) vs ${values.target} (User 2)`)
    .join("\n");
  
  return `
# User Compatibility Analysis Request

## User Profiles

User 1 (Current User):
- Name: ${currentUser.displayName || currentUser.username}
- Gender: ${currentUser.gender || "Not specified"}
- Age Range: ${currentUser.ageRange || "Not specified"}
- Country of Origin: ${currentUser.countryOfOrigin || "Not specified"}
- Languages: ${currentUser.languagesSpoken || "Not specified"}
- Cultural Background: ${currentUser.culturalBackground || "Not specified"}
- Education: ${currentUser.education || "Not specified"}
- Professional Field: ${currentUser.professionalField || "Not specified"}
- Community Affiliations: ${currentUser.communityAffiliations || "Not specified"}
- Event Preferences: ${currentUser.eventPreferences || "Not specified"}
- Collaboration Style: ${currentUser.collaborationStyle || "Not specified"}
- Personal Values: ${currentUser.personalValues || "Not specified"}
- Digital Identity: ${currentUser.digitalIdentity || "Not specified"}
- Physical Activity Level: ${currentUser.physicalActivityLevel || "Not specified"}
- Cultural Experiences: ${currentUser.culturalExperiences || "Not specified"}
- Learning Style: ${currentUser.learningStyle || "Not specified"}
- Bio: ${currentUser.bio || "Not provided"}

User 2 (Target User):
- Name: ${targetUser.displayName || targetUser.username}
- Gender: ${targetUser.gender || "Not specified"}
- Age Range: ${targetUser.ageRange || "Not specified"}
- Country of Origin: ${targetUser.countryOfOrigin || "Not specified"}
- Languages: ${targetUser.languagesSpoken || "Not specified"}
- Cultural Background: ${targetUser.culturalBackground || "Not specified"}
- Education: ${targetUser.education || "Not specified"}
- Professional Field: ${targetUser.professionalField || "Not specified"}
- Community Affiliations: ${targetUser.communityAffiliations || "Not specified"}
- Event Preferences: ${targetUser.eventPreferences || "Not specified"}
- Collaboration Style: ${targetUser.collaborationStyle || "Not specified"}
- Personal Values: ${targetUser.personalValues || "Not specified"}
- Digital Identity: ${targetUser.digitalIdentity || "Not specified"}
- Physical Activity Level: ${targetUser.physicalActivityLevel || "Not specified"}
- Cultural Experiences: ${targetUser.culturalExperiences || "Not specified"}
- Learning Style: ${targetUser.learningStyle || "Not specified"}
- Bio: ${targetUser.bio || "Not provided"}

## Compatibility Analysis

### Interest Overlap
- Exact Matching Interests: ${semanticResult.exactMatches.length > 0 ? semanticResult.exactMatches.join(", ") : "None"}
- Semantically Similar Interests:
${formattedSemanticMatches || "None identified"}
- Interest Similarity Score: ${Math.round(semanticResult.overallSimilarity * 100)}%

### Identity Attribute Overlap
- Common Identity Attributes: ${identityAnalysis.commonIdentities.length > 0 ? identityAnalysis.commonIdentities.join(", ") : "None"}
- Different Identity Attributes:
${formattedDifferences || "None identified"}

### Calculated Compatibility Scores
- Overall Compatibility: ${Math.round(overallScore * 100)}%
- Interests Compatibility: ${Math.round(dimensionalScores.interests * 100)}% (Weight: ${weights.interestsWeight}/10)
- Values Compatibility: ${Math.round(dimensionalScores.values * 100)}% (Weight: ${weights.valuesWeight}/10)
- Professional Compatibility: ${Math.round(dimensionalScores.professional * 100)}% (Weight: ${weights.professionalWeight}/10)
- Cultural Compatibility: ${Math.round(dimensionalScores.cultural * 100)}% (Weight: ${weights.culturalWeight}/10)
- Communication Compatibility: ${Math.round(dimensionalScores.communication * 100)}% (Weight: ${weights.communicationWeight}/10)
- Physical Activity Compatibility: ${Math.round(dimensionalScores.physical * 100)}% (Weight: ${weights.physicalWeight}/10)
- Learning Style Compatibility: ${Math.round(dimensionalScores.learning * 100)}% (Weight: ${weights.learningWeight}/10)
- Analysis Confidence Level: ${Math.round(confidenceLevel * 100)}%

## Analysis Request

Using the data above, please generate a structured response in valid JSON format that includes ALL of the following elements:

1. summary: A brief overview of compatibility (1-2 paragraphs)
2. detailedAnalysis: More comprehensive analysis (3-5 paragraphs)
3. keyInsights: Array of 3-5 specific insights about their compatibility
4. conversationStarters: Array of conversation starter objects, each with a "context" field and a "starters" array containing objects with "opener" and "followUps" fields
5. recommendedActivities: Object with "quick", "projects", and "learning" arrays of activity suggestions
6. growthAreas: Array of objects with "description" and "relevantAttributes" fields for growth opportunities

Your response must be in proper JSON format that can be parsed by JavaScript.
`;
}

/**
 * Enhanced function to generate user overlap analysis with semantic understanding
 * and structured output
 */
export async function generateEnhancedUserOverlapAnalysis(
  currentUser: User,
  targetUser: User,
  currentUserInterests: string[],
  targetUserInterests: string[],
  userPreferences?: AttributeWeights
): Promise<EnhancedOverlapAnalysisResponse> {
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
    
    log("Generating enhanced overlap analysis with OpenAI");
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
    
    return enhancedResponse;
    
  } catch (error) {
    log("Error generating enhanced user overlap analysis:", error instanceof Error ? error.message : String(error));
    
    // Provide a fallback response with basic information
    return {
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
  }
}