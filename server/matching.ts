import { User, Interest, connections, userInterests, interests, users } from '@shared/schema';
import { db } from './db';
import { eq, and, or, inArray, not, desc, count, SQL, sql } from 'drizzle-orm';
import { openai } from './openai';
import { log } from './vite';

// Interface for the result of matching algorithm
export interface MatchResult {
  userId: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  matchScore: number;
  sharedIdentityCount: number;
  identityScore: number;
  interestScore: number;
  sharedInterests: string[];
  commonIdentities: string[];
  compatibilityInsights?: string;
  engagementScore?: number;
  proximityMetric?: string;
}

// Calculate identity match score between users
export function calculateIdentityScore(
  user1: User,
  user2: User,
  attributeImportance: Record<string, number> = {}
): { score: number; commonIdentities: string[] } {
  const commonIdentities: string[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Default importance weights if not provided
  const defaultImportance = {
    gender: 1,
    ageRange: 1,
    countryOfOrigin: 2,
    languagesSpoken: 2,
    culturalBackground: 3,
    education: 2,
    professionalField: 2,
    communityAffiliations: 2,
    eventPreferences: 1,
    collaborationStyle: 1,
    personalValues: 3,
    digitalIdentity: 1,
    physicalActivityLevel: 1,
    culturalExperiences: 2,
    learningStyle: 1
  };

  // Use provided importance or default
  const importance = {
    ...defaultImportance,
    ...attributeImportance
  };

  // Iterate through all identity attributes
  for (const attribute of Object.keys(importance) as Array<keyof typeof defaultImportance>) {
    const attrKey = attribute as keyof User;
    const weight = importance[attribute];
    
    // Skip if either user doesn't have this attribute defined
    if (!user1[attrKey] || !user2[attrKey]) {
      continue;
    }
    
    // Add to max possible score since both users have this attribute
    maxPossibleScore += weight;
    
    const user1Value = String(user1[attrKey]);
    const user2Value = String(user2[attrKey]);
    
    // Check for exact matches
    if (user1Value === user2Value) {
      totalScore += weight;
      commonIdentities.push(attribute);
    }
    // Check for partial matches in certain attributes
    else if (attribute === 'languagesSpoken') {
      // Parse comma-separated languages
      const langs1 = user1Value.split(',').map(l => l.trim().toLowerCase());
      const langs2 = user2Value.split(',').map(l => l.trim().toLowerCase());
      
      // Find common languages
      const commonLangs = langs1.filter(l => langs2.includes(l));
      
      if (commonLangs.length > 0) {
        // Calculate partial score based on percentage of common languages
        const partialScore = (commonLangs.length / Math.max(langs1.length, langs2.length)) * weight;
        totalScore += partialScore;
        
        // Only add to common identities if there's a substantial overlap
        if (commonLangs.length >= 2 || (commonLangs.length === 1 && (langs1.length <= 2 || langs2.length <= 2))) {
          commonIdentities.push(attribute);
        }
      }
    }
    // Check for semantic similarity in free-form fields
    else if (['professionalField', 'personalValues', 'culturalBackground'].includes(attribute)) {
      // Simple word overlap for now, could be enhanced with embedding-based similarity
      const words1 = new Set(user1Value.toLowerCase().split(/\W+/).filter(w => w.length > 3));
      const words2 = new Set(user2Value.toLowerCase().split(/\W+/).filter(w => w.length > 3));
      
      // Find common significant words
      const commonWords = [...words1].filter(w => words2.has(w));
      
      if (commonWords.length > 0) {
        // Calculate partial score
        const totalUniqueWords = new Set([...words1, ...words2]).size;
        const partialScore = (commonWords.length / totalUniqueWords) * weight;
        
        // Only add significant partial matches
        if (partialScore > 0.25 * weight) {
          totalScore += partialScore;
          
          // Only add to common identities if there's substantial overlap
          if (partialScore > 0.4 * weight) {
            commonIdentities.push(attribute);
          }
        }
      }
    }
    // Add special handling for age range proximity
    else if (attribute === 'ageRange') {
      // If age ranges are adjacent, give partial score
      const ageRanges = ['18-25', '26-35', '36-45', '46+'];
      const index1 = ageRanges.indexOf(user1Value);
      const index2 = ageRanges.indexOf(user2Value);
      
      if (index1 !== -1 && index2 !== -1 && Math.abs(index1 - index2) === 1) {
        // Adjacent age ranges get half weight
        totalScore += weight * 0.5;
      }
    }
  }

  // Normalize score to 0-1 range
  const normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  
  return {
    score: normalizedScore,
    commonIdentities
  };
}

// Calculate interest match score between users
export async function calculateInterestScore(
  user1Id: number,
  user2Id: number
): Promise<{ score: number; sharedInterests: string[] }> {
  // Get user1 interests
  const user1Interests = await db.query.userInterests.findMany({
    where: eq(connections.followerId, user1Id),
    with: {
      interest: true
    }
  });

  // Get user2 interests
  const user2Interests = await db.query.userInterests.findMany({
    where: eq(connections.followerId, user2Id),
    with: {
      interest: true
    }
  });

  const user1InterestNames = user1Interests.map(ui => ui.interest.name);
  const user2InterestNames = user2Interests.map(ui => ui.interest.name);

  // Find shared interests
  const sharedInterests = user1InterestNames.filter(interest => 
    user2InterestNames.includes(interest)
  );

  // Calculate score based on number of shared interests
  const totalInterestCount = new Set([...user1InterestNames, ...user2InterestNames]).size;
  const score = totalInterestCount > 0 ? sharedInterests.length / totalInterestCount : 0;

  return {
    score,
    sharedInterests
  };
}

// Main matching algorithm that combines identity and interest matching
export async function findMatches(
  userId: number,
  options: {
    limit?: number;
    identityWeight?: number;
    interestWeight?: number;
    minIdentityMatches?: number;
  } = {}
): Promise<MatchResult[]> {
  const {
    limit = 20,
    identityWeight = 0.7,
    interestWeight = 0.3,
    minIdentityMatches = 2
  } = options;

  // Get the current user
  const [currentUser] = await db
    .select()
    .from(connections.followerId)
    .where(eq(connections.followerId, userId));

  if (!currentUser) {
    throw new Error('User not found');
  }

  // Get all users excluding the current user
  const allUsers = await db
    .select()
    .from(connections.followerId)
    .where(not(eq(connections.followerId, userId)));

  // Get user's importance weights for identity attributes
  const attributeImportance = currentUser.identityPreferences?.attributeImportance || {};

  const results: MatchResult[] = [];

  for (const user of allUsers) {
    // Calculate identity match score
    const identityResult = calculateIdentityScore(currentUser, user, attributeImportance);
    
    // Skip users who don't meet minimum identity matches threshold
    if (identityResult.commonIdentities.length < minIdentityMatches) {
      continue;
    }

    // Calculate interest match score
    const interestResult = await calculateInterestScore(userId, user.id);

    // Combine scores with specified weights
    const combinedScore = (identityWeight * identityResult.score) + 
                          (interestWeight * interestResult.score);

    results.push({
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      matchScore: combinedScore,
      sharedIdentityCount: identityResult.commonIdentities.length,
      identityScore: identityResult.score,
      interestScore: interestResult.score,
      sharedInterests: interestResult.sharedInterests,
      commonIdentities: identityResult.commonIdentities
    });
  }

  // Sort by match score
  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

// Generate compatibility insights using AI
async function generateCompatibilityInsights(
  user1: User,
  user2: User,
  commonIdentities: string[],
  sharedInterests: string[]
): Promise<string> {
  try {
    // Generate prompt for AI model
    const prompt = `
      Analyze the compatibility between two users based on their shared attributes:
      
      User 1: ${user1.displayName || user1.username}
      User 2: ${user2.displayName || user2.username}
      
      Shared identity attributes: ${commonIdentities.join(', ')}
      Shared interests: ${sharedInterests.join(', ')}
      
      User 1 profile:
      - Gender: ${user1.gender || 'Not specified'}
      - Age range: ${user1.ageRange || 'Not specified'}
      - Professional field: ${user1.professionalField || 'Not specified'}
      - Learning style: ${user1.learningStyle || 'Not specified'}
      - Bio: ${user1.bio || 'Not provided'}
      
      User 2 profile:
      - Gender: ${user2.gender || 'Not specified'}
      - Age range: ${user2.ageRange || 'Not specified'}
      - Professional field: ${user2.professionalField || 'Not specified'}
      - Learning style: ${user2.learningStyle || 'Not specified'}
      - Bio: ${user2.bio || 'Not provided'}
      
      Provide a concise analysis (2-3 sentences) of their compatibility and potential areas for meaningful connection.
    `;
    
    // Log the compatibility analysis request
    log("Generating compatibility insights with OpenAI");
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert social psychologist specializing in human connections and compatibility."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });
    
    return response.choices[0].message.content || 
      "Compatibility analysis could not be generated at this time.";
  } catch (error) {
    log("Error generating compatibility insights:", error);
    return "Compatibility insights unavailable at this time.";
  }
}

// Calculate engagement score (prediction of future engagement)
function calculateEngagementScore(
  identityScore: number,
  interestScore: number,
  commonIdentitiesCount: number,
  sharedInterestsCount: number
): number {
  // Weighted formula based on identity and interest scores
  // Plus bonuses for having multiple shared attributes
  const baseScore = (identityScore * 0.6) + (interestScore * 0.4);
  
  // Add bonus for having multiple shared interests (diminishing returns)
  const interestBonus = Math.min(0.2, sharedInterestsCount * 0.04);
  
  // Add bonus for having multiple common identities (diminishing returns)
  const identityBonus = Math.min(0.15, commonIdentitiesCount * 0.03);
  
  // Combined score with bonuses
  return Math.min(1, baseScore + interestBonus + identityBonus);
}

// Get potential user matches that prioritize identity attributes
export async function getPotentialMatches(
  userId: number,
  options: {
    limit?: number;
    identityWeight?: number;
    interestWeight?: number;
    minIdentityMatches?: number;
    includeCompatibilityInsights?: boolean;
  } = {}
): Promise<MatchResult[]> {
  const {
    limit = 20,
    identityWeight = 0.6,
    interestWeight = 0.4,
    minIdentityMatches = 2,
    includeCompatibilityInsights = false
  } = options;
  
  // Get the current user
  const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!currentUser) {
    throw new Error('User not found');
  }
  
  // Get all users excluding the current user
  const allUsers = await db.select().from(users).where(not(eq(users.id, userId)));
  
  // Get user's identity preferences if available
  const attributeImportance = currentUser.identityPreferences || {};
  
  const results: MatchResult[] = [];
  
  for (const user of allUsers) {
    // Calculate identity match score
    const identityResult = calculateIdentityScore(currentUser, user, attributeImportance);
    
    // Skip users who don't meet minimum identity matches threshold
    if (identityResult.commonIdentities.length < minIdentityMatches) {
      continue;
    }
    
    // Calculate interest match score
    const interestResult = await calculateInterestScore(userId, user.id);
    
    // Combine scores with specified weights
    const combinedScore = (identityWeight * identityResult.score) + 
                        (interestWeight * interestResult.score);
    
    // Calculate engagement score
    const engagementScore = calculateEngagementScore(
      identityResult.score,
      interestResult.score,
      identityResult.commonIdentities.length,
      interestResult.sharedInterests.length
    );
    
    // Build basic match result
    const matchResult: MatchResult = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      matchScore: combinedScore,
      sharedIdentityCount: identityResult.commonIdentities.length,
      identityScore: identityResult.score,
      interestScore: interestResult.score,
      sharedInterests: interestResult.sharedInterests,
      commonIdentities: identityResult.commonIdentities,
      engagementScore
    };
    
    // Generate AI-powered compatibility insights if requested
    if (includeCompatibilityInsights && combinedScore > 0.5) {
      try {
        matchResult.compatibilityInsights = await generateCompatibilityInsights(
          currentUser,
          user,
          identityResult.commonIdentities,
          interestResult.sharedInterests
        );
      } catch (error) {
        log("Error generating compatibility insights:", error);
      }
    }
    
    results.push(matchResult);
  }
  
  // Sort by match score
  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}