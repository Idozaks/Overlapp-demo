import OpenAI from "openai";

// Create an OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interface for the analysis request data
export interface AnalysisRequest {
  entityType: 'persona' | 'online' | 'physical';
  entityName: string;
  entityDescription: string;
  userInterests: string[];
  entityInterests: string[];
  sharedInterests: string[];
}

// Interface for the analysis response data
export interface AnalysisResponse {
  compatibilityScore: number;
  compatibilityReasoning: string;
  topMatchCategories: { category: string; score: number }[];
  conversationStarters: string[];
  insightSummary: string;
}

/**
 * Generates an AI-powered analysis of the overlap between a user and an entity
 * 
 * @param data The analysis request data
 * @returns The AI analysis response
 */
export async function generateAIAnalysis(data: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    // Construct a prompt for the GPT-4o model
    const prompt = `
You are an AI overlap analysis expert for a digital identity platform called Overlapp. 
Analyze the compatibility between a user and ${data.entityType === 'persona' ? 'another person' : 'an entity'} named "${data.entityName}".

About the entity: ${data.entityDescription}

User's interests: ${data.userInterests.join(', ')}
Entity's interests/attributes: ${data.entityInterests.join(', ')}
Shared interests: ${data.sharedInterests.join(', ')}

Please provide a detailed analysis in the following JSON format:
{
  "compatibilityScore": (provide a compatibility score from 0-100 based on the overlap, with more significant overlaps rated higher),
  "compatibilityReasoning": (1-3 sentences explaining why the score was assigned),
  "topMatchCategories": [
    { "category": "category name", "score": 0-100 } 
    (list 3-5 categories derived from the shared interests, with scores)
  ],
  "conversationStarters": [
    (provide 3 thoughtful conversation starters based on shared interests)
  ],
  "insightSummary": (summarize the key insights about this overlap in 2-3 sentences)
}
`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a digital identity overlap analysis expert." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    const analysis = JSON.parse(content ? content : '{}') as AnalysisResponse;
    
    return analysis;
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    // Provide a fallback response in case of API error
    return {
      compatibilityScore: Math.floor(data.sharedInterests.length / (data.userInterests.length + data.entityInterests.length) * 200),
      compatibilityReasoning: "Based on the number of shared interests relative to total interests.",
      topMatchCategories: data.sharedInterests.slice(0, 3).map(interest => ({ 
        category: interest, 
        score: Math.floor(Math.random() * 30) + 70 
      })),
      conversationStarters: [
        `I see you're also interested in ${data.sharedInterests[0] || 'similar topics'}. What aspects do you enjoy most?`,
        `How did you develop your interest in ${data.sharedInterests[1] || 'these areas'}?`,
        `Have you found any interesting connections between ${data.sharedInterests[0] || 'your interests'} and ${data.sharedInterests[2] || 'other topics'}?`
      ],
      insightSummary: `There ${data.sharedInterests.length > 1 ? 'are' : 'is'} ${data.sharedInterests.length} shared interest${data.sharedInterests.length !== 1 ? 's' : ''} between you and ${data.entityName}.`
    };
  }
}