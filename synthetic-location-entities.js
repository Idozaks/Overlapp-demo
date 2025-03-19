/**
 * Location Entity Generator Script
 * 
 * This script generates location entities with appropriate content
 * for testing purposes. The locations represent physical places 
 * that can be used for analyzing overlaps between users.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { eq } from 'drizzle-orm';
const { Pool } = pkg;
import * as schema from './shared/schema.ts';

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Types of locations
const LOCATION_TYPES = [
  { type: 'CAFE', entityType: 'PHYSICAL' },
  { type: 'RESTAURANT', entityType: 'PHYSICAL' },
  { type: 'PARK', entityType: 'PHYSICAL' },
  { type: 'MUSEUM', entityType: 'PHYSICAL' },
  { type: 'THEATER', entityType: 'PHYSICAL' },
  { type: 'GYM', entityType: 'PHYSICAL' },
  { type: 'LIBRARY', entityType: 'PHYSICAL' },
  { type: 'SHOPPING_MALL', entityType: 'PHYSICAL' },
  { type: 'CONCERT_VENUE', entityType: 'PHYSICAL' },
  { type: 'CONFERENCE_CENTER', entityType: 'PHYSICAL' }
];

// Generate a realistic location name
function generateLocationName(locationType) {
  const typePrefix = locationType.replace('_', ' ');
  
  const prefixes = {
    'PARK': ['Central', 'Riverside', 'Golden Gate', 'Highland', 'Sunset', 'Evergreen', 'Oakwood', 'Lakeside', 'Emerald', 'Victoria'],
    'SHOPPING_MALL': ['Grand', 'Metro', 'Westfield', 'City Center', 'Plaza', 'Gallery', 'Pacific', 'Bayside', 'Horizon', 'Union Square'],
    'THEATER': ['Royal', 'Broadway', 'Imperial', 'Paramount', 'Regent', 'Majestic', 'Century', 'Grand', 'State', 'Landmark'],
    'RESTAURANT': ['The Garden', 'Blue Door', 'Harvest', 'Olive & Vine', 'Wildflower', 'Copper Pot', 'The Harbor', 'Sage', 'Ember', 'Terrain'],
    'MUSEUM': ['Metropolitan', 'Modern Art', 'National', 'Natural History', 'Science', 'Contemporary', 'Heritage', 'Maritime', 'Cultural', 'City'],
    'LIBRARY': ['Central', 'Public', 'University', 'Memorial', 'Carnegie', 'Heritage', 'Civic', 'National', 'State', 'Mitchell'],
    'CAFE': ['Morning Light', 'Cornerstone', 'Rustic Bean', 'Maple Leaf', 'Coffee & Clay', 'The Daily Grind', 'Shoreline', 'Urban Brew', 'The Mill', 'Sunrise'],
    'GYM': ['Elevate', 'Peak', 'Pulse', 'Iron', 'Vigor', 'Strength', 'Elite', 'Core', 'Vitality', 'Axis'],
    'CONCERT_VENUE': ['Symphony', 'Royal', 'Metropolitan', 'Grand', 'Civic', 'Harmony', 'Heritage', 'Phillips', 'Riverside', 'Meridian'],
    'CONFERENCE_CENTER': ['International', 'Summit', 'Metropolitan', 'Convention', 'Global', 'Central', 'Executive', 'Business', 'Exchange', 'Forum']
  };
  
  const suffixes = {
    'PARK': ['Park', 'Gardens', 'Reserve', 'Commons', 'Meadows', 'Botanical Garden', 'Arboretum', 'Conservatory', 'Green'],
    'SHOPPING_MALL': ['Mall', 'Plaza', 'Center', 'Galleria', 'Shops', 'Shopping Center', 'Market', 'Square', 'Promenade'],
    'THEATER': ['Theater', 'Cinema', 'Playhouse', 'Stage', 'Amphitheater', 'Cineplex', 'Picture House', 'Arts Center'],
    'RESTAURANT': ['Restaurant', 'Eatery', 'Bistro', 'Grill', 'Diner', 'Kitchen', 'Table', 'Brasserie', 'Tavern'],
    'MUSEUM': ['Museum', 'Gallery', 'Exhibition', 'Collection', 'Archive', 'Institute', 'Foundation', 'Center'],
    'LIBRARY': ['Library', 'Archives', 'Collection', 'Resource Center', 'Reading Room', 'Media Center', 'Learning Center'],
    'CAFE': ['Cafe', 'Coffee House', 'Tea Room', 'Espresso Bar', 'Bistro', 'Coffee Shop', 'Bakery', 'Patisserie'],
    'GYM': ['Fitness', 'Health Club', 'Training Center', 'Athletic Club', 'Wellness Center', 'Sports Club', 'Studio'],
    'CONCERT_VENUE': ['Hall', 'Center', 'Auditorium', 'Arena', 'Theater', 'Pavilion', 'Palace', 'Performance Center'],
    'CONFERENCE_CENTER': ['Conference Center', 'Convention Center', 'Exhibition Hall', 'Forum', 'Event Center', 'Business Center']
  };
  
  const type = typePrefix.split(' ')[0];
  const prefixList = prefixes[type] || ['Premium', 'Signature', 'Elite', 'Select', 'Prime', 'Superior', 'Exceptional'];
  const suffixList = suffixes[type] || ['Establishment', 'Place', 'Location', 'Destination', 'Venue'];
  
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
  const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
  
  return `${prefix} ${suffix}`;
}

// Generate a description for a location
function generateLocationDescription(name, locationType) {
  const typeFormatted = locationType.toLowerCase().replace('_', ' ');
  
  const descriptions = [
    `${name} is a popular ${typeFormatted} known for its inviting atmosphere and exceptional service.`,
    `Visitors to ${name} enjoy a unique experience in this highly-rated ${typeFormatted}.`,
    `${name} offers guests a memorable ${typeFormatted} experience with its distinctive character and amenities.`,
    `As one of the area's premier ${typeFormatted}s, ${name} consistently receives positive reviews.`,
    `${name} combines modern amenities with classic charm to create an outstanding ${typeFormatted} experience.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Generate random coordinates for physical locations
function generateRandomCoordinates() {
  // Define a few major regions of the world with coordinate bounds
  const regions = [
    // North America
    { minLat: 25, maxLat: 49, minLng: -125, maxLng: -70 },
    // Europe
    { minLat: 36, maxLat: 60, minLng: -10, maxLng: 30 },
    // Asia
    { minLat: 10, maxLat: 50, minLng: 70, maxLng: 140 },
    // Australia
    { minLat: -40, maxLat: -10, minLng: 110, maxLng: 155 }
  ];
  
  // Select a random region
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  // Generate coordinates within that region
  const latitude = (Math.random() * (region.maxLat - region.minLat) + region.minLat).toFixed(6);
  const longitude = (Math.random() * (region.maxLng - region.minLng) + region.minLng).toFixed(6);
  
  return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
}

// Generate content for a location entity
function generateLocationContent(entityId, locationName, locationType) {
  const contentTypes = ['REVIEW', 'EVENT', 'PROMOTION', 'INFORMATION'];
  const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
  
  // Title templates
  const titleTemplates = {
    'REVIEW': [
      `My Experience at ${locationName}`,
      `What to Expect at ${locationName}`,
      `A Visit to ${locationName}`
    ],
    'EVENT': [
      `Upcoming Events at ${locationName}`,
      `Special Gathering at ${locationName}`,
      `${locationName} Hosts Community Event`
    ],
    'PROMOTION': [
      `Special Offer at ${locationName}`,
      `Limited Time Discount at ${locationName}`,
      `Members Receive Benefits at ${locationName}`
    ],
    'INFORMATION': [
      `About ${locationName}`,
      `Facilities at ${locationName}`,
      `${locationName} Hours and Information`
    ]
  };
  
  // Description templates
  const descriptionTemplates = {
    'REVIEW': [
      `I had a wonderful time at ${locationName}. The atmosphere was inviting and the service was excellent. Would definitely recommend!`,
      `${locationName} exceeded my expectations in every way. From the moment I arrived, I felt welcomed and appreciated as a guest.`,
      `My visit to ${locationName} was a highlight of the week. The attention to detail and quality of experience were truly impressive.`
    ],
    'EVENT': [
      `Join us for a special event at ${locationName} where we'll be celebrating local talent and community spirit. All are welcome!`,
      `${locationName} is pleased to announce an upcoming gathering featuring special guests and activities for all ages.`,
      `Don't miss our next event at ${locationName} - it promises to be an unforgettable experience with something for everyone.`
    ],
    'PROMOTION': [
      `For a limited time, enjoy special pricing when you visit ${locationName}. Present this offer to receive your discount.`,
      `${locationName} is offering exclusive benefits to visitors this month. Come experience what makes us special!`,
      `Members receive priority access and special rates at ${locationName}. Join our membership program today!`
    ],
    'INFORMATION': [
      `${locationName} is open daily from 9am to 9pm. We offer a range of amenities including free WiFi and comfortable seating areas.`,
      `Located in the heart of the city, ${locationName} is easily accessible by public transportation and offers ample parking.`,
      `${locationName} features state-of-the-art facilities designed for your comfort and convenience. Visit us to learn more!`
    ]
  };
  
  const titles = titleTemplates[contentType];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  const descriptions = descriptionTemplates[contentType];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // URL and thumbnail
  const urlSuffix = locationName.toLowerCase().replace(/\s+/g, '-');
  const url = `https://example.com/locations/${urlSuffix}`;
  const thumbnailUrl = `https://source.unsplash.com/random/300x200/?${locationType.toLowerCase()}`;
  
  return {
    entityId,
    title,
    description,
    url,
    thumbnailUrl,
    type: contentType
  };
}

// Create location entities
async function createLocationEntities(previewMode = false) {
  if (previewMode) {
    console.log('PREVIEW MODE: Generating sample location entities without saving to database');
  } else {
    console.log('Starting location entity generation...');
  }
  
  const createdEntities = [];
  const createdContent = [];
  
  try {
    // Determine how many location entities to create
    const numLocations = previewMode ? 5 : Math.floor(Math.random() * 10) + 10; // 10-19 in normal mode, 5 in preview
    
    for (let i = 0; i < numLocations; i++) {
      // Select a random location type
      const locationTypeObj = LOCATION_TYPES[Math.floor(Math.random() * LOCATION_TYPES.length)];
      const locationType = locationTypeObj.type;
      
      // Generate location name and details
      const locationName = generateLocationName(locationType);
      const description = generateLocationDescription(locationName, locationType);
      const coordinates = generateRandomCoordinates();
      const iconUrl = `https://source.unsplash.com/random/100x100/?${locationType.toLowerCase()},icon`;
      
      if (previewMode) {
        // Just display info in preview mode
        console.log(`\n[PREVIEW] Location: ${locationName} (${locationType})`);
        console.log(`  Description: ${description}`);
        console.log(`  Coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
        
        // Add to results for reporting
        const entityId = createdEntities.length + 1;
        createdEntities.push({
          id: entityId,
          name: locationName,
          category: 'LOCATION',
          description,
          entityType: locationTypeObj.entityType,
          coordinates,
          metadata: { locationType }
        });
        
        // Generate preview content
        const numContent = 2;
        const contentItems = [];
        
        for (let j = 0; j < numContent; j++) {
          const content = generateLocationContent(entityId, locationName, locationType);
          contentItems.push(content.title);
          createdContent.push(content);
        }
        
        console.log(`  Content: ${contentItems.join(', ')}`);
      } else {
        try {
          // Create the entity in database
          const [entity] = await db
            .insert(schema.entities)
            .values({
              name: locationName,
              category: 'LOCATION',
              description,
              entityType: locationTypeObj.entityType,
              coordinates,
              iconUrl,
              metadata: { locationType }
            })
            .returning();
          
          createdEntities.push(entity);
          console.log(`Created location entity: ${locationName} (ID: ${entity.id})`);
          
          // Create 2-4 content items for each location
          const numContentItems = Math.floor(Math.random() * 3) + 2; // 2-4 items
          
          for (let j = 0; j < numContentItems; j++) {
            const contentData = generateLocationContent(entity.id, locationName, locationType);
            
            const [content] = await db
              .insert(schema.entityContent)
              .values(contentData)
              .returning();
            
            createdContent.push(content);
            console.log(`Created content: ${content.title} for location ${locationName}`);
          }
        } catch (error) {
          console.error(`Error creating location ${locationName}:`, error);
        }
      }
    }
    
    // Report results
    if (previewMode) {
      console.log(`\n[PREVIEW] Would create ${createdEntities.length} location entities with ${createdContent.length} content items`);
    } else {
      console.log(`Successfully created ${createdEntities.length} location entities with ${createdContent.length} content items`);
    }
    
    return { entities: createdEntities, content: createdContent };
    
  } catch (error) {
    console.error('Error in location entity creation:', error);
    throw error;
  }
}

// Check if script is running in preview mode
const isPreviewMode = process.argv.includes('--preview');

// Execute the function
createLocationEntities(isPreviewMode)
  .then((result) => {
    if (isPreviewMode) {
      console.log('Preview complete - no data was saved to the database');
    } else {
      console.log('Location entity generation complete!');
      console.log(`Created ${result.entities.length} entities and ${result.content.length} content items`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate location entities:', error);
    process.exit(1);
  });