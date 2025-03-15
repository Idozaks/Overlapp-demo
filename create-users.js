// Script to create synthetic users through the debug endpoint
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the synthetic users
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'synthetic-users.json'), 'utf8'));

// Determine the base URL - use the URL from the Replit environment
const getBaseUrl = () => {
  // For Replit environment
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  const replitClusterHost = process.env.REPLIT_CLUSTER_HOST;

  // If running in Replit, return the Replit URL
  if (replitSlug && replitOwner && replitClusterHost) {
    return `https://${replitSlug}.${replitOwner}.${replitClusterHost}`;
  }

  // Default to localhost - adjust the port as needed
  return 'http://localhost:3000';
};

// URL to call for generating users
const url = `${getBaseUrl()}/api/debug/generate-users`;

async function createUsers() {
  try {
    console.log(`Creating ${users.length} synthetic users via ${url}...`);
    
    // Call the debug endpoint to generate users
    const response = await axios.post(url, { 
      userCount: users.length
    });
    
    console.log('Response:', response.data);
    console.log('Users created successfully!');
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