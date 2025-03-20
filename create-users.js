
// This script will register the users in the database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createUsers() {
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'synthetic-users.json'), 'utf8'));

    console.log(`Preparing to create ${usersData.length} users...`);

    for (const userData of usersData) {
      const { interestIds, ...userToCreate } = userData;

      try {
        // Register the user
        console.log(`Creating user: ${userData.username}...`);
        const registerResponse = await axios.post('http://localhost:3000/api/register', userToCreate);

        if (registerResponse.status === 201) {
          const newUser = registerResponse.data.user;
          console.log(`Successfully created user ${newUser.username} with ID ${newUser.id}`);

          // Add interests to the user
          if (interestIds && interestIds.length > 0) {
            for (const interestId of interestIds) {
              try {
                await axios.post(`http://localhost:3000/api/users/${newUser.id}/interests`, { interestId });
                console.log(`Added interest ID ${interestId} to user ${newUser.username}`);
              } catch (interestError) {
                console.error(`Failed to add interest ${interestId} to user ${newUser.username}: ${interestError.message}`);
              }
            }
          }
        }
      } catch (userError) {
        console.error(`Failed to create user ${userData.username}: ${userError.message}`);
        if (userError.response) {
          console.error(`Response data: ${JSON.stringify(userError.response.data)}`);
        }
      }
    }

    console.log('User creation process completed!');
  } catch (error) {
    console.error('Error creating users:', error.message);
  }
}

createUsers();
