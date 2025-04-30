import { OpenAI } from "openai";
import { User } from "@shared/schema";
import { log } from "./vite";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OverlapAnalysisResponse {
  analysis: string;
  similarInterests: string[];
  uniqueCurrentUserInterests: string[];
  uniqueTargetUserInterests: string[];
  commonIdentities: string[];
  differentIdentities: Record<string, {current: string; target: string}>;
  overlapScore: number;
}

export async function generateUserOverlapAnalysis(
  currentUser: User,
  targetUser: User,
  currentUserInterests: string[],
  targetUserInterests: string[]
): Promise<OverlapAnalysisResponse> {
  try {
    // Extract identity attributes from both users
    const userAttributes = [
      "gender",
      "ageRange",
      "countryOfOrigin",
      "languagesSpoken",
      "culturalBackground",
      "education",
      "professionalField",
      "communityAffiliations",
      "eventPreferences",
      "collaborationStyle",
      "personalValues",
      "digitalIdentity",
      "physicalActivityLevel",
      "culturalExperiences",
      "learningStyle",
    ];

    // Find common and different identity attributes
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

    // Find common and unique interests
    const similarInterests = currentUserInterests.filter(interest => 
      targetUserInterests.includes(interest)
    );
    
    const uniqueCurrentUserInterests = currentUserInterests.filter(interest => 
      !targetUserInterests.includes(interest)
    );
    
    const uniqueTargetUserInterests = targetUserInterests.filter(interest => 
      !currentUserInterests.includes(interest)
    );

    // Calculate a basic overlap score (can be refined further)
    const totalAttributesCount = userAttributes.filter(
      attr => currentUser[attr as keyof User] && targetUser[attr as keyof User]
    ).length;
    
    const totalInterestsCount = 
      similarInterests.length + 
      uniqueCurrentUserInterests.length + 
      uniqueTargetUserInterests.length;

    const identityScore = totalAttributesCount > 0 
      ? commonIdentities.length / totalAttributesCount 
      : 0;
      
    const interestScore = totalInterestsCount > 0 
      ? similarInterests.length / totalInterestsCount 
      : 0;
    
    // Equal weight to identity and interests by default
    const overlapScore = (identityScore + interestScore) / 2;

    // Generate AI analysis
    const prompt = generatePrompt(
      currentUser, 
      targetUser, 
      similarInterests,
      uniqueCurrentUserInterests,
      uniqueTargetUserInterests,
      commonIdentities,
      differentIdentities
    );

    log("Generating overlap analysis with OpenAI");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert social psychologist specializing in human connections and compatibility. Your task is to analyze the overlap between two users and provide insightful observations about their compatibility, shared traits, and potential for meaningful connection. Pay special attention to bio text analysis, looking for implicit interests and personality traits that might not be explicitly listed."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200  // Increased token limit to accommodate more thorough bio analysis
    });

    const analysis = response.choices[0].message.content || 
      "Unable to generate analysis. Please try again later.";

    return {
      analysis,
      similarInterests,
      uniqueCurrentUserInterests,
      uniqueTargetUserInterests,
      commonIdentities,
      differentIdentities,
      overlapScore
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error generating user overlap analysis: ${errorMessage}`);
    throw new Error("Failed to generate user overlap analysis");
  }
}

function generatePrompt(
  currentUser: User,
  targetUser: User,
  similarInterests: string[],
  uniqueCurrentUserInterests: string[],
  uniqueTargetUserInterests: string[],
  commonIdentities: string[],
  differentIdentities: Record<string, {current: string; target: string}>
): string {
  return `
I need you to analyze the compatibility and overlap between two users, paying special attention to their bio text as it often contains important clues about their personality, interests, and values:

Current User (User 1):
- Name: ${currentUser.displayName || currentUser.username}
- Bio: ${currentUser.bio || "Not provided"}
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
- Interests: ${uniqueCurrentUserInterests.length > 0 ? uniqueCurrentUserInterests.join(", ") : "None specified"}

Target User (User 2):
- Name: ${targetUser.displayName || targetUser.username}
- Bio: ${targetUser.bio || "Not provided"}
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
- Interests: ${uniqueTargetUserInterests.length > 0 ? uniqueTargetUserInterests.join(", ") : "None specified"}

Shared Interests: ${similarInterests.length > 0 ? similarInterests.join(", ") : "None"}

Common Identity Attributes: ${commonIdentities.length > 0 ? commonIdentities.join(", ") : "None"}

Please analyze their overlap and provide:
1. A personalized analysis of their compatibility (3-5 paragraphs), including any additional interests or traits you can deduce from their bio text
2. Key areas where they might connect well, based on both explicit interests and information from their bios
3. Potential conversation starters or activities they might enjoy together
4. Areas where they could learn from each other's differences
5. Any hidden or implied shared interests that might be detected in their bios even if not explicitly listed

First, look carefully at their bio texts to extract any implicit interests, values, or traits that aren't captured in their explicit profile data. Then incorporate these insights into your analysis.

Keep your analysis friendly, insightful, and focused on the positive potential for connection.
`;
}