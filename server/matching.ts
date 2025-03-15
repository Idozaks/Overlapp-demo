import { User, Interest, connections } from '@shared/schema';
import { db } from './db';
import { eq, and, or, inArray, not, desc, count, SQL, sql } from 'drizzle-orm';

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

  // Helper function to check attribute match
  const checkAttributeMatch = (attribute: keyof typeof defaultImportance) => {
    const user1Value = user1[attribute as keyof User];
    const user2Value = user2[attribute as keyof User];
    
    if (user1Value && user2Value && user1Value === user2Value) {
      totalScore += importance[attribute];
      commonIdentities.push(attribute);
    }
    maxPossibleScore += importance[attribute];
  };

  // Check all identity attributes
  checkAttributeMatch('gender');
  checkAttributeMatch('ageRange');
  checkAttributeMatch('countryOfOrigin');
  checkAttributeMatch('languagesSpoken');
  checkAttributeMatch('culturalBackground');
  checkAttributeMatch('education');
  checkAttributeMatch('professionalField');
  checkAttributeMatch('communityAffiliations');
  checkAttributeMatch('eventPreferences');
  checkAttributeMatch('collaborationStyle');
  checkAttributeMatch('personalValues');
  checkAttributeMatch('digitalIdentity');
  checkAttributeMatch('physicalActivityLevel');
  checkAttributeMatch('culturalExperiences');
  checkAttributeMatch('learningStyle');

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

// Get potential user matches that prioritize identity attributes
export async function getPotentialMatches(
  userId: number,
  options: {
    limit?: number;
    identityWeight?: number;
    interestWeight?: number;
    minIdentityMatches?: number;
  } = {}
): Promise<MatchResult[]> {
  return await findMatches(userId, options);
}