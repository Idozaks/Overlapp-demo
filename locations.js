/**
 * Location Generator Script
 * 
 * This script generates realistic physical locations that can be used
 * for creating posts with location data to simulate real-world user
 * interactions and posting behaviors.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema.js';

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Types of locations
const LOCATION_TYPES = [
  'PARK',
  'MALL',
  'THEATER',
  'RESTAURANT',
  'MUSEUM',
  'LIBRARY',
  'CAFE',
  'GYM',
  'CONCERT_VENUE',
  'CONFERENCE_CENTER'
];

// City names for our locations
const CITIES = [
  'San Francisco',
  'New York',
  'Chicago',
  'London',
  'Tokyo',
  'Sydney',
  'Berlin',
  'Toronto',
  'Singapore',
  'Barcelona',
  'Amsterdam',
  'Stockholm',
  'Seoul',
  'Melbourne',
  'Vienna'
];

// Generate a realistic location name
function generateLocationName(locationType) {
  const typePrefix = locationType.replace('_', ' ');
  
  const prefixes = {
    'PARK': ['Central', 'Riverside', 'Golden Gate', 'Highland', 'Sunset', 'Evergreen', 'Oakwood', 'Lakeside', 'Emerald', 'Victoria'],
    'MALL': ['Grand', 'Metro', 'Westfield', 'City Center', 'Plaza', 'Gallery', 'Pacific', 'Bayside', 'Horizon', 'Union Square'],
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
    'MALL': ['Mall', 'Plaza', 'Center', 'Galleria', 'Shops', 'Shopping Center', 'Market', 'Square', 'Promenade'],
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
  const type = locationType.replace('_', ' ').toLowerCase();
  
  const templates = [
    `Visiting ${locationName} today. Such a beautiful day to enjoy this amazing ${type}!`,
    `Checking out ${locationName} with friends. Definitely a must-visit ${type} in the area.`,
    `Spending the afternoon at ${locationName}. Great atmosphere at this ${type}!`,
    `Exploring ${locationName} for the first time. Can't believe I haven't been to this ${type} before.`,
    `Just arrived at ${locationName}. Love the vibe of this ${type}!`,
    `Having a wonderful time at ${locationName}. The perfect ${type} for a day like today.`,
    `Finally made it to ${locationName}. This ${type} is everything I hoped it would be!`,
    `Taking in the sights at ${locationName}. Definitely one of the best ${type}s I've visited.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Create post with location
async function createLocationPost(userId, locationType) {
  const locationName = generateLocationName(locationType);
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const coordinates = generateRandomCoordinates();
  
  const placeName = `${locationName}, ${city}`;
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

// Create location posts for all users
async function createLocationPosts() {
  console.log('Starting location post generation...');
  
  try {
    // Get all users
    const allUsers = await getAllUsers();
    
    if (allUsers.length === 0) {
      console.log('No users found in the database. Please create users first.');
      return [];
    }
    
    console.log(`Found ${allUsers.length} users. Creating location posts...`);
    
    const createdPosts = [];
    
    // For each user, create 1-3 location posts
    for (const user of allUsers) {
      const numPosts = Math.floor(Math.random() * 3) + 1; // 1-3 posts per user
      
      console.log(`Creating ${numPosts} location posts for user ${user.username} (ID: ${user.id})...`);
      
      for (let i = 0; i < numPosts; i++) {
        // Select a random location type
        const locationType = LOCATION_TYPES[Math.floor(Math.random() * LOCATION_TYPES.length)];
        
        try {
          const post = await createLocationPost(user.id, locationType);
          createdPosts.push(post);
          console.log(`Created post with location: ${post.location.placeName}`);
        } catch (error) {
          console.error(`Error creating post for user ${user.username}:`, error);
        }
      }
    }
    
    console.log(`Successfully created ${createdPosts.length} location posts`);
    return createdPosts;
    
  } catch (error) {
    console.error('Error in location post creation process:', error);
    throw error;
  }
}

// Execute the function
createLocationPosts()
  .then((posts) => {
    console.log('Location post generation complete!');
    console.log(`Created ${posts.length} location posts`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate location posts:', error);
    process.exit(1);
  });