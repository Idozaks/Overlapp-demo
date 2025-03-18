/**
 * Synthetic Locations Generator Script
 * 
 * This script generates synthetic physical locations that can be used
 * for creating posts with location data. All locations are clearly
 * marked as synthetic/AI-generated.
 */

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./shared/schema');

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Types of synthetic locations
const LOCATION_TYPES = [
  'SYNTHETIC_PARK',
  'SYNTHETIC_MALL',
  'SYNTHETIC_THEATER',
  'SYNTHETIC_RESTAURANT',
  'SYNTHETIC_MUSEUM',
  'SYNTHETIC_LIBRARY',
  'SYNTHETIC_CAFE',
  'SYNTHETIC_GYM',
  'SYNTHETIC_CONCERT_VENUE',
  'SYNTHETIC_CONFERENCE_CENTER'
];

// City names for our synthetic locations
const SYNTHETIC_CITIES = [
  'AIville',
  'Synthopolis',
  'Virtualton',
  'Simulacra City',
  'Botburg',
  'Digital Heights',
  'Pixelton',
  'Datapolis',
  'Algorithmia',
  'Codeminster'
];

// Generate a synthetic location name
function generateLocationName(locationType) {
  const typePrefix = locationType.replace('SYNTHETIC_', '').replace('_', ' ');
  
  const prefixes = {
    'PARK': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'MALL': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Tech', 'Cyber', 'Bot', 'Pixel', 'Data'],
    'THEATER': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'RESTAURANT': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'MUSEUM': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'LIBRARY': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'CAFE': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'GYM': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'CONCERT_VENUE': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm'],
    'CONFERENCE_CENTER': ['Synthetic', 'Virtual', 'Digital', 'AI', 'Simulated', 'Bot', 'Pixel', 'Data', 'Code', 'Algorithm']
  };
  
  const suffixes = {
    'PARK': ['Park', 'Gardens', 'Reserve', 'Commons', 'Meadows'],
    'MALL': ['Mall', 'Plaza', 'Center', 'Galleria', 'Shops'],
    'THEATER': ['Theater', 'Cinema', 'Playhouse', 'Stage', 'Amphitheater'],
    'RESTAURANT': ['Restaurant', 'Eatery', 'Bistro', 'Grill', 'Diner'],
    'MUSEUM': ['Museum', 'Gallery', 'Exhibition', 'Collection', 'Archive'],
    'LIBRARY': ['Library', 'Archives', 'Repository', 'Collection', 'Resource Center'],
    'CAFE': ['Cafe', 'Coffee Shop', 'Tea House', 'Espresso Bar', 'Bistro'],
    'GYM': ['Gym', 'Fitness Center', 'Training Studio', 'Health Club', 'Athletic Center'],
    'CONCERT_VENUE': ['Concert Hall', 'Music Venue', 'Stage', 'Auditorium', 'Arena'],
    'CONFERENCE_CENTER': ['Conference Center', 'Convention Hall', 'Meeting Place', 'Forum', 'Assembly']
  };
  
  const type = typePrefix.split(' ')[0];
  const prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
  const suffix = suffixes[type][Math.floor(Math.random() * suffixes[type].length)];
  
  return `${prefix} ${suffix}`;
}

// Generate random coordinates in different world regions
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
    { minLat: -40, maxLat: -10, minLng: 110, maxLng: 155 },
    // South America
    { minLat: -35, maxLat: 10, minLng: -80, maxLng: -35 }
  ];
  
  // Select a random region
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  // Generate coordinates within that region
  const latitude = (Math.random() * (region.maxLat - region.minLat) + region.minLat).toFixed(6);
  const longitude = (Math.random() * (region.maxLng - region.minLng) + region.minLng).toFixed(6);
  
  return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
}

// Generate a post content for a location
function generatePostContent(locationName, locationType) {
  const type = locationType.replace('SYNTHETIC_', '').replace('_', ' ').toLowerCase();
  
  const templates = [
    `Visiting the AI-generated ${locationName} today. This is a synthetic ${type} that doesn't exist in real life, created for testing.`,
    `Checking out ${locationName}, a completely fictional ${type} created by AI for testing purposes.`,
    `At the synthetic ${locationName}. This ${type} is AI-generated and used for application testing only.`,
    `Exploring ${locationName}, which is a computer-generated ${type} that doesn't exist in the real world.`,
    `Posted from ${locationName}, an AI-simulated ${type} created for this demo application.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Create synthetic post with location
async function createSyntheticLocationPost(userId, locationType) {
  const locationName = generateLocationName(locationType);
  const city = SYNTHETIC_CITIES[Math.floor(Math.random() * SYNTHETIC_CITIES.length)];
  const coordinates = generateRandomCoordinates();
  
  const placeName = `${locationName}, ${city} (SYNTHETIC)`;
  const content = generatePostContent(locationName, locationType);
  
  const location = {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    placeName: placeName
  };
  
  try {
    const [post] = await db
      .insert(schema.posts)
      .values({
        userId,
        content,
        location
      })
      .returning();
    
    return post;
  } catch (error) {
    console.error(`Error creating post for location ${locationName}:`, error);
    throw error;
  }
}

// Get all users from the database
async function getAllUsers() {
  try {
    const allUsers = await db.select().from(schema.users);
    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Create synthetic location posts for all users
async function createSyntheticLocationPosts() {
  console.log('Starting synthetic location post generation...');
  
  try {
    // Get all users
    const allUsers = await getAllUsers();
    
    if (allUsers.length === 0) {
      console.log('No users found in the database. Please create users first.');
      return [];
    }
    
    console.log(`Found ${allUsers.length} users. Creating synthetic location posts...`);
    
    const createdPosts = [];
    
    // For each user, create 1-3 location posts
    for (const user of allUsers) {
      const numPosts = Math.floor(Math.random() * 3) + 1; // 1-3 posts per user
      
      console.log(`Creating ${numPosts} location posts for user ${user.username} (ID: ${user.id})...`);
      
      for (let i = 0; i < numPosts; i++) {
        // Select a random location type
        const locationType = LOCATION_TYPES[Math.floor(Math.random() * LOCATION_TYPES.length)];
        
        try {
          const post = await createSyntheticLocationPost(user.id, locationType);
          createdPosts.push(post);
          console.log(`Created post with location: ${post.location.placeName}`);
        } catch (error) {
          console.error(`Error creating post for user ${user.username}:`, error);
        }
      }
    }
    
    console.log(`Successfully created ${createdPosts.length} synthetic location posts`);
    return createdPosts;
    
  } catch (error) {
    console.error('Error in location post creation process:', error);
    throw error;
  }
}

// Execute the function
createSyntheticLocationPosts()
  .then((posts) => {
    console.log('Location post generation complete!');
    console.log(`Created ${posts.length} posts with synthetic locations`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate location posts:', error);
    process.exit(1);
  });