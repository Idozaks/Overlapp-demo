/**
 * Master Script for Generating All Synthetic Data
 * 
 * This script coordinates the generation of all synthetic entities:
 * 1. Synthetic Digital/Physical Entities
 * 2. Synthetic Location Posts
 * 3. Synthetic Retail Places and User Preferences
 * 
 * All data is clearly marked as synthetic/AI-generated for testing purposes.
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
    file: 'synthetic-entities.js',
    description: 'Generating synthetic entities (digital/physical places)'
  },
  {
    file: 'synthetic-locations.js',
    description: 'Generating synthetic location posts'
  },
  {
    file: 'synthetic-retail-places.js',
    description: 'Generating synthetic retail places and user preferences'
  }
];

// Function to run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${scriptPath}`);
    
    // Use Node.js to run the script
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    
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
async function generateAllSyntheticData() {
  console.log('=== Starting Synthetic Data Generation ===');
  console.log('This process will create clearly marked AI-generated test data');
  console.log('for digital and physical entities, locations, and retail places.');
  
  // Install fs module if needed
  try {
    // Check if fs is available
    execSync('node -e "require(\'fs\')"');
  } catch (error) {
    console.log('Installing required modules...');
    execSync('npm install fs');
  }
  
  try {
    // Run each script sequentially
    for (const script of scripts) {
      console.log(`\n=== ${script.description} ===`);
      const scriptPath = path.resolve(__dirname, script.file);
      await runScript(scriptPath);
    }
    
    console.log('\n🎉 All synthetic data generation complete!');
    console.log('The database now contains AI-generated entities for testing purposes.');
    console.log('All synthetic data is clearly marked as such and is not real data.');
    
  } catch (error) {
    console.error('\n❌ Synthetic data generation failed:', error);
    process.exit(1);
  }
}

// Run the main function
generateAllSyntheticData();