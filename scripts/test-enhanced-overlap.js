/**
 * Test Script for Enhanced Overlap Analysis
 * 
 * This script demonstrates the enhanced user-to-user and user-to-entity
 * overlap analysis functionality with semantic understanding and structured outputs.
 */

import dotenv from 'dotenv';
import { db } from '../server/db.js';
import { log } from '../server/vite.js';
import { users, interests, entities, entityContent } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { generateEnhancedUserOverlapAnalysis } from '../server/enhancedUserOverlap.js';
import { generateEnhancedEntityUserOverlapAnalysis } from '../server/enhancedEntityOverlap.js';

// Load environment variables
dotenv.config();

/**
 * Fetches a user by ID from the database
 */
async function getUser(userId) {
  try {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0] || null;
  } catch (error) {
    log("Error fetching user:", error);
    return null;
  }
}

/**
 * Fetches user interests from the database
 */
async function getUserInterests(userId) {
  try {
    // First get the interest IDs from user_interests junction table
    const userInterestsResult = await db.execute(
      `SELECT interest_id FROM user_interests WHERE user_id = $1`,
      [userId]
    );
    
    const interestIds = userInterestsResult.rows.map(row => row.interest_id);
    
    if (interestIds.length === 0) {
      return [];
    }
    
    // Then get the interest names
    const interestsResult = await db.select({ name: interests.name })
      .from(interests)
      .where(
        // Use a SQL IN condition for multiple IDs
        `id IN (${interestIds.join(',')})`
      );
    
    return interestsResult.map(i => i.name);
  } catch (error) {
    log("Error fetching user interests:", error);
    return [];
  }
}

/**
 * Fetches an entity by ID from the database
 */
async function getEntity(entityId) {
  try {
    const result = await db.select().from(entities).where(eq(entities.id, entityId)).limit(1);
    return result[0] || null;
  } catch (error) {
    log("Error fetching entity:", error);
    return null;
  }
}

/**
 * Fetches entity content from the database
 */
async function getEntityContent(entityId) {
  try {
    const result = await db.select().from(entityContent).where(eq(entityContent.entityId, entityId));
    return result;
  } catch (error) {
    log("Error fetching entity content:", error);
    return [];
  }
}

/**
 * Tests the enhanced user-to-user overlap analysis
 */
async function testUserOverlap(userId1, userId2) {
  try {
    console.log(`\n===== TESTING ENHANCED USER OVERLAP ANALYSIS =====\n`);
    console.log(`Analyzing overlap between users ${userId1} and ${userId2}...`);
    
    // Fetch user data
    const user1 = await getUser(userId1);
    const user2 = await getUser(userId2);
    
    if (!user1 || !user2) {
      console.error("Error: One or both users not found");
      return;
    }
    
    console.log(`\nUser 1: ${user1.displayName || user1.username}`);
    console.log(`User 2: ${user2.displayName || user2.username}`);
    
    // Fetch user interests
    const user1Interests = await getUserInterests(userId1);
    const user2Interests = await getUserInterests(userId2);
    
    console.log(`\nUser 1 Interests (${user1Interests.length}): ${user1Interests.join(', ')}`);
    console.log(`User 2 Interests (${user2Interests.length}): ${user2Interests.join(', ')}`);
    
    // Define custom weights (optional)
    const customWeights = {
      interestsWeight: 8,
      valuesWeight: 6,
      professionalWeight: 7,
      culturalWeight: 5,
      communicationWeight: 6,
      physicalWeight: 4,
      learningWeight: 5
    };
    
    console.log("\nGenerating enhanced overlap analysis...");
    const analysis = await generateEnhancedUserOverlapAnalysis(
      user1, 
      user2, 
      user1Interests, 
      user2Interests, 
      customWeights
    );
    
    // Display the results
    console.log("\n===== ANALYSIS RESULTS =====\n");
    console.log("Summary:");
    console.log(analysis.summary);
    
    console.log("\nOverall Score:", Math.round(analysis.overallScore * 100) + "%");
    console.log("Confidence Level:", Math.round(analysis.confidenceLevel * 100) + "%");
    
    console.log("\nDimensional Scores:");
    Object.entries(analysis.dimensionalScores).forEach(([dimension, score]) => {
      console.log(`- ${dimension}: ${Math.round(score * 100)}%`);
    });
    
    console.log("\nExact Match Interests:", analysis.exactMatchInterests.join(", ") || "None");
    
    console.log("\nSemantic Match Interests:");
    analysis.semanticMatchInterests.forEach(match => {
      console.log(`- ${match.interest1} ⟷ ${match.interest2} (${Math.round(match.similarityScore * 100)}%)`);
    });
    
    console.log("\nKey Insights:");
    analysis.keyInsights.forEach((insight, i) => {
      console.log(`${i+1}. ${insight}`);
    });
    
    console.log("\nConversation Starters:");
    analysis.conversationStarters.forEach(set => {
      console.log(`\nContext: ${set.context}`);
      set.starters.forEach((starter, i) => {
        console.log(`${i+1}. ${starter.opener}`);
        console.log(`   Follow-ups: ${starter.followUps.join(' | ')}`);
      });
    });
    
    console.log("\nRecommended Activities:");
    console.log("Quick activities:", analysis.recommendedActivities.quick.join(", "));
    console.log("Project ideas:", analysis.recommendedActivities.projects.join(", "));
    console.log("Learning opportunities:", analysis.recommendedActivities.learning.join(", "));
    
    return analysis;
  } catch (error) {
    console.error("Error testing user overlap:", error);
  }
}

/**
 * Tests the enhanced user-to-entity overlap analysis
 */
async function testEntityOverlap(userId, entityId) {
  try {
    console.log(`\n===== TESTING ENHANCED ENTITY OVERLAP ANALYSIS =====\n`);
    console.log(`Analyzing overlap between user ${userId} and entity ${entityId}...`);
    
    // Fetch data
    const user = await getUser(userId);
    const entity = await getEntity(entityId);
    
    if (!user || !entity) {
      console.error("Error: User or entity not found");
      return;
    }
    
    console.log(`\nUser: ${user.displayName || user.username}`);
    console.log(`Entity: ${entity.name} (${entity.entityType}, ${entity.category})`);
    
    // Fetch interests and content
    const userInterests = await getUserInterests(userId);
    const content = await getEntityContent(entityId);
    
    console.log(`\nUser Interests (${userInterests.length}): ${userInterests.join(', ')}`);
    console.log(`Entity Content: ${content.length} items`);
    
    console.log("\nGenerating enhanced entity overlap analysis...");
    const analysis = await generateEnhancedEntityUserOverlapAnalysis(
      user,
      entity,
      content,
      userInterests
    );
    
    // Display the results
    console.log("\n===== ANALYSIS RESULTS =====\n");
    console.log("Summary:");
    console.log(analysis.summary);
    
    console.log("\nOverall Score:", Math.round(analysis.overallScore * 100) + "%");
    console.log("Confidence Level:", Math.round(analysis.confidenceLevel * 100) + "%");
    
    console.log("\nExact Match Interests:", analysis.exactMatchInterests.join(", ") || "None");
    
    console.log("\nSemantic Match Interests:");
    analysis.semanticMatchInterests.forEach(match => {
      console.log(`- ${match.interest1} ⟷ ${match.interest2} (${Math.round(match.similarityScore * 100)}%)`);
    });
    
    console.log("\nMost Relevant Content:");
    analysis.relevantContent
      .filter(item => item.relevanceScore > 0.3)
      .slice(0, 5)
      .forEach(item => {
        console.log(`- ${item.title} (${item.type}, relevance: ${Math.round(item.relevanceScore * 100)}%)`);
      });
    
    console.log("\nKey Insights:");
    analysis.keyInsights.forEach((insight, i) => {
      console.log(`${i+1}. ${insight}`);
    });
    
    console.log("\nPersonalized Recommendations:");
    analysis.personalizedRecommendations.forEach((rec, i) => {
      console.log(`${i+1}. ${rec}`);
    });
    
    console.log("\nSuggested Activities:");
    analysis.suggestedActivities.forEach((activity, i) => {
      console.log(`${i+1}. ${activity.activity}`);
      console.log(`   Description: ${activity.description}`);
      console.log(`   Relevant Interests: ${activity.relevantInterests.join(', ')}`);
    });
    
    return analysis;
  } catch (error) {
    console.error("Error testing entity overlap:", error);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Default test IDs - replace with actual IDs from your database
    const testUserId1 = 1;  // Replace with real user ID
    const testUserId2 = 2;  // Replace with real user ID
    const testEntityId = 1; // Replace with real entity ID
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const testType = args[0] || 'both';
    
    if (testType === 'user' || testType === 'both') {
      // Test user-to-user overlap
      const userId1 = parseInt(args[1]) || testUserId1;
      const userId2 = parseInt(args[2]) || testUserId2;
      await testUserOverlap(userId1, userId2);
    }
    
    if (testType === 'entity' || testType === 'both') {
      // Test user-to-entity overlap
      const userId = parseInt(args[1]) || testUserId1;
      const entityId = parseInt(args[3] || args[2]) || testEntityId;
      await testEntityOverlap(userId, entityId);
    }
    
    // Close the database connection
    await db.end();
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error in main execution:", error);
  }
}

// Execute the test
main().catch(console.error);