
// This script will register the enriched users in the database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createEnhancedUsers() {
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'enhanced-synthetic-users.json'), 'utf8'));
    
    console.log(`Preparing to create ${usersData.length} enriched users...`);
    
    // Use promise for user confirmation
    const confirmation = await new Promise((resolve) => {
      rl.question('Do you want to proceed with adding these users to the database? (y/yes to continue): ', (answer) => {
        resolve(answer.trim().toLowerCase());
      });
    });
    
    if (confirmation !== 'y' && confirmation !== 'yes') {
      console.log('Operation cancelled by user');
      rl.close();
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const userData of usersData) {
      const { interestIds, ...userToCreate } = userData;
      
      try {
        // Register the user
        console.log(`Creating user: ${userData.username}...`);
        const baseUrl = process.env.REPLIT_URL || 'http://localhost:3000';
        const registerResponse = await axios.post(`${baseUrl}/api/register`, userToCreate);
        
        if (registerResponse.status === 201) {
          const newUser = registerResponse.data.user;
          console.log(`Successfully created user ${newUser.username} with ID ${newUser.id}`);
          successCount++;
          
          // Add interests to the user
          if (interestIds && interestIds.length > 0) {
            let interestSuccessCount = 0;
            for (const interestId of interestIds) {
              try {
                await axios.post(`${baseUrl}/api/users/${newUser.id}/interests`, { interestId });
                interestSuccessCount++;
              } catch (interestError) {
                console.error(`Failed to add interest ${interestId} to user ${newUser.username}: ${interestError.message}`);
              }
            }
            console.log(`Added ${interestSuccessCount} interests to user ${newUser.username}`);
          }
        }
      } catch (userError) {
        console.error(`Failed to create user ${userData.username}: ${userError.message}`);
        if (userError.response) {
          console.error(`Response data: ${JSON.stringify(userError.response.data)}`);
        }
        failCount++;
      }
    }
    
    console.log('User creation process completed!');
    console.log(`Successfully created ${successCount} users, ${failCount} failures`);
    rl.close();
  } catch (error) {
    console.error('Error creating users:', error.message);
    rl.close();
  }
}

createEnhancedUsers();
    