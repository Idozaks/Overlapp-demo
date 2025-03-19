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
  MIGRATE_AND_CLEAN: 'clean',  // Create new records and delete old ones
  CLEAN_ONLY: 'clean-only'     // Only clean up entities from interests table (no migration)
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

async function cleanEntitiesOnly() {
  console.log('🧹 Starting clean-only mode for entities...');
  
  try {
    // Identify entities in interests table that have category
    const interestEntities = await db.select()
      .from(interests)
      .where(inArray(interests.category, ENTITY_CATEGORIES));
    
    if (interestEntities.length === 0) {
      console.log('✅ No entities found in interests table. Nothing to clean up.');
      return;
    }
    
    console.log(`Found ${interestEntities.length} potential entity interests to clean up.`);
    
    // For each entity interest, check if it has a corresponding entity in the entities table
    let deletedCount = 0;
    let skippedCount = 0;
    
    for (const entityInterest of interestEntities) {
      try {
        // Check if entity with same name exists in entities table
        const existingEntity = await db.select()
          .from(entities)
          .where(eq(entities.name, entityInterest.name))
          .execute()
          .then(results => results[0]);
        
        if (existingEntity) {
          // First delete related content
          const contentDeleteResult = await db
            .delete(interestContent)
            .where(eq(interestContent.interestId, entityInterest.id))
            .returning()
            .execute();
          
          // Then delete the interest itself
          const interestDeleteResult = await db
            .delete(interests)
            .where(eq(interests.id, entityInterest.id))
            .returning()
            .execute();
          
          console.log(`✅ Deleted entity interest "${entityInterest.name}" (ID: ${entityInterest.id}) and ${contentDeleteResult.length} related content items.`);
          deletedCount++;
        } else {
          console.log(`⚠️ No matching entity found for "${entityInterest.name}" in entities table. Skipping deletion.`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error cleaning up entity interest ${entityInterest.name} (ID: ${entityInterest.id}):`, error.message);
      }
    }
    
    console.log('\n🧹 Cleanup complete!');
    console.log(`Successfully deleted ${deletedCount} entity interests and skipped ${skippedCount}.`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

async function migrateEntities(mode = MODE.DRY_RUN) {
  console.log(`🔄 Starting entity migration in ${mode} mode...`);
  
  try {
    // If we're in CLEAN_ONLY mode, call the cleanEntitiesOnly function instead
    if (mode === MODE.CLEAN_ONLY) {
      return await cleanEntitiesOnly();
    }
    
    // Step 1: Identify entities in interests table
    const interestEntities = await db.select()
      .from(interests)
      .where(inArray(interests.category, ENTITY_CATEGORIES));
    
    if (interestEntities.length === 0) {
      console.log('✅ No entities found in interests table. Nothing to migrate.');
      return;
    }
    
    console.log(`Found ${interestEntities.length} entities in interests table.`);
    
    // If dry run mode, show sample entities and exit
    if (mode === MODE.DRY_RUN) {
      console.log('\nSample entities found:');
      interestEntities.slice(0, 5).forEach(entity => {
        console.log(`- ${entity.name} (${entity.category})`);
      });
      
      // Count by category
      const categoryCounts = {};
      interestEntities.forEach(entity => {
        categoryCounts[entity.category] = (categoryCounts[entity.category] || 0) + 1;
      });
      
      console.log('\nCategory breakdown:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`- ${category}: ${count} entities`);
      });
      
      console.log('\n⚠️ Dry run mode - no changes were made.');
      console.log('To migrate entities, run with --migrate or --migrate-and-clean flag.');
      console.log('To just remove entities from the interests table, run with --clean-only flag.');
      
      return;
    }
    
    // Step 2: Migrate entities and their content
    console.log('\nStarting migration process...');
    
    let migratedCount = 0;
    let contentItemsMigrated = 0;
    let errorsEncountered = 0;
    
    for (const entity of interestEntities) {
      try {
        // Find all content items for this entity
        const contentItems = await db.select()
          .from(interestContent)
          .where(eq(interestContent.interestId, entity.id))
          .orderBy(interestContent.createdAt);
        
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
        
        // First check if an entity with this name already exists
        const existingEntities = await db.select()
          .from(entities)
          .where(eq(entities.name, entity.name));

        let newEntity;
        
        if (existingEntities.length > 0) {
          console.log(`Entity with name "${entity.name}" already exists. Using existing entity.`);
          newEntity = existingEntities[0];
        } else {
          // Insert into entities table if no duplicate exists
          const inserted = await db.insert(entities)
            .values({
              name: entity.name,
              category: entity.category,
              description: entity.description || `${entity.name} is a ${entity.category.toLowerCase().replace('_', '-')} entity.`,
              coordinates: JSON.stringify(location.coordinates),
              entityType: entityType,
              iconUrl: entity.iconUrl || null
            })
            .returning();
          
          newEntity = inserted[0];
        }
        
        // Migrate content items
        let contentMigratedForEntity = 0;
        
        // First check if entity already has content
        const existingContent = await db.select()
          .from(entityContent)
          .where(eq(entityContent.entityId, newEntity.id));
          
        if (existingContent.length > 0) {
          console.log(`Entity "${entity.name}" already has ${existingContent.length} content items. Skipping content migration.`);
          contentMigratedForEntity = existingContent.length;
        } else {
          for (const item of contentItems) {
            await db.insert(entityContent)
              .values({
                entityId: newEntity.id,
                title: item.title || 'Information',
                description: item.description || null,
                url: item.url || '#',
                thumbnailUrl: item.thumbnailUrl || null,
                type: item.type || 'INFO'
              });
            
            contentMigratedForEntity++;
          }
        }
        
        migratedCount++;
        contentItemsMigrated += contentMigratedForEntity;
        
        // Log progress for every 10 entities
        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount}/${interestEntities.length} entities...`);
        }
        
        // Step 3: Optionally delete old data if in CLEAN mode
        if (mode === MODE.MIGRATE_AND_CLEAN) {
          // Delete content items first (foreign key constraint)
          await db.delete(interestContent)
            .where(eq(interestContent.interestId, entity.id));
          
          // Then delete the entity from interests table
          await db.delete(interests)
            .where(eq(interests.id, entity.id));
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
  } else if (args.includes('--clean-only') || args.includes('--co')) {
    mode = MODE.CLEAN_ONLY;
    console.log('Running in clean-only mode - will only remove entities from interests table that already exist in entities table.');
  } else if (args.includes('--dry-run') || args.includes('-d') || args.length === 0) {
    mode = MODE.DRY_RUN;
  } else {
    console.log('Unknown option. Using dry-run mode.');
  }
  
  // Ask for confirmation in clean mode
  if (mode === MODE.MIGRATE_AND_CLEAN) {
    console.log('⚠️ WARNING: You are about to migrate entities AND DELETE the original data.');
    console.log('This operation cannot be undone.');
    
    // Check for force flag or environment variable
    const forceCleanup = process.argv.includes('--force') || process.env.FORCE_CLEANUP === 'true';
    
    if (forceCleanup) {
      console.log('Force flag detected. Proceeding with cleanup without confirmation.');
    } else {
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
  }
  
  await migrateEntities(mode);
  process.exit(0);
}

// Run the script
main();