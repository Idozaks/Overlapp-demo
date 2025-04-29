/**
 * User Profile Enrichment Script
 * 
 * This script enhances all user profiles except Ido Zaks and Danni Zaks
 * with rich bio text, personal values, and community affiliations.
 */

import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from "openai";

// Load environment variables
dotenv.config();

// Setup directory handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Database connection setup
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function enrichUserProfiles() {
  console.log("🌟 Starting user profile enrichment process...");
  console.log("📊 Connecting to database...");
  
  try {
    // Get all users from database
    const usersResult = await pool.query('SELECT * FROM users');
    const usersData = usersResult.rows;
    
    // Skip IDs for Ido Zaks and Danni Zaks
    const skipUserIds = [11, 12]; // IDs to skip
    const enrichedUsers = [];
    const totalUsers = usersData.length - skipUserIds.length;

    console.log(`📋 Found ${usersData.length} total users (will process ${totalUsers} after exclusions)`);
    console.log(`⚠️ Excluding users: ${skipUserIds.join(', ')} (Ido Zaks and Danni Zaks)`);

    let processedCount = 0;
    
    for (const user of usersData) {
      // Skip specified user IDs
      if (skipUserIds.includes(user.id)) {
        console.log(`⏩ Skipping user ID ${user.id} (${user.displayName || user.username})...`);
        enrichedUsers.push(user); // Add to array without changes
        continue;
      }

      processedCount++;
      console.log(`\n[${processedCount}/${totalUsers}] 🔄 Processing user: ${user.displayName || user.username} (ID: ${user.id})`);
      
      try {
        // Get user interests
        const interestsResult = await pool.query(
          'SELECT i.name FROM interests i JOIN user_interests ui ON i.id = ui.interest_id WHERE ui.user_id = $1',
          [user.id]
        );
        
        const interests = interestsResult.rows.map(row => row.name);
        console.log(`   📝 Found ${interests.length} interests`);
        
        // Determine if the user has detailed information already
        const needsBio = !user.bio || user.bio.trim() === '';
        const needsPersonalValues = !user.personalValues || user.personalValues.trim() === '';
        const needsCommunityAffiliations = !user.communityAffiliations || user.communityAffiliations.trim() === '';
        
        if (!needsBio && !needsPersonalValues && !needsCommunityAffiliations) {
          console.log('   ✅ User profile already complete - skipping');
          enrichedUsers.push(user);
          continue;
        }
        
        console.log(`   🔍 Fields needing enrichment: ${[
          needsBio ? 'bio' : '', 
          needsPersonalValues ? 'personalValues' : '', 
          needsCommunityAffiliations ? 'communityAffiliations' : ''
        ].filter(Boolean).join(', ')}`);
        
        // Create a rich, detailed user profile
        const prompt = `Given this user profile:
          Name: ${user.displayName || user.username}
          Username: ${user.username}
          Occupation: ${user.occupation || 'Unknown'}
          Age Range: ${user.ageRange || 'Unknown'}
          Gender: ${user.gender || 'Unknown'}
          Cultural Background: ${user.culturalBackground || 'Unknown'}
          Country of Origin: ${user.countryOfOrigin || 'Unknown'}
          Education: ${user.education || 'Unknown'}
          Professional Field: ${user.professionalField || 'Unknown'}
          Languages: ${user.languagesSpoken || 'Unknown'}
          Learning Style: ${user.learningStyle || 'Unknown'}
          Digital Identity: ${user.digitalIdentity || 'Unknown'}
          Collaboration Style: ${user.collaborationStyle || 'Unknown'}
          Physical Activity Level: ${user.physicalActivityLevel || 'Unknown'}
          Cultural Experiences: ${user.culturalExperiences || 'Unknown'}
          Interests: ${interests.join(', ') || 'Unknown'}
          
          Generate the following for this user:
          
          1. ${needsBio ? 'A natural, engaging bio paragraph (150-200 words) that highlights their background, interests, and aspirations.' : 'Skip bio generation as they already have one.'}
          
          2. ${needsPersonalValues ? 'A list of 3-5 key personal values that align with their profile (comma-separated).' : 'Skip personal values as they already have them.'}
          
          3. ${needsCommunityAffiliations ? 'A list of 2-3 community affiliations or groups they might belong to based on their background (comma-separated).' : 'Skip community affiliations as they already have them.'}
          
          Format your response as a JSON object with keys: "bio", "personalValues", "communityAffiliations". 
          Only include fields that need to be updated.`;

        console.log('   🤖 Generating enriched profile data...');
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });

        console.log('   ✅ Successfully received response from OpenAI');
        const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
        
        // Update user with enriched data, keeping existing data if the field already has content
        const enrichedUser = {
          ...user,
        };
        
        // Only update fields that need updates
        if (needsBio && result.bio) {
          enrichedUser.bio = result.bio;
          console.log('   ✨ Added bio');
        }
        
        if (needsPersonalValues && result.personalValues) {
          enrichedUser.personalValues = result.personalValues;
          console.log('   ✨ Added personal values');
        }
        
        if (needsCommunityAffiliations && result.communityAffiliations) {
          enrichedUser.communityAffiliations = result.communityAffiliations;
          console.log('   ✨ Added community affiliations');
        }
        
        // Update the database with the enriched user data
        console.log('   💾 Updating user in database...');
        await pool.query(
          `UPDATE users SET 
            bio = $1, 
            personal_values = $2, 
            community_affiliations = $3
          WHERE id = $4`,
          [
            enrichedUser.bio,
            enrichedUser.personalValues,
            enrichedUser.communityAffiliations,
            user.id
          ]
        );
        
        enrichedUsers.push(enrichedUser);
        console.log(`   ✅ Successfully enriched and updated user ${user.id}: ${user.username || user.displayName}`);
      } catch (error) {
        console.error(`   ❌ Failed to enrich user ${user.username || user.displayName}:`, error);
        enrichedUsers.push(user); // Keep original user data if enrichment fails
      }
    }

    // Save a backup of enriched users (optional)
    console.log('\n📁 Saving backup of enriched users...');
    fs.writeFileSync(
      path.join(__dirname, 'enriched-users-backup.json'), 
      JSON.stringify(enrichedUsers, null, 2)
    );

    console.log('\n🎉 Enrichment process completed!');
    console.log(`📊 Summary: Processed ${processedCount} users, skipped ${skipUserIds.length} users`);
    return { success: true, message: 'Users enriched successfully' };
  } catch (error) {
    console.error('❌ Error enriching users:', error);
    return { success: false, error: error.message };
  } finally {
    // Close database connection
    console.log('🔌 Closing database connection...');
    await pool.end();
    console.log('👋 Done!');
  }
}

// Run the enrichment process
enrichUserProfiles().then(result => {
  console.log('📝 Final result:', result);
}).catch(err => {
  console.error('❌ Error in main process:', err);
});