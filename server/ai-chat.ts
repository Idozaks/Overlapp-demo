import OpenAI from "openai";
import { storage } from "./storage";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

/**
 * Generate a synthetic user response in a chat conversation
 * based on their digital identity data and the conversation context
 */
export async function generateSyntheticUserChatResponse(
  userId: number,
  userMessage: string,
  conversationHistory: { role: "user" | "assistant" | "system"; content: string }[] = []
): Promise<{ message: string }> {
  try {
    // Get synthetic user data from database
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error(`Synthetic user with ID ${userId} not found`);
    }
    
    // Get user interests
    const interests = await storage.getUserInterests(userId);
    
    // Get interest names instead of full objects
    const interestNames = interests.map(interest => 
      typeof interest === 'string' ? interest : interest.name
    );
    
    // Build a profile description for context
    const userContext = buildUserContext(user, interestNames);
    
    // Prepare conversation history for the AI
    const systemMessage = {
      role: "system" as const,
      content: `You are roleplaying as a synthetic user named ${user.displayName || user.username} with the following attributes:
        
${userContext}

Your task is to respond in character, based on this digital identity. Keep responses conversational and casual. 
Use a natural tone as if chatting with a friend - be engaging but stay within 1-3 sentences unless asked for more detail.
Never mention that you are an AI - always stay in character as the synthetic user described above.`
    };
    
    // Filter out any existing system messages to avoid conflicts
    const historyMessages = conversationHistory
      .filter(msg => msg.role !== "system")
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    
    const userMsg = { role: "user" as const, content: userMessage };
    
    // Generate response using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest model
      messages: [systemMessage, ...historyMessages, userMsg],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return { message: response.choices[0].message.content || "Sorry, I'm not sure how to respond to that." };
  } catch (error) {
    console.error("Error generating synthetic response:", error);
    return { message: "Sorry, I'm having trouble responding right now. Let's chat again later!" };
  }
}

/**
 * Build a detailed context string about the user based on their profile and interests
 */
function buildUserContext(user: any, interests: string[]): string {
  let context = '';
  
  // Basic profile information
  context += `Name: ${user.displayName || user.username}\n`;
  
  if (user.bio) {
    context += `Bio: ${user.bio}\n`;
  }
  
  if (user.occupation) {
    context += `Occupation: ${user.occupation}\n`;
  }
  
  if (user.location) {
    context += `Location: ${user.location}\n`;
  }
  
  if (user.age) {
    context += `Age: ${user.age}\n`;
  }
  
  // Interests and hobbies
  if (interests && interests.length > 0) {
    context += `Interests: ${interests.join(', ')}\n`;
  }
  
  // Additional characteristics if available
  if (user.personalValues) {
    context += `Personal Values: ${user.personalValues}\n`;
  }
  
  if (user.communities) {
    context += `Communities: ${user.communities}\n`;
  }
  
  return context;
}