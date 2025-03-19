/**
 * Enhanced Synthetic User Generator Script
 * 
 * This script generates detailed user profiles with realistic attributes
 * and connects them to interests that are pulled directly from the database
 */

import { db } from './server/db.js';
import { interests } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define lists of possible values for different user attributes with more variety
const firstNames = [
  // Western names
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Oliver',
  // Asian names
  'Mei', 'Hiroshi', 'Jun', 'Yuki', 'Chen', 'Ananya', 'Vikram', 'Priya', 'Raj', 'Seo-yun',
  // Hispanic names
  'Sofia', 'Santiago', 'Isabella', 'Mateo', 'Valentina', 'Diego', 'Camila', 'Sebastián', 'Victoria', 'Alejandro',
  // African names
  'Amara', 'Kofi', 'Nia', 'Kwame', 'Zuri', 'Tafari', 'Makena', 'Jabari', 'Imani', 'Sekou',
  // Middle Eastern names
  'Amir', 'Fatima', 'Omar', 'Leila', 'Hassan', 'Yasmin', 'Ali', 'Noor', 'Ahmad', 'Zara',
  // Eastern European names
  'Anastasia', 'Dimitri', 'Natasha', 'Viktor', 'Olga', 'Mikhail', 'Tatiana', 'Ivan', 'Ekaterina', 'Vladimir'
];

const lastNames = [
  // Western surnames
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Anderson',
  // Asian surnames
  'Zhang', 'Wang', 'Li', 'Chen', 'Liu', 'Tanaka', 'Suzuki', 'Kim', 'Park', 'Singh',
  // Hispanic surnames
  'García', 'Rodríguez', 'López', 'Martínez', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
  // African surnames
  'Okafor', 'Mensah', 'Abara', 'Osei', 'Diallo', 'Ndongo', 'Chukwu', 'Mbeki', 'Nkosi', 'Afolayan',
  // Middle Eastern surnames
  'Al-Farsi', 'Hassan', 'Abdel-Rahman', 'El-Masri', 'Khalil', 'Saleh', 'Amir', 'Karimi', 'Hakimi', 'Nassar',
  // Eastern European surnames
  'Petrov', 'Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedeva', 'Kozlov', 'Novikov', 'Morozov'
];

const genders = ['Male', 'Female', 'Non-binary', 'Gender-fluid', 'Transgender', 'Prefer not to say'];
const ageRanges = ['18-25', '26-35', '36-45', '46-55', '56-65', '66+'];
const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Japan', 'India', 'Brazil', 
  'South Africa', 'France', 'China', 'Mexico', 'Nigeria', 'Egypt', 'Russia', 'Italy', 'Spain', 
  'South Korea', 'Argentina', 'Sweden', 'Netherlands', 'UAE', 'Singapore', 'Kenya', 'Israel',
  'New Zealand', 'Ireland', 'Norway', 'Ukraine', 'Thailand', 'Turkey', 'Indonesia', 'Colombia'
];

const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 'Japanese', 'Portuguese', 'Arabic', 
  'Hindi', 'Russian', 'Korean', 'Italian', 'Dutch', 'Swedish', 'Hebrew', 'Turkish', 'Greek', 
  'Polish', 'Vietnamese', 'Thai', 'Tagalog', 'Swahili', 'Bengali', 'Farsi', 'Urdu', 'Finnish'
];

const culturalBackgrounds = [
  'Western European', 'Eastern European', 'North American', 'Latin American', 'East Asian', 
  'South Asian', 'Southeast Asian', 'Middle Eastern', 'African', 'Caribbean', 'Pacific Islander', 
  'Scandinavian', 'Mediterranean', 'Central Asian', 'Indigenous', 'Multicultural', 'Jewish', 
  'Orthodox', 'Catholic', 'Protestant', 'Muslim', 'Hindu', 'Buddhist', 'Secular'
];

const educationLevels = [
  'High School', 'Associate\'s Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD/Doctorate', 
  'Technical/Vocational Training', 'Self-taught', 'Professional Certification', 'Trade School', 
  'Some College (no degree)', 'MBA', 'JD (Law Degree)', 'MD (Medical Degree)', 'EdD (Education Doctorate)'
];

const professionalFields = [
  'Technology', 'Healthcare', 'Education', 'Finance', 'Arts', 'Science', 'Engineering', 'Marketing', 
  'Law', 'Hospitality', 'Retail', 'Construction', 'Agriculture', 'Government', 'Non-profit', 
  'Entertainment', 'Media', 'Publishing', 'Transportation', 'Manufacturing', 'Renewable Energy', 
  'Pharmaceuticals', 'Real Estate', 'Consulting', 'Human Resources', 'Customer Service', 
  'Social Services', 'Telecommunications', 'Aviation', 'Architecture', 'Design', 'Research', 
  'Sports & Recreation', 'Food Service', 'Fashion'
];

const communitiesAffiliations = [
  'Professional networks', 'Alumni associations', 'Religious groups', 'Hobby clubs', 
  'Volunteer organizations', 'Sports teams', 'Online communities', 'Neighborhood associations', 
  'Cultural groups', 'Political organizations', 'Environmental groups', 'Book clubs', 
  'Parent-teacher associations', 'Support groups', 'Meetup groups', 'Open-source communities', 
  'Gaming communities', 'Art collectives', 'Fitness communities', 'Industry associations',
  'Chambers of commerce', 'Toastmasters', 'Co-op organizations', 'Farm-to-table networks',
  'Makerspaces', 'Hackerspaces', 'Nonprofit boards'
];

const eventPreferences = [
  'In-person conferences', 'Virtual webinars', 'Small group meetups', 'Large networking events', 
  'Hands-on workshops', 'Panel discussions', 'Keynote presentations', 'Interactive seminars', 
  'Trade shows', 'Hackathons', 'Retreats', 'Social mixers', 'Industry conferences', 
  'Community events', 'Hybrid events', 'One-on-one meetings', 'Multi-day symposiums', 
  'Casual coffee chats', 'Structured networking', 'Demo days', 'Pitch competitions'
];

const collaborationStyles = [
  'Independent worker', 'Team collaborator', 'Servant leader', 'Visionary', 'Detail-oriented', 
  'Strategic thinker', 'Creative problem-solver', 'Analytical processor', 'Process-driven', 
  'Results-focused', 'Facilitator', 'Mentor', 'Coach', 'Remote-first', 'Hybrid-flexible', 
  'Structured process follower', 'Agile adapter', 'Cross-functional connector', 'Deadline-driven', 
  'Relationship builder', 'Systems thinker', 'Project manager', 'Interdisciplinary collaborator'
];

const personalValues = [
  'Integrity', 'Family', 'Learning', 'Growth', 'Community', 'Independence', 'Creativity', 
  'Achievement', 'Balance', 'Adventure', 'Security', 'Diversity', 'Inclusion', 'Loyalty', 
  'Excellence', 'Innovation', 'Tradition', 'Spirituality', 'Health', 'Sustainability', 
  'Honesty', 'Respect', 'Responsibility', 'Courage', 'Compassion', 'Justice', 'Service',
  'Authenticity', 'Optimism', 'Flexibility', 'Resilience', 'Curiosity', 'Collaboration',
  'Freedom', 'Harmony', 'Persistence', 'Adaptability'
];

const digitalIdentities = [
  'Early adopter', 'Content creator', 'Social media influencer', 'Digital minimalist', 
  'Tech enthusiast', 'Digital privacy advocate', 'Gamer', 'Casual user', 'Developer', 
  'Designer', 'Cybersecurity conscious', 'Open-source contributor', 'Digital nomad', 
  'Virtual reality explorer', 'Blockchain enthusiast', 'Tech skeptic', 'Digital artist', 
  'Podcaster', 'Streamer', 'Online educator', 'Digital entrepreneur', 'Data scientist', 
  'IoT hobbyist', 'Smart home enthusiast', 'Metaverse resident', 'AI researcher', 
  'Tech journalist', 'Digital accessibility advocate'
];

const activityLevels = [
  'Very active (daily exercise)', 'Moderately active (3-5 times per week)', 
  'Occasionally active (1-2 times per week)', 'Mostly sedentary with occasional activity', 
  'Active commuter (walking/biking)', 'Outdoor enthusiast', 'Competitive athlete', 
  'Casual sports participant', 'Fitness class regular', 'Home workout enthusiast', 
  'Yoga/meditation practitioner', 'Strength trainer', 'Endurance athlete', 
  'Adventure sports participant', 'Wellness-focused', 'Dance enthusiast', 
  'Water sports participant', 'Team sports player', 'Martial arts practitioner',
  'Hiking enthusiast', 'Cycling enthusiast'
];

const culturalExperiences = [
  'Well-traveled internationally', 'Local cultural expert', 'Cultural preservation advocate', 
  'Festival participant', 'Multicultural upbringing', 'Language enthusiast', 'Food explorer', 
  'Historical site visitor', 'Museum enthusiast', 'Traditional arts practitioner', 
  'International education background', 'Cross-cultural work experience', 'Indigenous knowledge bearer', 
  'Diaspora community member', 'Heritage tourism enthusiast', 'International volunteer', 
  'Ethnographic researcher', 'Cultural exchange participant', 'Diplomatic experience', 
  'Traditional craft practitioner', 'Cultural festival organizer', 'Cultural liaison', 
  'International adoption connection', 'Study abroad alumnus', 'Multilingual household member'
];

const learningStyles = [
  'Visual learner', 'Auditory learner', 'Kinesthetic/hands-on learner', 'Reading/writing learner', 
  'Logical/analytical learner', 'Social/interpersonal learner', 'Solitary/intrapersonal learner', 
  'Project-based learner', 'Problem-solving learner', 'Experiential learner', 'Sequential learner', 
  'Global conceptual learner', 'Practical application focused', 'Theoretical framework builder', 
  'Multimodal learning approach', 'Self-directed learner', 'Guided instruction learner', 
  'Collaborative learning enthusiast', 'Competitive learning motivator', 'Reflective practitioner', 
  'Active experimenter', 'Continuous improvement seeker'
];

const occupations = [
  'Software Engineer', 'Data Scientist', 'UX/UI Designer', 'Product Manager', 'Digital Marketing Specialist',
  'Doctor', 'Nurse Practitioner', 'Pharmacist', 'Medical Researcher', 'Healthcare Administrator',
  'Teacher', 'Professor', 'Education Administrator', 'Educational Therapist', 'Curriculum Developer',
  'Financial Analyst', 'Investment Banker', 'Financial Planner', 'Accountant', 'Economist',
  'Graphic Designer', 'Industrial Designer', 'Fashion Designer', 'Interior Designer', 'Architect',
  'Content Creator', 'Journalist', 'Author', 'Editor', 'Copywriter',
  'Environmental Scientist', 'Renewable Energy Specialist', 'Sustainability Consultant', 'Conservation Biologist', 'Urban Planner',
  'Chef', 'Food Scientist', 'Nutritionist', 'Restaurant Manager', 'Sommelier',
  'Psychologist', 'Therapist', 'Social Worker', 'Counselor', 'Mental Health Advocate',
  'Entrepreneur', 'Business Consultant', 'Non-profit Director', 'Project Manager', 'Operations Manager',
  'Artist', 'Musician', 'Actor', 'Filmmaker', 'Photographer',
  'Lawyer', 'Judge', 'Legal Consultant', 'Paralegal', 'Human Rights Advocate',
  'Civil Engineer', 'Mechanical Engineer', 'Aerospace Engineer', 'Biomedical Engineer', 'Electrical Engineer',
  'Farmer', 'Agricultural Scientist', 'Sustainability Expert', 'Veterinarian', 'Wildlife Conservationist',
  'Flight Attendant', 'Pilot', 'Travel Guide', 'Hospitality Manager', 'Event Planner',
  'Professional Athlete', 'Sports Coach', 'Fitness Instructor', 'Sports Therapist', 'Athletic Director',
  'Police Officer', 'Firefighter', 'Emergency Medical Technician', 'Military Personnel', 'Security Specialist',
  'Librarian', 'Archivist', 'Museum Curator', 'Art Historian', 'Anthropologist',
  'Electrician', 'Plumber', 'Carpenter', 'HVAC Technician', 'General Contractor'
];

const locations = [
  // North America
  'New York, USA', 'San Francisco, USA', 'Chicago, USA', 'Toronto, Canada', 'Vancouver, Canada',
  'Mexico City, Mexico', 'Montreal, Canada', 'Austin, USA', 'Seattle, USA', 'Denver, USA',
  // Europe
  'London, UK', 'Paris, France', 'Berlin, Germany', 'Amsterdam, Netherlands', 'Barcelona, Spain',
  'Rome, Italy', 'Stockholm, Sweden', 'Dublin, Ireland', 'Vienna, Austria', 'Zurich, Switzerland',
  // Asia
  'Tokyo, Japan', 'Singapore', 'Seoul, South Korea', 'Shanghai, China', 'Mumbai, India',
  'Bangkok, Thailand', 'Dubai, UAE', 'Hong Kong', 'Istanbul, Turkey', 'Tel Aviv, Israel',
  // South America
  'São Paulo, Brazil', 'Buenos Aires, Argentina', 'Bogotá, Colombia', 'Lima, Peru', 'Santiago, Chile',
  // Africa
  'Cape Town, South Africa', 'Nairobi, Kenya', 'Cairo, Egypt', 'Lagos, Nigeria', 'Marrakech, Morocco',
  // Oceania
  'Sydney, Australia', 'Melbourne, Australia', 'Auckland, New Zealand', 'Wellington, New Zealand', 'Brisbane, Australia'
];

// Retail preferences from the application
const retailPreferences = [
  'Electronics', 'Clothing', 'Home Goods', 'Books', 'Sports Equipment', 
  'Beauty Products', 'Health Foods', 'Jewelry', 'Art Supplies', 'Office Supplies',
  'Specialty Foods', 'Eco-Friendly Products', 'Luxury Items', 'Handcrafted Goods', 'Digital Products',
  'Outdoor Gear', 'Musical Instruments', 'Vintage/Antiques', 'Home Improvement', 'Garden Supplies',
  'Toys & Games', 'Pet Supplies', 'Automotive Accessories', 'Stationery', 'Kitchenware',
  'Photography Equipment', 'Smart Home Devices', 'Sustainable Fashion', 'Fitness Equipment', 'Specialty Beverages'
];

// Enhanced helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const result = [];
  const arrayCopy = [...array];
  
  for (let i = 0; i < count; i++) {
    if (arrayCopy.length === 0) break;
    const randomIndex = Math.floor(Math.random() * arrayCopy.length);
    result.push(arrayCopy[randomIndex]);
    arrayCopy.splice(randomIndex, 1);
  }
  
  return result;
}

function weightedRandom(min, max, skew = 1) {
  // Returns a random number with optional skew toward min (skew < 1) or max (skew > 1)
  const u = Math.random();
  const v = Math.random();
  
  if (skew === 1) {
    return min + (max - min) * u;
  }
  
  let result;
  if (skew < 1) {
    // Skew toward max
    result = min + (max - min) * (Math.pow(u, skew) + Math.pow(v, skew)) / 2;
  } else {
    // Skew toward min
    result = min + (max - min) * (1 - (Math.pow(1 - u, 1 / skew) + Math.pow(1 - v, 1 / skew)) / 2);
  }
  
  return Math.min(Math.max(result, min), max);
}

function generateUsername(firstName, lastName) {
  const styles = [
    () => (firstName + lastName + Math.floor(Math.random() * 1000)).toLowerCase(),
    () => (firstName.toLowerCase() + '_' + lastName.toLowerCase()),
    () => (firstName.charAt(0).toLowerCase() + lastName.toLowerCase() + Math.floor(Math.random() * 100)),
    () => (lastName.toLowerCase() + firstName.charAt(0).toLowerCase() + Math.floor(Math.random() * 10)),
    () => (firstName.toLowerCase() + Math.floor(Math.random() * 100)),
    () => (firstName.toLowerCase() + '.' + lastName.toLowerCase()),
    () => ('the' + firstName.toLowerCase() + Math.floor(Math.random() * 10))
  ];
  
  return getRandomElement(styles)();
}

function generateDetailedBio(userInfo) {
  const { firstName, interests, occupation, personalValues, learningStyle, 
          culturalBackground, digitalIdentity, collaborationStyle } = userInfo;
  
  // Define bio templates
  const templates = [
    // Personal story template
    (info) => `${getRandomElement(['Hi', 'Hello', 'Hey there', 'Greetings'])}! I'm ${info.firstName}, a ${info.occupation} with a passion for ${getRandomElements(info.interests, 1, 2).join(' and ')}. My ${info.learningStyle} approach helps me excel in ${info.collaborationStyle} environments. Deeply valuing ${getRandomElements(info.personalValues, 1, 2).join(' and ')}, I bring my ${info.culturalBackground} perspective to everything I do. You'll find me as a ${info.digitalIdentity} in the digital world.`,
    
    // Professional focus template
    (info) => `${info.occupation} with ${getRandomElement(['extensive', 'growing', 'specialized', 'diverse'])} experience in ${getRandomElements(info.interests, 1, 2).join(' and ')}. As a ${info.digitalIdentity}, I approach problems with a ${info.collaborationStyle} mindset. My ${info.culturalBackground} background has shaped my values of ${getRandomElements(info.personalValues, 1, 2).join(' and ')}. Always learning through my preferred ${info.learningStyle} style.`,
    
    // Passionate interests template
    (info) => `Passionate about ${getRandomElements(info.interests, 2, 3).join(', ')}, and ${getRandomElement(info.interests)}. Working as a ${info.occupation} has strengthened my ${info.collaborationStyle} abilities. I value ${getRandomElements(info.personalValues, 1, 2).join(' and ')} above all. My ${info.culturalBackground} heritage and ${info.learningStyle} approach define how I engage with both digital and physical worlds as a ${info.digitalIdentity}.`,
    
    // Values-first template
    (info) => `Driven by ${getRandomElements(info.personalValues, 2, 3).join(', ')}, and ${getRandomElement(info.personalValues)}. My work as a ${info.occupation} allows me to explore ${getRandomElements(info.interests, 1, 2).join(' and ')}. I thrive in ${info.collaborationStyle} settings and apply my ${info.learningStyle} tendencies to continually grow. My ${info.culturalBackground} perspective influences my identity as a ${info.digitalIdentity} online.`,
    
    // Future-oriented template
    (info) => `Building a future where ${getRandomElements(info.personalValues, 1, 2).join(' and ')} drive innovation in ${getRandomElements(info.interests, 1, 2).join(' and ')}. Currently a ${info.occupation} with a ${info.collaborationStyle} approach. My ${info.culturalBackground} background and ${info.learningStyle} style have shaped my journey as a ${info.digitalIdentity} in our connected world.`
  ];
  
  return getRandomElement(templates)(userInfo);
}

function createAttributeImportance(userInfo) {
  // Create personalized attribute importance based on user's background
  const base = {
    gender: Math.floor(Math.random() * 10) + 1,
    ageRange: Math.floor(Math.random() * 10) + 1,
    countryOfOrigin: Math.floor(Math.random() * 10) + 1,
    languagesSpoken: Math.floor(Math.random() * 10) + 1,
    culturalBackground: Math.floor(Math.random() * 10) + 1,
    education: Math.floor(Math.random() * 10) + 1,
    professionalField: Math.floor(Math.random() * 10) + 1,
    communityAffiliations: Math.floor(Math.random() * 10) + 1,
    eventPreferences: Math.floor(Math.random() * 10) + 1,
    collaborationStyle: Math.floor(Math.random() * 10) + 1,
    personalValues: Math.floor(Math.random() * 10) + 1,
    digitalIdentity: Math.floor(Math.random() * 10) + 1,
    physicalActivityLevel: Math.floor(Math.random() * 10) + 1,
    culturalExperiences: Math.floor(Math.random() * 10) + 1,
    learningStyle: Math.floor(Math.random() * 10) + 1
  };
  
  // Increase importance of certain attributes based on user's background
  if (userInfo.professionalField === 'Technology' || userInfo.professionalField === 'Engineering') {
    base.digitalIdentity += 2;
    base.education += 1;
  }
  
  if (userInfo.learningStyle.includes('Social') || userInfo.learningStyle.includes('Collaborative')) {
    base.communityAffiliations += 2;
    base.collaborationStyle += 2;
  }
  
  if (userInfo.personalValues.includes('Tradition') || userInfo.personalValues.includes('Heritage')) {
    base.culturalBackground += 3;
    base.countryOfOrigin += 2;
  }
  
  // Cap values at 10
  Object.keys(base).forEach(key => {
    base[key] = Math.min(base[key], 10);
  });
  
  return base;
}

// Main function to fetch interests from database and generate users
async function generateEnrichedUsers(count = 25) {
  try {
    // Check for preview mode
    const isPreviewMode = process.argv.includes('--preview');
    
    if (isPreviewMode) {
      console.log('=== 👁️ PREVIEW MODE: Enhanced User Generation ===');
      console.log('This will show sample data without saving to the database');
    }
    
    console.log('Fetching interests from database...');
    // Fetch all interests from the database
    const dbInterests = await db.select().from(interests);
    
    if (!dbInterests || dbInterests.length === 0) {
      throw new Error('No interests found in the database. Please populate interests first.');
    }
    
    console.log(`Found ${dbInterests.length} interests in the database.`);
    
    // Generate users
    const users = [];
    
    console.log(`Generating ${count} enriched user profiles...`);
    
    for (let i = 1; i <= count; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      
      // Cultural match for names when possible (not perfect but adds some correlation)
      let personalBackground;
      if (firstNames.indexOf(firstName) < 10 && lastNames.indexOf(lastName) < 10) {
        personalBackground = 'Western';
      } else if (firstNames.indexOf(firstName) >= 10 && firstNames.indexOf(firstName) < 20) {
        personalBackground = 'Asian';
      } else if (firstNames.indexOf(firstName) >= 20 && firstNames.indexOf(firstName) < 30) {
        personalBackground = 'Hispanic/Latino';
      } else if (firstNames.indexOf(firstName) >= 30 && firstNames.indexOf(firstName) < 40) {
        personalBackground = 'African';
      } else if (firstNames.indexOf(firstName) >= 40 && firstNames.indexOf(firstName) < 50) {
        personalBackground = 'Middle Eastern';
      } else {
        personalBackground = 'Eastern European';
      }
      
      // Select random attributes
      const gender = getRandomElement(genders);
      const ageRange = getRandomElement(ageRanges);
      const age = parseInt(ageRange.split('-')[0]) + Math.floor(Math.random() * 
                 (parseInt(ageRange.split('-')[1] || '70') - parseInt(ageRange.split('-')[0])));
      
      const countryOfOrigin = getRandomElement(countries);
      const languagesSpoken = getRandomElements(languages, 1, 3).join(', ');
      const culturalBackground = getRandomElement(culturalBackgrounds);
      const education = getRandomElement(educationLevels);
      const professionalField = getRandomElement(professionalFields);
      const communityAffiliations = getRandomElements(communitiesAffiliations, 1, 3).join(', ');
      const eventPreference = getRandomElement(eventPreferences);
      const collaborationStyle = getRandomElement(collaborationStyles);
      const personalValue = getRandomElements(personalValues, 2, 4);
      const digitalIdentity = getRandomElement(digitalIdentities);
      const activityLevel = getRandomElement(activityLevels);
      const culturalExperience = getRandomElements(culturalExperiences, 1, 2).join(', ');
      const learningStyle = getRandomElement(learningStyles);
      const occupation = getRandomElement(occupations);
      const location = getRandomElement(locations);
      
      // Select appropriate number of interests based on personality type
      // More outgoing personalities tend to have more diverse interests
      let interestCount;
      if (collaborationStyle.includes('Team') || digitalIdentity.includes('creator') || 
          activityLevel.includes('Very active')) {
        interestCount = Math.floor(Math.random() * 5) + 6; // 6-10 interests
      } else if (personalValue.includes('Learning') || personalValue.includes('Curiosity')) {
        interestCount = Math.floor(Math.random() * 6) + 5; // 5-10 interests
      } else {
        interestCount = Math.floor(Math.random() * 4) + 3; // 3-6 interests
      }
      
      // Make sure to randomize but with some coherence in interests 
      // (related interests are more likely to appear together)
      const userInterests = [];
      const interestCategories = [...new Set(dbInterests.map(int => int.category))];
      
      // First, select 1-3 interest categories that this user will focus on
      const focusCategories = getRandomElements(interestCategories, 1, 3);
      
      // Get interests from these focus categories (60% of interests)
      const focusCategoryInterests = dbInterests.filter(int => 
        focusCategories.includes(int.category));
      
      // Get remaining interests from any category
      const remainingInterests = dbInterests.filter(int => 
        !focusCategories.includes(int.category));
      
      // Select interests, weighted toward focus categories
      const focusInterestCount = Math.min(Math.ceil(interestCount * 0.6), focusCategoryInterests.length);
      const randomInterestCount = interestCount - focusInterestCount;
      
      // Add focus category interests
      userInterests.push(...getRandomElements(focusCategoryInterests, 
                                             Math.min(focusInterestCount, focusCategoryInterests.length),
                                             Math.min(focusInterestCount, focusCategoryInterests.length)));
      
      // Add random interests from other categories
      if (randomInterestCount > 0 && remainingInterests.length > 0) {
        userInterests.push(...getRandomElements(remainingInterests, 
                                              Math.min(randomInterestCount, remainingInterests.length),
                                              Math.min(randomInterestCount, remainingInterests.length)));
      }
      
      // If we still need more interests, just grab random ones
      if (userInterests.length < interestCount) {
        const additionalCount = interestCount - userInterests.length;
        const additionalInterests = getRandomElements(
          dbInterests.filter(int => !userInterests.includes(int)),
          Math.min(additionalCount, dbInterests.length - userInterests.length),
          Math.min(additionalCount, dbInterests.length - userInterests.length)
        );
        userInterests.push(...additionalInterests);
      }
      
      // Select retail preferences that align with interests and profile
      const userRetailPreferences = getRandomElements(retailPreferences, 3, 6);
      
      // Create an info object to generate a coherent bio
      const userInfo = {
        firstName,
        lastName,
        occupation,
        interests: userInterests.map(int => int.name),
        personalValues: personalValue,
        learningStyle,
        culturalBackground,
        digitalIdentity,
        collaborationStyle
      };
      
      // Create attribute importance based on user profile
      const attributeImportance = createAttributeImportance(userInfo);
      
      // Generate username
      const username = generateUsername(firstName, lastName);
      
      // Create a user object with detailed bio
      const user = {
        username,
        password: 'password123', // Standard password for all synthetic users
        displayName: `${firstName} ${lastName}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: generateDetailedBio(userInfo),
        age,
        occupation,
        location,
        gender,
        ageRange,
        countryOfOrigin,
        languagesSpoken,
        culturalBackground,
        education,
        professionalField,
        communityAffiliations,
        eventPreferences: eventPreference,
        collaborationStyle,
        personalValues: personalValue.join(', '),
        digitalIdentity,
        physicalActivityLevel: activityLevel,
        culturalExperiences: culturalExperience,
        learningStyle,
        identityPreferences: {
          attributeImportance
        },
        preferences: {
          interests: userInterests.map(int => int.name),
          retailPreferences: userRetailPreferences
        },
        interestIds: userInterests.map(int => int.id)
      };
      
      users.push(user);
      console.log(`Generated user ${i}/${count}: ${firstName} ${lastName} with ${userInterests.length} interests`);
    }
    
    // If in preview mode, just display sample users
    if (isPreviewMode) {
      // Display sample of generated users
      console.log('\n=== Sample Generated User Profiles (Preview Mode) ===');
      for (let i = 0; i < Math.min(3, users.length); i++) {
        const user = users[i];
        console.log(`\nUser ${i+1}/${Math.min(3, users.length)}:`);
        console.log(`- Username: ${user.username}`);
        console.log(`- Name: ${user.displayName}`);
        console.log(`- Age: ${user.age}`);
        console.log(`- Location: ${user.location}`);
        console.log(`- Occupation: ${user.occupation}`);
        console.log(`- Bio: ${user.bio.substring(0, 150)}...`);
        console.log(`- Interests: ${user.preferences.interests.slice(0, 5).join(', ')}${user.preferences.interests.length > 5 ? '...' : ''}`);
        console.log(`- Interests Count: ${user.interestIds.length}`);
      }
      
      console.log(`\nPreview of ${count} enriched synthetic users complete.`);
      console.log('To save these users, run this script without the --preview flag.');
    } else {
      // Save users to a file
      fs.writeFileSync(path.join(__dirname, 'enhanced-synthetic-users.json'), JSON.stringify(users, null, 2));
      console.log(`Generated ${count} enriched synthetic users and saved to enhanced-synthetic-users.json`);
      
      // Create a script to insert the users into the database
      const createUsersScript = `
      // This script will register the enriched users in the database
      import fs from 'fs';
      import path from 'path';
      import { fileURLToPath } from 'url';
      import axios from 'axios';
      import * as readline from 'readline';
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      // Create readline interface for user input
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      async function createEnhancedUsers() {
        try {
          const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'enhanced-synthetic-users.json'), 'utf8'));
          
          console.log(\`Preparing to create \${usersData.length} enriched users...\`);
          
          // Use promise for user confirmation
          const confirmation = await new Promise((resolve) => {
            rl.question('Do you want to proceed with adding these users to the database? (y/yes to continue): ', (answer) => {
              resolve(answer.trim().toLowerCase());
            });
          });
          
          if (confirmation !== 'y' && confirmation !== 'yes') {
            console.log('Operation cancelled by user');
            rl.close();
            return;
          }
          
          let successCount = 0;
          let failCount = 0;
          
          for (const userData of usersData) {
            const { interestIds, ...userToCreate } = userData;
            
            try {
              // Register the user
              console.log(\`Creating user: \${userData.username}...\`);
              const baseUrl = process.env.REPLIT_URL || 'http://localhost:3000';
              const registerResponse = await axios.post(\`\${baseUrl}/api/register\`, userToCreate);
              
              if (registerResponse.status === 201) {
                const newUser = registerResponse.data.user;
                console.log(\`Successfully created user \${newUser.username} with ID \${newUser.id}\`);
                successCount++;
                
                // Add interests to the user
                if (interestIds && interestIds.length > 0) {
                  let interestSuccessCount = 0;
                  for (const interestId of interestIds) {
                    try {
                      await axios.post(\`\${baseUrl}/api/users/\${newUser.id}/interests\`, { interestId });
                      interestSuccessCount++;
                    } catch (interestError) {
                      console.error(\`Failed to add interest \${interestId} to user \${newUser.username}: \${interestError.message}\`);
                    }
                  }
                  console.log(\`Added \${interestSuccessCount} interests to user \${newUser.username}\`);
                }
              }
            } catch (userError) {
              console.error(\`Failed to create user \${userData.username}: \${userError.message}\`);
              if (userError.response) {
                console.error(\`Response data: \${JSON.stringify(userError.response.data)}\`);
              }
              failCount++;
            }
          }
          
          console.log('User creation process completed!');
          console.log(\`Successfully created \${successCount} users, \${failCount} failures\`);
          rl.close();
        } catch (error) {
          console.error('Error creating users:', error.message);
          rl.close();
        }
      }
      
      createEnhancedUsers();
      `;
      
      fs.writeFileSync(path.join(__dirname, 'create-enhanced-users.js'), createUsersScript);
      console.log('Created create-enhanced-users.js script for inserting users into the database');
      
      console.log('Run the following command to install axios if not already installed:');
      console.log('npm install axios --save-dev');
      console.log('');
      console.log('Then run the enhanced users script:');
      console.log('node create-enhanced-users.js');
    }
    
    return { success: true, count, message: 'Successfully generated enriched user profiles' };
  } catch (error) {
    console.error('Error generating users:', error.message);
    return { success: false, error: error.message };
  }
}

// The preview mode is already checked inside the function

// Execute the function
generateEnrichedUsers(25).then(result => {
  if (result.success) {
    if (process.argv.includes('--preview')) {
      console.log('✓ PREVIEW MODE: ' + result.message);
      console.log('No users were saved to the database.');
    } else {
      console.log('✓ ' + result.message);
    }
  } else {
    console.error('✗ Failed to generate users: ' + result.error);
  }
});