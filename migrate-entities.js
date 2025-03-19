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

import { db, schema } from './server/db.js';
import { eq } from 'drizzle-orm';

// Entity categories to migrate
const ENTITY_CATEGORIES = [
  'RETAIL',
  'ONLINE', 
  'EDUCATION',
  'HOSPITALITY',
  'ENTERTAINMENT',
  'HEALTHCARE'
];

// Map category to entity type
const ENTITY_TYPES = {
  'RETAIL': 'PHYSICAL',
  'ONLINE': 'DIGITAL',
  'EDUCATION': 'PHYSICAL',
  'HOSPITALITY': 'PHYSICAL',
  'ENTERTAINMENT': 'PHYSICAL',
  'HEALTHCARE': 'PHYSICAL',
};

// Migration mode options
const MODE = {
  DRY_RUN: 'dry-run',  // Don't make changes, just show what would happen
  MIGRATE: 'migrate',   // Migrate data but keep original
  MIGRATE_AND_CLEAN: 'migrate-and-clean'  // Migrate and then delete original data
};

async function migrateEntities(mode = MODE.DRY_RUN) {
  console.log(`Starting entity migration in ${mode} mode...`);

  try {
    // Get all entities from interests table
    const entityInterests = await db
      .select()
      .from(schema.interests)
      .where(schema.interests.category.in(ENTITY_CATEGORIES));

    console.log(`Found ${entityInterests.length} entities in interests table`);

    // For tracking results
    const migrationResults = {
      entitiesToMigrate: entityInterests.length,
      entitiesMigrated: 0,
      contentItemsToMigrate: 0,
      contentItemsMigrated: 0,
      entitiesRemoved: 0,
      contentItemsRemoved: 0,
      errors: []
    };

    // In dry run mode, just get content count
    if (mode === MODE.DRY_RUN) {
      for (const interest of entityInterests) {
        const contentItems = await db
          .select()
          .from(schema.interestContent)
          .where(eq(schema.interestContent.interestId, interest.id));
          
        migrationResults.contentItemsToMigrate += contentItems.length;
      }
      
      console.log(`Would migrate ${migrationResults.entitiesToMigrate} entities and ${migrationResults.contentItemsToMigrate} content items`);
      return migrationResults;
    }

    // Process each entity
    for (const interest of entityInterests) {
      try {
        console.log(`Processing ${interest.name} (ID: ${interest.id})...`);
        
        // Check if entity already exists in entities table
        const existingEntity = await db
          .select()
          .from(schema.entities)
          .where(eq(schema.entities.name, interest.name))
          .limit(1);
          
        // If entity already exists in entities table, use it, otherwise create it
        let entity;
        if (existingEntity.length > 0) {
          entity = existingEntity[0];
          console.log(`Entity ${interest.name} already exists in entities table with ID ${entity.id}`);
        } else {
          // Insert into entities table
          const [newEntity] = await db
            .insert(schema.entities)
            .values({
              name: interest.name,
              description: interest.description,
              category: interest.category,
              entityType: ENTITY_TYPES[interest.category] || 'PHYSICAL',
              iconUrl: interest.iconUrl,
              coordinates: interest.metadata?.coordinates || null,
            })
            .returning();
            
          entity = newEntity;
          migrationResults.entitiesMigrated++;
          console.log(`Created entity ${interest.name} in entities table with ID ${entity.id}`);
        }
        
        // Get all content for this entity from interest_content
        const contentItems = await db
          .select()
          .from(schema.interestContent)
          .where(eq(schema.interestContent.interestId, interest.id));
          
        console.log(`Found ${contentItems.length} content items for ${interest.name}`);
        migrationResults.contentItemsToMigrate += contentItems.length;
        
        // Migrate each content item
        for (const content of contentItems) {
          // Check if content already exists
          const existingContent = await db
            .select()
            .from(schema.entityContent)
            .where(eq(schema.entityContent.title, content.title))
            .where(eq(schema.entityContent.entityId, entity.id))
            .limit(1);
            
          if (existingContent.length > 0) {
            console.log(`Content ${content.title} already exists for entity ${interest.name}`);
            continue;
          }
            
          // Insert into entity_content
          await db
            .insert(schema.entityContent)
            .values({
              entityId: entity.id,
              title: content.title,
              description: content.description,
              url: content.url,
              thumbnailUrl: content.thumbnailUrl,
              type: content.type
            });
            
          migrationResults.contentItemsMigrated++;
          console.log(`Migrated content ${content.title} to entity ${interest.name}`);
        }
        
        // If migrate-and-clean mode, remove old data
        if (mode === MODE.MIGRATE_AND_CLEAN) {
          // First delete all content items
          const deletedContent = await db
            .delete(schema.interestContent)
            .where(eq(schema.interestContent.interestId, interest.id))
            .returning();
            
          migrationResults.contentItemsRemoved += deletedContent.length;
          console.log(`Removed ${deletedContent.length} content items for ${interest.name} from interest_content`);
          
          // Then delete the interest itself
          await db
            .delete(schema.interests)
            .where(eq(schema.interests.id, interest.id));
            
          migrationResults.entitiesRemoved++;
          console.log(`Removed entity ${interest.name} from interests table`);
        }
        
      } catch (error) {
        console.error(`Error migrating ${interest.name}:`, error);
        migrationResults.errors.push({
          entityId: interest.id,
          entityName: interest.name,
          error: error.message
        });
      }
    }
    
    return migrationResults;
    
  } catch (error) {
    console.error('Error in migration process:', error);
    throw error;
  }
}

// Get command line arguments
const args = process.argv.slice(2);
let mode = MODE.DRY_RUN; // Default to dry run

if (args.includes('--migrate')) {
  mode = MODE.MIGRATE;
} else if (args.includes('--migrate-and-clean')) {
  mode = MODE.MIGRATE_AND_CLEAN;
}

// Run the migration
migrateEntities(mode)
  .then((results) => {
    console.log('\nMigration Summary:');
    console.log('------------------');
    console.log(`Entities found: ${results.entitiesToMigrate}`);
    console.log(`Entities migrated: ${results.entitiesMigrated}`);
    console.log(`Content items found: ${results.contentItemsToMigrate}`);
    console.log(`Content items migrated: ${results.contentItemsMigrated}`);
    
    if (mode === MODE.MIGRATE_AND_CLEAN) {
      console.log(`Entities removed: ${results.entitiesRemoved}`);
      console.log(`Content items removed: ${results.contentItemsRemoved}`);
    }
    
    if (results.errors.length > 0) {
      console.log(`\nErrors encountered: ${results.errors.length}`);
      results.errors.forEach((error, index) => {
        console.log(`Error ${index + 1}: Entity ${error.entityName} (${error.entityId}) - ${error.error}`);
      });
    }
    
    console.log('\nMigration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });