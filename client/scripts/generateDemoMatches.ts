/**
 * Script to generate demo matches for the Overlapp MVP
 * This creates profiles that share at least one interest with the user's profile
 */

import fs from 'fs';
import path from 'path';

// Seed data
const NAMES = [
  'Alex Chen', 'Maya Cohen', 'Daniel Levy', 'Sophia Kim', 'Ethan Miller',
  'Olivia Davis', 'Noah Rodriguez', 'Emma Wilson', 'Liam Garcia', 'Ava Martinez',
  'Jackson Brown', 'Ella Wang', 'Lucas Taylor', 'Mia Johnson', 'Aiden Smith'
];

const LOCATIONS = [
  'Tel Aviv', 'Jerusalem', 'Haifa', 'Be\'er Sheva', 'Eilat',
  'Herzliya', 'Netanya', 'Ashdod', 'Ra\'anana', 'Rehovot'
];

const ALL_INTERESTS = [
  'Photography', 'Travel', 'Design', 'Food', 'Coffee', 'Music',
  'Technology', 'Startups', 'Hiking', 'Art', 'Reading', 'Writing',
  'Fitness', 'Yoga', 'Cooking', 'Gaming', 'Movies', 'Fashion',
  'Dancing', 'Painting', 'Swimming', 'Running', 'Cycling'
];

const BIOS = [
  'UX Designer with a passion for travel and photography',
  'Food blogger and coffee enthusiast',
  'Tech entrepreneur who loves the outdoors',
  'Visual artist exploring the intersection of art and technology',
  'Software developer by day, musician by night',
  'Fitness instructor focused on holistic wellness',
  'Travel writer documenting hidden gems around the world',
  'Chef experimenting with fusion cuisine',
  'Startup founder building solutions for sustainability',
  'Photographer capturing everyday moments'
];

// Helper functions
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomItems = <T>(arr: T[], min: number, max: number): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Read user data to ensure matches share at least one interest
const getUserInterests = (): string[] => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.interests.map((idx: number) => ALL_INTERESTS[idx] || 'Photography');
    }
  } catch (e) {
    console.error('Failed to get user interests:', e);
  }
  
  // Fallback
  return ['Photography', 'Travel', 'Design'];
};

// Generate a match profile
const generateMatch = (id: number, userInterests: string[]) => {
  // Ensure at least one shared interest
  const sharedInterest = getRandomItem(userInterests);
  const otherInterests = getRandomItems(
    ALL_INTERESTS.filter(i => i !== sharedInterest), 
    1, 
    3
  );
  
  const interests = [sharedInterest, ...otherInterests];
  const name = getRandomItem(NAMES);
  
  return {
    id,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.split(' ')[0]}`,
    interests,
    location: getRandomItem(LOCATIONS),
    bio: getRandomItem(BIOS),
    matchPercentage: getRandomInt(60, 95)
  };
};

// Main function
const generateDemoMatches = (count: number = 5) => {
  const userInterests = getUserInterests();
  const matches = Array.from({ length: count }, (_, i) => 
    generateMatch(i + 1, userInterests)
  );
  
  // Sort by match percentage (highest first)
  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  // Write to file
  const outputPath = path.join(__dirname, '../src/data/demo-matches.json');
  fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2));
  
  console.log(`Generated ${count} demo matches and saved to ${outputPath}`);
  return matches;
};

// Auto-run if executed directly
if (require.main === module) {
  generateDemoMatches();
}

export default generateDemoMatches;