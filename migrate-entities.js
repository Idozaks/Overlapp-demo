/**
 * Entity Migration Script
 * 
 * This script migrates entities that were incorrectly stored in the interests table
 * to the dedicated entities table. It:
 * 1. Identifies entities in the interests table by their category
 * 2. Creates new records in the entities table
 * 3. Migrates related content from interest_content to entity_content
 * 4. Optionally removes the old data after successful migration
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './server/db.js';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { interests, interestContent, entities, entityContent } from './shared/schema.js';

dotenv.config();

// Get current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Operation modes
const MODE = {
  DRY_RUN: 'dry-run',         // Only identify and count records, no changes
  MIGRATE_ONLY: 'migrate',     // Create new records without deleting old ones
  MIGRATE_AND_CLEAN: 'clean'   // Create new records and delete old ones
};

// Entity categories that may exist in the interest table
const ENTITY_CATEGORIES = [
  'RETAIL',
  'E_COMMERCE',
  'RESTAURANT',
  'EDUCATION',
  'ENTERTAINMENT',
  'TECHNOLOGY',
  'WELLNESS',
  'FINANCIAL',
  'TRAVEL',
  'MEDIA',
  'CAFE',
  'BAR',
  'PARK',
  'LIBRARY',
  'MUSEUM',
  'GALLERY',
  'GYM',
  'YOGA_STUDIO',
  'COWORKING_SPACE',
  'THEATER',
  'CONCERT_VENUE',
  'SHOPPING_MALL',
  'BOUTIQUE',
  'BOOKSTORE',
  'MARKET',
  'UNIVERSITY',
  'COMMUNITY_CENTER',
  'HOTEL',
  'BEACH',
  'AIRPORT',
  'TRAIN_STATION',
  'BUS_TERMINAL',
  'SPORTS_COMPLEX'
];

async function migrateEntities(mode = MODE.DRY_RUN) {
  console.log(`🔄 Starting entity migration in ${mode} mode...`);
  
  try {
    // Step 1: Identify entities in interests table
    const entityQuery = `
      SELECT * FROM interests 
      WHERE category IN (${ENTITY_CATEGORIES.map(cat => `'${cat}'`).join(',')})
    `;
    
    const interestEntities = await db.query(entityQuery);
    
    if (interestEntities.rows.length === 0) {
      console.log('✅ No entities found in interests table. Nothing to migrate.');
      return;
    }
    
    console.log(`Found ${interestEntities.rows.length} entities in interests table.`);
    
    // If dry run mode, show sample entities and exit
    if (mode === MODE.DRY_RUN) {
      console.log('\nSample entities found:');
      interestEntities.rows.slice(0, 5).forEach(entity => {
        console.log(`- ${entity.name} (${entity.category})`);
      });
      
      // Count by category
      const categoryCounts = {};
      interestEntities.rows.forEach(entity => {
        categoryCounts[entity.category] = (categoryCounts[entity.category] || 0) + 1;
      });
      
      console.log('\nCategory breakdown:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`- ${category}: ${count} entities`);
      });
      
      console.log('\n⚠️ Dry run mode - no changes were made.');
      console.log('To migrate entities, run with --migrate or --migrate-and-clean flag.');
      
      return;
    }
    
    // Step 2: Migrate entities and their content
    console.log('\nStarting migration process...');
    
    let migratedCount = 0;
    let contentItemsMigrated = 0;
    let errorsEncountered = 0;
    
    for (const entity of interestEntities.rows) {
      try {
        // Find all content items for this entity
        const contentQuery = `
          SELECT * FROM interest_content
          WHERE interest_id = $1
          ORDER BY created_at ASC
        `;
        
        const contentItems = await db.query(contentQuery, [entity.id]);
        
        // Determine entity type - default to PHYSICAL for location categories
        const isLocationCategory = [
          'CAFE', 'RESTAURANT', 'BAR', 'PARK', 'LIBRARY', 'MUSEUM', 'GALLERY', 
          'GYM', 'YOGA_STUDIO', 'COWORKING_SPACE', 'THEATER', 'CONCERT_VENUE', 
          'SHOPPING_MALL', 'BOUTIQUE', 'BOOKSTORE', 'MARKET', 'UNIVERSITY', 
          'COMMUNITY_CENTER', 'HOTEL', 'BEACH', 'AIRPORT', 'TRAIN_STATION', 
          'BUS_TERMINAL', 'SPORTS_COMPLEX'
        ].includes(entity.category);
        
        const entityType = isLocationCategory ? 'PHYSICAL' : 
                          ['E_COMMERCE', 'TECHNOLOGY', 'MEDIA'].includes(entity.category) ? 
                          'DIGITAL' : (Math.random() > 0.5 ? 'PHYSICAL' : 'DIGITAL');
        
        // Generate location data for physical entities
        const location = {
          coordinates: {
            lat: (Math.random() * 170 - 85).toFixed(6),
            lng: (Math.random() * 360 - 180).toFixed(6)
          },
          address: '123 Main St',
          city: 'Anytown',
          country: 'US'
        };
        
        // Insert into entities table
        const newEntityResult = await db.query(
          'INSERT INTO entities (name, category, description, location, type, is_synthetic) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [
            entity.name, 
            entity.category, 
            entity.description || `${entity.name} is a ${entity.category.toLowerCase().replace('_', '-')} entity.`, 
            JSON.stringify(location),
            entityType,
            true // Mark as synthetic
          ]
        );
        
        const newEntityId = newEntityResult.rows[0].id;
        
        // Migrate content items
        let contentMigratedForEntity = 0;
        
        for (const item of contentItems.rows) {
          await db.query(
            'INSERT INTO entity_content (entity_id, content_type, title, content, created_at) VALUES ($1, $2, $3, $4, $5)',
            [
              newEntityId,
              item.content_type || 'INFO',
              item.title || 'Information',
              item.content,
              item.created_at
            ]
          );
          
          contentMigratedForEntity++;
        }
        
        migratedCount++;
        contentItemsMigrated += contentMigratedForEntity;
        
        // Log progress for every 10 entities
        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount}/${interestEntities.rows.length} entities...`);
        }
        
        // Step 3: Optionally delete old data if in CLEAN mode
        if (mode === MODE.MIGRATE_AND_CLEAN) {
          // Delete content items first (foreign key constraint)
          await db.query('DELETE FROM interest_content WHERE interest_id = $1', [entity.id]);
          
          // Then delete the entity from interests table
          await db.query('DELETE FROM interests WHERE id = $1', [entity.id]);
        }
        
      } catch (error) {
        console.error(`Error migrating entity ${entity.name} (ID: ${entity.id}):`, error.message);
        errorsEncountered++;
      }
    }
    
    // Final report
    console.log('\n✅ Migration complete!');
    console.log(`Successfully migrated ${migratedCount} entities with ${contentItemsMigrated} content items.`);
    
    if (errorsEncountered > 0) {
      console.log(`⚠️ Encountered ${errorsEncountered} errors during migration.`);
    }
    
    if (mode === MODE.MIGRATE_AND_CLEAN) {
      console.log('🧹 Old data has been removed from interests and interest_content tables.');
    } else {
      console.log('ℹ️ Original data remains in the interests and interest_content tables.');
      console.log('   Run with --migrate-and-clean to remove the legacy data after confirming the migration worked correctly.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

// Parse command-line arguments to determine mode
async function main() {
  const args = process.argv.slice(2);
  
  let mode = MODE.DRY_RUN;
  
  if (args.includes('--migrate') || args.includes('-m')) {
    mode = MODE.MIGRATE_ONLY;
  } else if (args.includes('--migrate-and-clean') || args.includes('--clean') || args.includes('-c')) {
    mode = MODE.MIGRATE_AND_CLEAN;
  } else if (args.includes('--dry-run') || args.includes('-d') || args.length === 0) {
    mode = MODE.DRY_RUN;
  } else {
    console.log('Unknown option. Using dry-run mode.');
  }
  
  // Ask for confirmation in clean mode
  if (mode === MODE.MIGRATE_AND_CLEAN) {
    console.log('⚠️ WARNING: You are about to migrate entities AND DELETE the original data.');
    console.log('This operation cannot be undone.');
    
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    await new Promise((resolve) => {
      rl.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
        const lowerAnswer = answer.toLowerCase();
        if (lowerAnswer !== 'yes' && lowerAnswer !== 'y') {
          console.log('Operation cancelled. Using migrate-only mode instead.');
          mode = MODE.MIGRATE_ONLY;
        }
        rl.close();
        resolve();
      });
    });
  }
  
  await migrateEntities(mode);
  process.exit(0);
}

// Run the script
main();