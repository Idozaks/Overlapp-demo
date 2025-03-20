/**
 * Synthetic User Generator Script
 * 
 * This script generates 20 unique users with diverse profiles
 * and connects them to interests available in the database
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define lists of possible values for different user attributes
const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const ageRanges = ['18-25', '26-35', '36-45', '46+'];
const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Japan', 'India', 'Brazil', 'South Africa', 'France', 'China', 'Mexico'];
const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Arabic', 'Hindi', 'Russian'];
const culturalBackgrounds = ['Western', 'Asian', 'African', 'Middle Eastern', 'Hispanic/Latino', 'South Asian', 'East Asian', 'Multicultural', 'European', 'Pacific Islander'];
const educationLevels = ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other', 'Vocational Training', 'Self-taught'];
const professionalFields = ['Technology', 'Healthcare', 'Education', 'Finance', 'Arts', 'Science', 'Engineering', 'Marketing', 'Law', 'Hospitality', 'Retail', 'Construction', 'Agriculture'];
const communitiesAffiliations = ['Professional networks', 'Alumni associations', 'Religious groups', 'Hobby clubs', 'Volunteer organizations', 'Sports teams', 'Online communities', 'Neighborhood associations', 'Cultural groups'];
const eventPreferences = ['In-person', 'Virtual', 'Small groups', 'Large conferences', 'Workshops', 'Networking events', 'Casual meetups', 'Structured sessions'];
const collaborationStyles = ['Solo worker', 'Team player', 'Leader', 'Mentor', 'Collaborator', 'Remote worker', 'Hybrid worker', 'Flexible'];
const personalValues = ['Family', 'Career growth', 'Creativity', 'Learning', 'Community', 'Independence', 'Tradition', 'Innovation', 'Sustainability', 'Wellness', 'Social justice', 'Discipline', 'Adventure'];
const digitalIdentities = ['Early adopter', 'Content creator', 'Social media influencer', 'Digital minimalist', 'Tech enthusiast', 'Digital privacy advocate', 'Gamer', 'Casual user', 'Developer', 'Designer'];
const activityLevels = ['Very active', 'Moderately active', 'Occasionally active', 'Mostly sedentary', 'Mix of active and relaxed lifestyles'];
const culturalExperiences = ['Well-traveled', 'Local expert', 'Cultural enthusiast', 'Internationally experienced', 'Festival participant', 'Cultural preservationist', 'Foodie explorer', 'Multicultural background', 'Language learner'];
const learningStyles = ['Self-taught', 'Formal education', 'Hands-on learner', 'Visual learner', 'Auditory learner', 'Social learner', 'Independent learner', 'Continuous learner', 'Project-based learner'];
const occupations = ['Software Engineer', 'Teacher', 'Doctor', 'Artist', 'Marketing Manager', 'Student', 'Entrepreneur', 'Designer', 'Writer', 'Researcher', 'Chef', 'Lawyer', 'Consultant', 'Photographer', 'Nurse', 'Architect', 'Musician', 'Data Scientist', 'Filmmaker', 'Fitness Instructor'];
const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Sydney, Australia', 'Paris, France', 'Toronto, Canada', 'Mumbai, India', 'São Paulo, Brazil', 'Cape Town, South Africa', 'Dubai, UAE', 'Seoul, South Korea', 'Mexico City, Mexico', 'Singapore', 'Barcelona, Spain'];

// List of interests from our database
const interests = [
  { id: 1, name: 'Fashion', category: 'HOBBY' },
  { id: 2, name: 'Art', category: 'HOBBY' },
  { id: 3, name: 'Travel', category: 'HOBBY' },
  { id: 4, name: 'Fitness', category: 'HOBBY' },
  { id: 5, name: 'Books', category: 'HOBBY' },
  { id: 36, name: 'Book Clubs', category: 'Literature' },
  { id: 37, name: 'Non-fiction Books', category: 'Literature' },
  { id: 38, name: 'Fiction Novels', category: 'Literature' },
  { id: 39, name: 'Memoirs', category: 'Literature' },
  { id: 40, name: 'Cultural Immersion', category: 'Travel' },
  { id: 41, name: 'Digital Innovation', category: 'Technology & Digital' },
  { id: 42, name: 'Blockchain', category: 'Technology & Digital' },
  { id: 43, name: 'AI & Machine Learning', category: 'Technology & Digital' },
  { id: 44, name: 'Cybersecurity', category: 'Technology & Digital' },
  { id: 45, name: 'Mindful Living', category: 'Lifestyle & Wellness' },
  { id: 46, name: 'Fitness Tech', category: 'Lifestyle & Wellness' },
  { id: 47, name: 'Digital Wellness', category: 'Lifestyle & Wellness' },
  { id: 48, name: 'Smart Home', category: 'Lifestyle & Wellness' },
  { id: 49, name: 'Digital Art', category: 'Arts & Culture' },
  { id: 50, name: 'NFT Creation', category: 'Arts & Culture' },
  { id: 51, name: 'Virtual Museums', category: 'Arts & Culture' },
  { id: 52, name: 'Digital Photography', category: 'Arts & Culture' },
  { id: 53, name: 'Remote Work', category: 'Professional Development' },
  { id: 54, name: 'Digital Marketing', category: 'Professional Development' },
  { id: 55, name: 'Data Analytics', category: 'Professional Development' },
  { id: 56, name: 'Tech Leadership', category: 'Professional Development' },
  { id: 57, name: 'Digital Inclusion', category: 'Social Impact' },
  { id: 58, name: 'Green Tech', category: 'Social Impact' },
  { id: 59, name: 'Tech Ethics', category: 'Social Impact' },
  { id: 60, name: 'Digital Education', category: 'Social Impact' },
  { id: 61, name: 'Graphic Design', category: 'Design' },
  { id: 62, name: 'Language Learning', category: 'Education' },
  { id: 63, name: 'Woodworking', category: 'Hobby' },
  { id: 64, name: 'Privacy in Technology', category: 'Technology' },
  { id: 65, name: 'Online Writing Communities', category: 'Literature' },
  { id: 66, name: '3D Modeling', category: 'Design' },
  { id: 67, name: 'Renewable Energy', category: 'Science' },
  { id: 68, name: 'SEO Strategies', category: 'Marketing' },
  { id: 69, name: 'Culinary Exploration', category: 'Culinary' },
  { id: 70, name: 'Crypto Art', category: 'Digital Art' },
  { id: 71, name: 'Music', category: 'HOBBY' },
  { id: 72, name: 'Singing', category: 'HOBBY' },
  { id: 73, name: 'Music Video', category: 'Creative Content' },
  { id: 74, name: 'Dancing', category: 'Hobby' },
  { id: 75, name: 'Choreography', category: 'Dance' },
  { id: 76, name: 'Music production', category: 'Music' },
  { id: 77, name: 'Zumba classes', category: 'Fitness' },
  { id: 78, name: 'Karaoke nights', category: 'Music' },
  { id: 79, name: 'Furniture Making', category: 'Craftsmanship' },
  { id: 80, name: 'Literary Fiction Books', category: 'Literature' },
  { id: 81, name: '3D Printing', category: 'Technology' },
  { id: 82, name: 'Art & Design', category: 'CREATIVE' },
  { id: 83, name: 'Technology', category: 'TECH' },
  { id: 84, name: 'Healthcare', category: 'PROFESSIONAL' },
  { id: 85, name: 'Education', category: 'PROFESSIONAL' },
  { id: 86, name: 'Business', category: 'PROFESSIONAL' },
  { id: 87, name: 'Reading Challenges', category: 'Education' },
  { id: 88, name: 'Network Security', category: 'Technology' },
  { id: 89, name: 'Storyboarding', category: 'Fine Arts' },
  { id: 90, name: 'Animation', category: 'Fine Arts' },
  { id: 91, name: 'Character Design', category: 'Fine Arts' },
  { id: 92, name: 'Graphic Design Software', category: 'Technology' },
  { id: 93, name: 'Illustration Techniques', category: 'Fine Arts' }
];

// Retail preferences from the application
const retailPreferences = [
  'Electronics', 'Clothing', 'Home Goods', 'Books', 'Sports Equipment', 
  'Beauty Products', 'Health Foods', 'Jewelry', 'Art Supplies', 'Office Supplies',
  'Specialty Foods', 'Eco-Friendly Products', 'Luxury Items', 'Handcrafted Goods', 'Digital Products'
];

// Helper functions
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

function generateUsername(firstName, lastName) {
  const random = Math.floor(Math.random() * 1000);
  return (firstName + lastName + random).toLowerCase();
}

function generateBio(interests, occupation, personalValues) {
  const intros = [
    "Passionate about",
    "Enthusiastic",
    "Dedicated",
    "Exploring the world of",
    "Focused on",
    "Inspired by",
    "Committed to"
  ];

  const middles = [
    "with a background in",
    "while working as a",
    "combining expertise in",
    "and professionally involved with",
    "with professional experience in"
  ];

  const endings = [
    "Believing in the importance of",
    "Striving for",
    "Valuing",
    "Always pursuing",
    "Guided by principles of"
  ];

  const selectedInterests = getRandomElements(interests, 1, 2).map(i => i.name);
  const selectedValues = getRandomElements(personalValues, 1, 2);

  return `${getRandomElement(intros)} ${selectedInterests.join(' and ')} ${getRandomElement(middles)} ${occupation}. ${getRandomElement(endings)} ${selectedValues.join(' and ')}.`;
}

// Generate 20 unique synthetic users
const users = [];

for (let i = 1; i <= 20; i++) {
  // Generate first and last name with diverse cultural backgrounds
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Jamie', 'Morgan', 'Riley', 'Casey', 'Avery', 'Quinn', 'Skyler', 'Dakota', 'Reese', 'Parker', 'Hayden', 'Finley', 'Kai', 'Zephyr', 'Sage', 'Nova', 'Blake'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);

  // Select random attributes
  const gender = getRandomElement(genders);
  const ageRange = getRandomElement(ageRanges);
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

  // Select random interests
  const userInterests = getRandomElements(interests, 3, 10);
  const interestNames = userInterests.map(interest => interest.name);

  // Select retail preferences
  const userRetailPreferences = getRandomElements(retailPreferences, 2, 5);

  // Create identity preferences with randomized importance
  const identityAttributes = [
    'gender', 'ageRange', 'countryOfOrigin', 'languagesSpoken', 'culturalBackground',
    'education', 'professionalField', 'communityAffiliations', 'eventPreferences',
    'collaborationStyle', 'personalValues', 'digitalIdentity', 'physicalActivityLevel',
    'culturalExperiences', 'learningStyle'
  ];

  const attributeImportance = {};
  identityAttributes.forEach(attr => {
    attributeImportance[attr] = Math.floor(Math.random() * 10) + 1; // 1-10 importance scale
  });

  // Create a user object
  const username = generateUsername(firstName, lastName);
  const user = {
    username,
    password: 'password123', // Standard password for all synthetic users
    displayName: `${firstName} ${lastName}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    bio: generateBio(userInterests, occupation, personalValue),
    age: Math.floor(Math.random() * 50) + 18, // Random age 18-68
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
      interests: interestNames,
      retailPreferences: userRetailPreferences
    },
    interestIds: userInterests.map(interest => interest.id)
  };

  users.push(user);
}

// Let's save our users to a file
fs.writeFileSync(path.join(__dirname, 'synthetic-users.json'), JSON.stringify(users, null, 2));
console.log('Generated 20 synthetic users and saved to synthetic-users.json');

// Create a script to insert the users into the database
const createUsersScript = `
// This script will register the users in the database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createUsers() {
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'synthetic-users.json'), 'utf8'));

    console.log(\`Preparing to create \${usersData.length} users...\`);

    for (const userData of usersData) {
      const { interestIds, ...userToCreate } = userData;

      try {
        // Register the user
        console.log(\`Creating user: \${userData.username}...\`);
        const registerResponse = await axios.post('http://localhost:3000/api/register', userToCreate);

        if (registerResponse.status === 201) {
          const newUser = registerResponse.data.user;
          console.log(\`Successfully created user \${newUser.username} with ID \${newUser.id}\`);

          // Add interests to the user
          if (interestIds && interestIds.length > 0) {
            for (const interestId of interestIds) {
              try {
                await axios.post(\`http://localhost:3000/api/users/\${newUser.id}/interests\`, { interestId });
                console.log(\`Added interest ID \${interestId} to user \${newUser.username}\`);
              } catch (interestError) {
                console.error(\`Failed to add interest \${interestId} to user \${newUser.username}: \${interestError.message}\`);
              }
            }
          }
        }
      } catch (userError) {
        console.error(\`Failed to create user \${userData.username}: \${userError.message}\`);
        if (userError.response) {
          console.error(\`Response data: \${JSON.stringify(userError.response.data)}\`);
        }
      }
    }

    console.log('User creation process completed!');
  } catch (error) {
    console.error('Error creating users:', error.message);
  }
}

createUsers();
`;

fs.writeFileSync(path.join(__dirname, 'create-users.js'), createUsersScript);
console.log('Created create-users.js script for inserting users into the database');

console.log('Run the following command to install axios if not already installed:');
console.log('npm install axios --save-dev');
console.log('');
console.log('Then run the create-users.js script:');
console.log('node create-users.js');