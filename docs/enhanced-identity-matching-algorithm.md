# Enhanced Identity Matching Algorithm Documentation

## Overview

The enhanced matching algorithm for Overlapp provides a more nuanced approach to connecting users based on identity attributes, interests, and preferences. This document outlines the architecture, implementation details, and usage of the enhanced algorithm.

## Key Features

1. **Partial Attribute Matching** - Match users even when attributes are not an exact match
2. **Semantic Similarity Detection** - Detect similarities in text fields using semantic analysis
3. **Interest Rarity Weighting** - Prioritize rare shared interests over common ones
4. **Adaptive Learning** - Adjust matching weights based on user feedback
5. **AI-Powered Compatibility Insights** - Generate personalized compatibility summaries
6. **Engagement Prediction** - Calculate likelihood of meaningful interaction

## Algorithm Components

### Identity Scoring

The identity scoring function (`calculateIdentityScore`) evaluates how well two users match based on their identity attributes:

```typescript
export function calculateIdentityScore(
  user1: User,
  user2: User,
  attributeImportance?: Record<string, number>
): { score: number; commonIdentities: string[] } {
  // Identity attributes to compare
  const identityAttributes = [
    'gender', 'ageRange', 'countryOfOrigin', 'languagesSpoken', 'culturalBackground',
    'education', 'professionalField', 'communityAffiliations', 'eventPreferences',
    'collaborationStyle', 'personalValues', 'digitalIdentity', 'physicalActivityLevel',
    'culturalExperiences', 'learningStyle'
  ];

  // Default importance if not specified
  const defaultImportance = 5;

  // Track matches
  const matchScores: Record<string, number> = {};
  const commonIdentities: string[] = [];
  
  // Calculate matches for each attribute
  for (const attr of identityAttributes) {
    const attrKey = attr as keyof User;
    const importance = attributeImportance?.[attr] || defaultImportance;
    
    // Skip attributes with 0 importance
    if (importance === 0) continue;
    
    // Skip if either user doesn't have this attribute
    if (!user1[attrKey] || !user2[attrKey]) continue;
    
    // Calculate match score for this attribute (0-1)
    let attrScore = 0;
    
    // Different matching logic based on attribute type
    if (attr === 'ageRange') {
      // Adjacent age ranges are partial matches
      attrScore = calculateAgeRangeMatch(user1[attrKey] as string, user2[attrKey] as string);
    } 
    else if (attr === 'languagesSpoken') {
      // Match on any shared language
      attrScore = calculateLanguageMatch(user1[attrKey] as string, user2[attrKey] as string);
    }
    else if (['culturalBackground', 'personalValues', 'communityAffiliations'].includes(attr)) {
      // Text fields that should match on semantic similarity
      attrScore = calculateTextSimilarity(user1[attrKey] as string, user2[attrKey] as string);
    }
    else {
      // Exact match for other attributes
      attrScore = user1[attrKey] === user2[attrKey] ? 1 : 0;
    }
    
    // Record matches
    if (attrScore > 0) {
      matchScores[attr] = attrScore;
      // Only count as common identity if match is strong enough
      if (attrScore >= 0.5) {
        commonIdentities.push(attr);
      }
    }
  }
  
  // Calculate weighted score
  let totalImportance = 0;
  let weightedScore = 0;
  
  for (const attr of Object.keys(matchScores)) {
    const importance = attributeImportance?.[attr] || defaultImportance;
    weightedScore += matchScores[attr] * importance;
    totalImportance += importance;
  }
  
  // Normalize score (0-1)
  const score = totalImportance > 0 ? weightedScore / totalImportance : 0;
  
  return {
    score,
    commonIdentities
  };
}
```

### Interest Matching

The enhanced interest matching algorithm (`calculateInterestScore`) focuses on shared interests and weights them by rarity:

```typescript
export async function calculateInterestScore(
  user1Id: number,
  user2Id: number
): Promise<{ score: number; sharedInterests: string[] }> {
  // Get user interests from database
  const user1Interests = await getUserInterests(user1Id);
  const user2Interests = await getUserInterests(user2Id);

  // Find shared interests
  const sharedInterests = user1Interests.filter(interest => 
    user2Interests.includes(interest)
  );

  // Calculate base score
  const totalInterestCount = new Set([...user1Interests, ...user2Interests]).size;
  let score = totalInterestCount > 0 ? sharedInterests.length / totalInterestCount : 0;

  // Enhance score with rarity weighting (shared rare interests are more valuable)
  if (sharedInterests.length > 0) {
    const interestFrequency = await getInterestFrequency();
    let rarityScore = 0;
    
    for (const interest of sharedInterests) {
      const frequency = interestFrequency.get(interest) || 1;
      const rarityValue = 1 - Math.min(0.9, frequency / 20); // 0.1 to 1, with 1 being rarest
      rarityScore += rarityValue;
    }
    
    // Adjust score with rarity bonus (max 25% boost)
    const rarityBonus = sharedInterests.length > 0 ? 
      (rarityScore / sharedInterests.length) * 0.25 : 0;
    
    score = Math.min(1, score + rarityBonus);
  }

  return { score, sharedInterests };
}
```

### Combined Matching

The main matching algorithm (`getPotentialMatches`) combines identity and interest scores:

```typescript
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
  // Process all potential matches
  // ...

  // For each potential match
  for (const user of potentialMatches) {
    // Calculate identity score
    const identityResult = calculateIdentityScore(currentUser, user, attributeImportance);
    
    // Calculate interest score
    const interestResult = await calculateInterestScore(userId, user.id);
    
    // Combine scores with weights
    const combinedScore = (identityWeight * identityResult.score) + 
                         (interestWeight * interestResult.score);
    
    // Calculate engagement prediction
    const engagementScore = calculateEngagementScore(
      identityResult.score,
      interestResult.score,
      identityResult.commonIdentities.length,
      interestResult.sharedInterests.length
    );
    
    // Generate AI compatibility insights if requested
    let compatibilityInsights;
    if (includeCompatibilityInsights && combinedScore > 0.5) {
      compatibilityInsights = await generateCompatibilityInsights(
        currentUser,
        user,
        identityResult.commonIdentities,
        interestResult.sharedInterests
      );
    }
    
    // Add to results
    // ...
  }
  
  // Sort and return
  // ...
}
```

### Adaptive Learning

The algorithm adapts over time based on user feedback:

```typescript
export async function updateMatchingWeights(
  userId: number,
  recentFeedback: MatchFeedback[]
): Promise<void> {
  // Get current preferences
  const user = await getUser(userId);
  if (!user || !user.identityPreferences) {
    return;
  }
  
  const currentPreferences = user.identityPreferences;
  
  // Calculate success rates for each attribute
  const attributeSuccessRates: Record<string, { 
    positiveCount: number;
    negativeCount: number;
    totalCount: number;
    successRate: number;
  }> = {};
  
  // Process feedback data
  // ...
  
  // Adjust weights based on success rates
  const newAttributeImportance = { ...currentPreferences.attributeImportance };
  
  for (const attribute of Object.keys(attributeSuccessRates)) {
    const stats = attributeSuccessRates[attribute];
    
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
  
  // Update user preferences
  await updateUserIdentityPreferences(userId, newAttributeImportance);
}
```

## API Endpoints

### Get Identity Matches

```
GET /api/identity-matches/:userId
```

**Query Parameters:**
- `limit` (optional): Maximum number of matches to return
- `identityWeight` (optional): Weight to apply to identity score (0-1)
- `interestWeight` (optional): Weight to apply to interest score (0-1)
- `minIdentityMatches` (optional): Minimum number of identity attributes that must match
- `includeCompatibilityInsights` (optional): Whether to include AI-generated compatibility insights

**Response:**
```json
{
  "matches": [
    {
      "userId": 123,
      "username": "johndoe",
      "displayName": "Jane Doe",
      "avatar": "/uploads/avatar_12345.jpg",
      "bio": "Tech enthusiast and avid hiker",
      "matchScore": 0.85,
      "identityScore": 0.8,
      "interestScore": 0.9,
      "sharedIdentityCount": 4,
      "sharedInterests": ["hiking", "technology", "photography"],
      "commonIdentities": ["ageRange", "professionalField", "eventPreferences", "learningStyle"],
      "compatibilityInsights": "You share a strong professional alignment in technology and both prefer small group settings...",
      "engagementScore": 0.75,
      "proximityMetric": "5 km away"
    }
  ]
}
```

### Update Identity Preferences

```
PATCH /api/users/:userId/identity-preferences
```

**Request Body:**
```json
{
  "attributeImportance": {
    "gender": 8,
    "ageRange": 10,
    "countryOfOrigin": 5,
    "languagesSpoken": 7,
    "culturalBackground": 6,
    "education": 9,
    "professionalField": 10,
    "communityAffiliations": 4,
    "eventPreferences": 8,
    "collaborationStyle": 7,
    "personalValues": 9,
    "digitalIdentity": 6,
    "physicalActivityLevel": 3,
    "culturalExperiences": 8,
    "learningStyle": 5
  }
}
```

**Response:**
```json
{
  "user": {
    // User object with updated preferences
  }
}
```

### Submit Match Feedback

```
POST /api/matches/:userId/feedback
```

**Request Body:**
```json
{
  "targetUserId": 456,
  "score": 1,  // 1 = positive, 0 = neutral, -1 = negative
  "interactionType": "explicit",  // "explicit" or "implicit"
  "interactionDetails": "Connected on chat"  // Optional context
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback received and preferences updated"
}
```

## Performance Considerations

- **Database Queries**: The algorithm minimizes database lookups by batching interest queries
- **Caching**: Frequently accessed data like interest frequency should be cached
- **Batch Processing**: Feedback processing is designed to work in batches
- **Async Operations**: AI-powered insights are generated asynchronously

## Future Enhancements

1. **Geographical Proximity**: Incorporate location data for proximity-based matching
2. **Temporal Match Patterns**: Analyze time-based patterns in successful matches
3. **Multi-modal Matching**: Include image and video content in matching algorithm
4. **Interest Graph Analysis**: Build a graph of related interests for better recommendations
5. **Privacy-Preserving Matching**: Implement secure multi-party computation for sensitive matching

## Implementation Timeline

1. **Phase 1 (Complete)**: Enhanced identity scoring with partial matches
2. **Phase 2 (Complete)**: Interest rarity weighting and semantic matching
3. **Phase 3 (Complete)**: Adaptive learning from user feedback
4. **Phase 4 (Complete)**: AI-powered compatibility insights
5. **Phase 5 (Planned)**: Geographical and temporal matching enhancements