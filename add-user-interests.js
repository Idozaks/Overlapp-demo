// Script to add interests to synthetic users
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Determine the base URL
const getBaseUrl = () => {
  return 'http://localhost:5000';
};

// Read the synthetic users from JSON file
console.log("Reading synthetic users from JSON file...");
const usersJsonPath = path.join(process.cwd(), 'synthetic-users.json');
const usersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));

// URL base for interests API
const baseUrl = getBaseUrl();

// Function to get all users
async function getUsers() {
  try {
    const response = await axios.get(`${baseUrl}/api/users`);
    return response.data.users;
  } catch (error) {
    console.error('Error getting users:', error.message);
    return [];
  }
}

// Function to get all interests
async function getInterests() {
  try {
    const response = await axios.get(`${baseUrl}/api/interests`);
    return response.data.interests;
  } catch (error) {
    console.error('Error getting interests:', error.message);
    return [];
  }
}

// Function to add an interest to a user
async function addInterestToUser(userId, interestId) {
  try {
    await axios.post(`${baseUrl}/api/users/${userId}/interests`, { interestId });
    return true;
  } catch (error) {
    console.error(`Error adding interest ${interestId} to user ${userId}:`, error.message);
    return false;
  }
}

// Function to get random items from an array
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Main function to add interests to users
async function addInterestsToUsers() {
  try {
    // Get all users and interests from the API
    const users = await getUsers();
    const interests = await getInterests();
    
    if (!users.length) {
      console.error('No users found!');
      return;
    }
    
    if (!interests.length) {
      console.error('No interests found!');
      return;
    }
    
    console.log(`Found ${users.length} users and ${interests.length} interests.`);
    
    // Map interests by name for easy lookup
    const interestsByName = {};
    interests.forEach(interest => {
      interestsByName[interest.name.toLowerCase()] = interest;
    });
    
    // Process each synthetic user
    let totalInterestsAdded = 0;
    
    for (const userData of usersData) {
      // Find corresponding user in DB
      const user = users.find(u => u.username === userData.username);
      if (!user) {
        console.log(`User ${userData.username} not found in database, skipping...`);
        continue;
      }
      
      // Add interests from user data if specified
      let interestsToAdd = [];
      
      if (userData.interests && Array.isArray(userData.interests)) {
        // Try to match interests by name
        for (const interestName of userData.interests) {
          const matchedInterest = interestsByName[interestName.toLowerCase()] || 
                                 interests.find(i => i.name.toLowerCase() === interestName.toLowerCase());
          
          if (matchedInterest) {
            interestsToAdd.push(matchedInterest.id);
          }
        }
        
        // If no matches, add some random interests
        if (interestsToAdd.length === 0) {
          const randomInterests = getRandomItems(interests, Math.floor(Math.random() * 5) + 3);
          interestsToAdd = randomInterests.map(i => i.id);
        }
      } else {
        // If no interests specified, add random interests
        const randomInterests = getRandomItems(interests, Math.floor(Math.random() * 5) + 3);
        interestsToAdd = randomInterests.map(i => i.id);
      }
      
      // Add interests to user
      let userSuccessCount = 0;
      for (const interestId of interestsToAdd) {
        const success = await addInterestToUser(user.id, interestId);
        if (success) {
          userSuccessCount++;
          totalInterestsAdded++;
        }
      }
      
      console.log(`Added ${userSuccessCount} interests to user ${userData.username} (ID: ${user.id})`);
    }
    
    console.log(`Successfully added a total of ${totalInterestsAdded} interests to users.`);
    
  } catch (error) {
    console.error('Error adding interests to users:', error.message);
  }
}

// Execute the function
addInterestsToUsers();