import { OpenAI } from "openai";
import { User, Entity, EntityContent } from "@shared/schema";
import { log } from "./vite";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EntityOverlapAnalysisResponse {
  analysis: string;
  relevantInterests: string[];
  suggestedActivities: string[];
  overlapScore: number;
}

/**
 * Generates an analysis of the overlap/compatibility between a user and an entity
 */
export async function generateEntityUserOverlapAnalysis(
  user: User,
  entity: Entity,
  entityContent: EntityContent[],
  userInterests: string[]
): Promise<EntityOverlapAnalysisResponse> {
  try {
    // Extract entity categories and content
    const entityCategory = entity.category;
    const entityType = entity.entityType;
    const entityName = entity.name;
    const entityDescription = entity.description || "";
    
    // Extract content summaries
    const contentSummaries = entityContent.map(content => 
      `${content.type}: ${content.title} - ${content.description?.substring(0, 100)}...`
    ).join("\n");
    
    // Identify relevant interests that overlap with the entity's category/content
    const relevantInterests = userInterests.filter(interest => {
      // Simple check - this could be enhanced with semantic similarity
      const interestLower = interest.toLowerCase();
      const categoryLower = entityCategory.toLowerCase();
      const descriptionLower = entityDescription.toLowerCase();
      const contentText = contentSummaries.toLowerCase();
      
      return (
        categoryLower.includes(interestLower) || 
        interestLower.includes(categoryLower) ||
        descriptionLower.includes(interestLower) ||
        contentText.includes(interestLower)
      );
    });
    
    // Calculate a simple overlap score
    const overlapScore = userInterests.length > 0 
      ? relevantInterests.length / userInterests.length 
      : 0;
    
    // Adjust the score to ensure it's not too low
    const adjustedScore = Math.min(1, Math.max(0.2, overlapScore) * 1.5);
    
    // Generate suggested activities based on entity type and user interests
    const suggestedActivities: string[] = [];

    // Generate the prompt for AI analysis
    const prompt = generatePrompt(
      user,
      entity,
      entityContent,
      userInterests,
      relevantInterests
    );

    log("Generating entity-user overlap analysis with OpenAI");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert digital-physical identity analyst specializing in understanding the compatibility between users and entities. 
          Your task is to analyze the overlap between a user and an entity (${entityType}: ${entityName}) and provide insightful observations about their compatibility, potential for engagement, and personalized recommendations.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const analysis = response.choices[0].message.content || 
      "Unable to generate analysis. Please try again later.";
    
    // Extract suggested activities from the analysis
    // This is a simplified approach - in production, you might want to have OpenAI
    // return these as structured data
    const activityMatches = analysis.match(/suggested activities?:(.+?)(?:\n\n|\n$|$)/i);
    if (activityMatches && activityMatches[1]) {
      const activitiesText = activityMatches[1].trim();
      const activities = activitiesText
        .split(/(?:\d+\.\s*|\n\s*-\s*|\n\s*•\s*)/)
        .map(a => a.trim())
        .filter(a => a.length > 0)
        .slice(0, 3);
      
      activities.forEach(activity => {
        if (!suggestedActivities.includes(activity)) {
          suggestedActivities.push(activity);
        }
      });
    }
    
    // If we still don't have activities, generate some basic ones
    if (suggestedActivities.length === 0) {
      if (entityType === 'PHYSICAL') {
        suggestedActivities.push(`Visit ${entityName}`);
        suggestedActivities.push(`Explore what ${entityName} has to offer`);
      } else {
        suggestedActivities.push(`Check out ${entityName} online`);
        suggestedActivities.push(`Explore ${entityName}'s digital offerings`);
      }
    }

    return {
      analysis,
      relevantInterests,
      suggestedActivities,
      overlapScore: adjustedScore
    };
  } catch (error) {
    log("Error generating entity-user overlap analysis:", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to generate entity-user overlap analysis");
  }
}

/**
 * Generates a prompt for OpenAI to analyze the overlap between a user and an entity
 */
function generatePrompt(
  user: User,
  entity: Entity,
  entityContent: EntityContent[],
  userInterests: string[],
  relevantInterests: string[]
): string {
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
  
  // Extract entity content by type
  const reviewContent = entityContent
    .filter(c => c.type === 'review')
    .map(c => `${c.title}: ${c.description}`)
    .join("\n");
    
  const eventContent = entityContent
    .filter(c => c.type === 'event')
    .map(c => `${c.title}: ${c.description}`)
    .join("\n");
    
  const productContent = entityContent
    .filter(c => c.type === 'product')
    .map(c => `${c.title}: ${c.description}`)
    .join("\n");
    
  const postContent = entityContent
    .filter(c => c.type === 'post')
    .map(c => `${c.title}: ${c.description}`)
    .join("\n");
    
  return `
## User Profile
Name: ${user.displayName || user.username}
Bio: ${user.bio || "No bio provided"}
${userAttributes.length > 0 ? `Attributes: ${userAttributes.join(", ")}` : ""}
Interests: ${userInterests.join(", ") || "No interests specified"}

## Entity Profile
Name: ${entity.name}
Type: ${entity.entityType} (${entity.category})
Description: ${entity.description}

${reviewContent ? `### Reviews\n${reviewContent}\n` : ""}
${eventContent ? `### Events\n${eventContent}\n` : ""}
${productContent ? `### Products\n${productContent}\n` : ""}
${postContent ? `### Posts\n${postContent}\n` : ""}

## Overlap Information
Relevant user interests: ${relevantInterests.length > 0 ? relevantInterests.join(", ") : "No directly relevant interests found"}

## Analysis Request
Please provide:
1. A detailed, personalized analysis of how this entity aligns with the user's interests and identity
2. Why this entity might be particularly appealing to the user
3. Suggested activities or engagement opportunities based on the user's profile
4. If the user has few or no overlapping interests with the entity, suggest why this entity might still be interesting to explore

Keep your analysis conversational and personalized to both the user and entity characteristics. Focus on meaningful connections and authentic engagement opportunities.
`;
}