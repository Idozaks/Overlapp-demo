// Script to create synthetic users through the debug endpoint
import axios from 'axios';

// Determine the base URL - use the URL from the Replit environment
const getBaseUrl = () => {
  // For local development
  return 'http://localhost:5000';
};

// URL to call for generating users
const url = `${getBaseUrl()}/api/debug/generate-users`;

async function createUsers() {
  try {
    console.log(`Creating synthetic users via ${url}...`);
    
    // Call the debug endpoint to generate users
    const response = await axios.post(url);
    
    console.log('Response status:', response.status);
    if (response.data && response.data.users) {
      console.log(`Created ${response.data.users.length} users successfully!`);
      response.data.users.forEach(user => {
        console.log(` - ${user.username}: ${user.displayName}`);
      });
    } else {
      console.log('Response data:', response.data);
    }
  } catch (error) {
    console.error('Error creating users:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Execute the function
createUsers();