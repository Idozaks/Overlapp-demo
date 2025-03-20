
import { openai } from './server/openai.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function enrichOtherUsers() {
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'synthetic-users.json'), 'utf8'));
    const enrichedUsers = [];
    const skipUserId = 11; // Your user ID to skip

    console.log(`Starting enrichment process for ${usersData.length} users (excluding ID ${skipUserId})...`);

    for (const user of usersData) {
      // Skip your user ID
      if (user.id === skipUserId) {
        console.log(`Skipping user ID ${skipUserId}...`);
        continue;
      }

      try {
        // Add enriched fields here based on existing user data
        const prompt = `Given this user profile:
          Name: ${user.displayName}
          Occupation: ${user.occupation}
          Interests: ${user.preferences?.interests?.join(', ')}
          Background: ${user.culturalBackground}
          
          Generate a natural, engaging bio that highlights their professional background, interests, and values.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }]
        });

        const enrichedBio = completion.choices[0]?.message?.content || user.bio;
        
        enrichedUsers.push({
          ...user,
          bio: enrichedBio
        });

        console.log(`Enriched user: ${user.displayName}`);
      } catch (error) {
        console.error(`Failed to enrich user ${user.displayName}:`, error.message);
        enrichedUsers.push(user); // Keep original user data if enrichment fails
      }
    }

    // Save enriched users
    fs.writeFileSync(
      path.join(__dirname, 'enriched-synthetic-users.json'), 
      JSON.stringify(enrichedUsers, null, 2)
    );

    console.log('Enrichment process completed!');
    return { success: true, message: 'Users enriched successfully' };
  } catch (error) {
    console.error('Error enriching users:', error.message);
    return { success: false, error: error.message };
  }
}

enrichOtherUsers();
