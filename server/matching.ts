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
  // Get user1 interests from userInterests table
  const user1Interests = await db.query.userInterests.findMany({
    where: eq(userInterests.userId, user1Id),
    with: {
      interest: true
    }
  });

  // Get user2 interests from userInterests table
  const user2Interests = await db.query.userInterests.findMany({
    where: eq(userInterests.userId, user2Id),
    with: {
      interest: true
    }
  });

  // Extract interest names
  const user1InterestNames = user1Interests.map(ui => ui.interest.name);
  const user2InterestNames = user2Interests.map(ui => ui.interest.name);

  // Find shared interests
  const sharedInterests = user1InterestNames.filter(interest => 
    user2InterestNames.includes(interest)
  );

  // Calculate base score based on number of shared interests
  const totalInterestCount = new Set([...user1InterestNames, ...user2InterestNames]).size;
  let score = totalInterestCount > 0 ? sharedInterests.length / totalInterestCount : 0;

  // Enhance score with semantic weighting
  // Higher weights for rare interests that match
  if (sharedInterests.length > 0) {
    // Get all interests to identify the rare ones
    const allInterests = await db.select({ 
      name: interests.name,
      count: sql<number>`count(${userInterests.id})` 
    })
    .from(interests)
    .leftJoin(userInterests, eq(interests.id, userInterests.interestId))
    .groupBy(interests.name);
    
    // Create a map of interest name to frequency
    const interestFrequency = new Map<string, number>();
    allInterests.forEach(i => {
      interestFrequency.set(i.name, i.count || 0);
    });
    
    // Calculate rarity bonus (shared rare interests give higher score)
    let rarityScore = 0;
    let totalPossibleRarityScore = 0;
    
    for (const interest of sharedInterests) {
      const frequency = interestFrequency.get(interest) || 1;
      const rarityValue = 1 - Math.min(0.9, frequency / 20); // 0.1 to 1, with 1 being rarest
      rarityScore += rarityValue;
      totalPossibleRarityScore += 1;
    }
    
    // Adjust score with rarity bonus (max 25% boost)
    const rarityBonus = totalPossibleRarityScore > 0 ? 
      (rarityScore / totalPossibleRarityScore) * 0.25 : 0;
    
    score = Math.min(1, score + rarityBonus);
  }

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
    includeCompatibilityInsights?: boolean;
  } = {}
): Promise<MatchResult[]> {
  // Forward to the enhanced getPotentialMatches function
  return getPotentialMatches(userId, options);
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

// Store match feedback for adaptive learning
export interface MatchFeedback {
  userId: number;
  targetUserId: number;
  score: number; // -1 (negative), 0 (neutral), 1 (positive)
  timestamp: Date;
  interactionType: 'explicit' | 'implicit';
  interactionDetails?: string;
}

// Update matching weights based on user feedback
export async function updateMatchingWeights(
  userId: number,
  recentFeedback: MatchFeedback[]
): Promise<void> {
  try {
    // Get current user with preferences
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || !user.identityPreferences) {
      return;
    }
    
    // Get current attribute importance
    const currentPreferences = user.identityPreferences as { attributeImportance: Record<string, number> };
    
    // Initialize success rates for each attribute
    const attributeSuccessRates: Record<string, { 
      positiveCount: number;
      negativeCount: number;
      totalCount: number;
      successRate: number;
    }> = {};
    
    // Setup attributes to track
    const identityAttributes = [
      'gender', 'ageRange', 'countryOfOrigin', 'languagesSpoken', 
      'culturalBackground', 'education', 'professionalField', 
      'communityAffiliations', 'eventPreferences', 'collaborationStyle', 
      'personalValues', 'digitalIdentity', 'physicalActivityLevel', 
      'culturalExperiences', 'learningStyle'
    ];
    
    identityAttributes.forEach(attr => {
      attributeSuccessRates[attr] = {
        positiveCount: 0,
        negativeCount: 0,
        totalCount: 0,
        successRate: 0
      };
    });
    
    // Process each feedback entry
    for (const feedback of recentFeedback) {
      // Get the target user
      const [targetUser] = await db.select().from(users).where(eq(users.id, feedback.targetUserId));
      if (!targetUser) continue;
      
      // Check each identity attribute for matches
      for (const attribute of identityAttributes) {
        const attr = attribute as keyof typeof user;
        
        // Skip if either user doesn't have this attribute
        if (!user[attr] || !targetUser[attr]) {
          continue;
        }
        
        // Check if attribute matches
        const isMatch = user[attr] === targetUser[attr];
        if (isMatch) {
          attributeSuccessRates[attribute].totalCount++;
          
          if (feedback.score > 0) {
            attributeSuccessRates[attribute].positiveCount++;
          } else if (feedback.score < 0) {
            attributeSuccessRates[attribute].negativeCount++;
          }
        }
      }
    }
    
    // Calculate success rates for each attribute
    for (const attribute of Object.keys(attributeSuccessRates)) {
      const stats = attributeSuccessRates[attribute];
      stats.successRate = stats.totalCount > 0 
        ? stats.positiveCount / stats.totalCount 
        : 0;
    }
    
    // Create new preferences with adjusted weights
    const newAttributeImportance = { ...currentPreferences.attributeImportance };
    
    for (const attribute of Object.keys(attributeSuccessRates)) {
      const stats = attributeSuccessRates[attribute];
      
      // Only adjust if we have enough data (5+ feedback entries)
      if (stats.totalCount >= 5) {
        const currentWeight = currentPreferences.attributeImportance[attribute] || 5;
        
        // Increase weight for attributes that lead to positive matches
        if (stats.successRate > 0.7) {
          newAttributeImportance[attribute] = Math.min(10, currentWeight + 1);
        } 
        // Decrease weight for attributes that don't correlate with positive matches
        else if (stats.successRate < 0.3) {
          newAttributeImportance[attribute] = Math.max(0, currentWeight - 1);
        }
      }
    }
    
    // Update user's identity preferences with new weights
    await db.update(users)
      .set({ 
        identityPreferences: { 
          attributeImportance: newAttributeImportance 
        } 
      })
      .where(eq(users.id, userId));
      
    log(`Updated identity preferences for user ${userId} based on feedback`);
    
  } catch (error) {
    log("Error updating matching weights:", error instanceof Error ? error.message : String(error));
  }
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