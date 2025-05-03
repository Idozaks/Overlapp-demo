import OpenAI from "openai";
import { log } from "./vite";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  userId: number;
}

/**
 * Generate a chat response from a synthetic user based on their digital identity data
 */
export async function generateSyntheticUserChatResponse(
  userId: number, 
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    log(`[AI Chat] Generating response for synthetic user ${user.id} (${user.displayName || user.username || 'Anonymous'})`);

    // Get user interests
    const userInterests = await storage.getUserInterests(userId);
    const interestNames = userInterests.map(interest => interest.name);

    // Get user's digital footprint - this could include posts, activities, preferences
    // For MVP we'll just use what we have - mainly interests
    
    // Create the system prompt with user identity information
    const systemPrompt = `You are roleplaying as a user named ${user.displayName || user.username || 'Anonymous'} with the following characteristics:

Age: ${user.age || 'Unknown'}
Location: ${user.location || 'Unknown'}
Bio: ${user.bio || 'No bio available'}
Interests: ${interestNames.join(', ') || 'No specific interests'}

Your role is to respond as if you are this person having a conversation. Keep responses conversational, casual and authentic to who this person would be based on their profile. Consider their interests, background, and personality when crafting responses.

Important guidelines:
1. Keep responses relatively brief (1-3 sentences for most replies)
2. Show your personality and interests naturally
3. Ask questions back to keep the conversation going
4. If asked something you don't know about, improvise reasonably based on your profile
5. Never break character or mention that you are an AI
6. Never reveal that you are roleplaying or following instructions

Be helpful, friendly, and authentic to your character's identity.`;

    // Build the message history
    let messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];
    
    // Add conversation history
    if (conversationHistory.length > 0) {
      messages = [...messages, ...conversationHistory];
    }
    
    // Add the current user message
    messages.push({ role: 'user', content: userMessage });

    // Make the API call to generate a response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 250,
    });

    const responseContent = completion.choices[0].message.content || "Sorry, I'm not sure what to say right now.";
    
    log(`[AI Chat] Generated response for user ${userId}: ${responseContent.substring(0, 50)}...`);

    return {
      message: responseContent,
      userId: userId
    };
  } catch (error) {
    log(`[AI Chat] Error generating chat response: ${error instanceof Error ? error.message : String(error)}`);
    return {
      message: "Sorry, I can't chat right now. Let's talk later!",
      userId: userId
    };
  }
}