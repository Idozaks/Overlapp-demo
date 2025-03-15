// Script to modify server/routes.ts temporarily to use our synthetic users for debug
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load our synthetic users
const syntheticUsers = JSON.parse(fs.readFileSync(path.join(__dirname, 'synthetic-users.json'), 'utf8'));

// Create a variable declaration in format for SYNTHETIC_USERS array
let syntheticUsersCode = 'const SYNTHETIC_USERS = [\n';
syntheticUsers.forEach((user, index) => {
  syntheticUsersCode += `  {
    username: "${user.username}",
    password: "${user.password}",
    displayName: "${user.displayName}",
    bio: "${user.bio.replace(/"/g, '\\"')}",
    avatar: "${user.avatar}",
    age: ${user.age},
    occupation: "${user.occupation}",
    location: "${user.location}",
    gender: "${user.gender}",
    ageRange: "${user.ageRange}",
    countryOfOrigin: "${user.countryOfOrigin}",
    languagesSpoken: "${user.languagesSpoken}",
    culturalBackground: "${user.culturalBackground}",
    education: "${user.education}",
    professionalField: "${user.professionalField}",
    communityAffiliations: "${user.communityAffiliations}",
    eventPreferences: "${user.eventPreferences}",
    collaborationStyle: "${user.collaborationStyle}",
    personalValues: "${user.personalValues}",
    digitalIdentity: "${user.digitalIdentity}",
    physicalActivityLevel: "${user.physicalActivityLevel}",
    culturalExperiences: "${user.culturalExperiences}",
    learningStyle: "${user.learningStyle}",
    identityPreferences: ${JSON.stringify(user.identityPreferences)},
    preferences: ${JSON.stringify(user.preferences)}
  }${index < syntheticUsers.length - 1 ? ',' : ''}
`;
});
syntheticUsersCode += '];\n';

console.log('Created SYNTHETIC_USERS array code');
console.log('---');
console.log('Instructions:');
console.log('1. Copy this code and replace the SYNTHETIC_USERS array in server/routes.ts');
console.log('2. Then use the /api/debug/generate-users endpoint to create the users');
console.log('3. After users are created, revert the changes to routes.ts');
console.log('---');
console.log(syntheticUsersCode);