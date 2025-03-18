/**
 * Master Script for Generating All Test Data
 * 
 * This script coordinates the generation of all entities:
 * 1. Digital/Physical Entities
 * 2. Location Posts
 * 3. Retail Places and User Preferences
 * 
 * All data is generated for testing the platform's overlap analysis features.
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the scripts to run in sequence
const scripts = [
  {
    file: 'entities.js',
    description: 'Generating entities (digital/physical places)'
  },
  {
    file: 'locations.js',
    description: 'Generating location posts'
  },
  {
    file: 'retail-places.js',
    description: 'Generating retail places and user preferences'
  }
];

// Function to run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${scriptPath}`);
    
    // Use tsx to run the TypeScript files
    const child = spawn('npx', ['tsx', scriptPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Successfully completed: ${scriptPath}`);
        resolve();
      } else {
        console.error(`❌ Script failed with code ${code}: ${scriptPath}`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      console.error(`❌ Failed to start script: ${err}`);
      reject(err);
    });
  });
}

// Run the scripts in sequence
async function generateAllTestData() {
  console.log('=== Starting Test Data Generation ===');
  console.log('This process will create test data for the platform');
  console.log('for digital and physical entities, locations, and retail places.');
  
  // fs module is now imported at the top of the file
  // No need to check for it since it's a built-in Node.js module
  
  try {
    // Run each script sequentially
    for (const script of scripts) {
      console.log(`\n=== ${script.description} ===`);
      const scriptPath = join(__dirname, script.file);
      await runScript(scriptPath);
    }
    
    console.log('\n🎉 All test data generation complete!');
    console.log('The database now contains entities for testing the overlap analysis features.');
    console.log('All test data is designed to work seamlessly with the platform.');
    
  } catch (error) {
    console.error('\n❌ Test data generation failed:', error);
    process.exit(1);
  }
}

// Run the main function
generateAllTestData();