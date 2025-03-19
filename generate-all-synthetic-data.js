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
    file: 'synthetic-entities.js',
    description: 'Generating entities (digital/physical places)'
  },
  {
    file: 'synthetic-locations.js',
    description: 'Generating location posts'
  },
  {
    file: 'synthetic-retail-places.js',
    description: 'Generating retail places and user preferences'
  }
];

// Function to run a script and return a promise
function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const commandArgs = ['tsx', scriptPath, ...args];
    console.log(`\n🚀 Running: npx ${commandArgs.join(' ')}`);
    
    // Use tsx to run the TypeScript files
    const child = spawn('npx', commandArgs, { stdio: 'inherit' });
    
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

// Preview mode function to run scripts with --preview flag
async function previewTestData() {
  console.log('=== 👁️ PREVIEW MODE: Synthetic Data Generation ===');
  console.log('This will show sample data without saving to the database');
  
  try {
    // Run each script with preview flag
    for (const script of scripts) {
      console.log(`\n=== PREVIEW: ${script.description} ===`);
      const scriptPath = join(__dirname, script.file);
      await runScript(scriptPath, ['--preview']);
    }
    
    console.log('\n✅ Preview generation complete!');
    console.log('No data has been saved to the database.');
    console.log('Run this script without --preview to save the data.');
    
  } catch (error) {
    console.error('\n❌ Preview generation failed:', error);
    process.exit(1);
  }
}

// Run the scripts in sequence
async function generateAllTestData() {
  // Check if we're in preview mode
  const isPreviewMode = process.argv.includes('--preview');
  
  if (isPreviewMode) {
    await previewTestData();
    return;
  }
  
  // Regular data generation mode
  console.log('=== Starting Synthetic Data Generation ===');
  console.log('This process will create synthetic test data for the platform');
  console.log('for digital and physical entities, locations, and retail places.');
  
  // Ask for confirmation before proceeding
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise((resolve) => {
    rl.question('\n⚠️ WARNING: This will write synthetic data directly to your database.\nAre you sure you want to continue? (yes/no): ', (answer) => {
      const lowerAnswer = answer.toLowerCase();
      if (lowerAnswer !== 'yes' && lowerAnswer !== 'y') {
        console.log('Operation cancelled. Try running with --preview to see sample data without saving.');
        process.exit(0);
      }
      rl.close();
      resolve();
    });
  });
  
  try {
    // Run each script sequentially
    for (const script of scripts) {
      console.log(`\n=== ${script.description} ===`);
      const scriptPath = join(__dirname, script.file);
      await runScript(scriptPath);
    }
    
    console.log('\n🎉 All synthetic data generation complete!');
    console.log('The database now contains entities for testing the overlap analysis features.');
    console.log('All test data is designed to work seamlessly with the platform.');
    
  } catch (error) {
    console.error('\n❌ Synthetic data generation failed:', error);
    process.exit(1);
  }
}

// Run the main function
generateAllTestData();