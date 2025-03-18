// Script to import synthetic users from JSON file to routes.ts
import fs from "fs";
import path from "path";

// Read the synthetic users from JSON file
console.log("Reading synthetic users from JSON file...");
const usersJsonPath = path.join(process.cwd(), "synthetic-users.json");
const usersData = JSON.parse(fs.readFileSync(usersJsonPath, "utf8"));

console.log(`Found ${usersData.length} users in the JSON file.`);

// Read the routes.ts file
const routesFilePath = path.join(process.cwd(), "server", "routes.ts");
let routesContent = fs.readFileSync(routesFilePath, "utf8");

// Format the users array for insertion into routes.ts
const formattedUsers = usersData
  .map((user) => {
    // Format attributeImportance object if it exists in the identityPreferences
    let attributeImportanceStr = "";
    if (
      user.identityPreferences &&
      user.identityPreferences.attributeImportance
    ) {
      const attrImportance = user.identityPreferences.attributeImportance;
      attributeImportanceStr = `
    attributeImportance: {
      ${Object.entries(attrImportance)
        .map(([key, value]) => `${key}: ${value}`)
        .join(",\n      ")}
    },`;
    }

    // Convert personalValues to string format if it's an array
    let personalValues = user.personalValues;
    if (Array.isArray(personalValues)) {
      personalValues = personalValues.join(", ");
    }

    // Format interests array
    let interestsStr = "";
    if (user.interests && Array.isArray(user.interests)) {
      interestsStr = `
    interests: [${user.interests.map((interest) => `"${interest}"`).join(", ")}]`;
    }

    // Format the user object for routes.ts
    return `
  {
    username: "${user.username}",
    password: "${user.password || "password123"}",
    displayName: "${user.displayName}",
    bio: "${user.bio || ""}",
    avatar: "${user.avatar || ""}",
    age: ${user.age || 30},
    occupation: "${user.occupation || ""}",
    location: "${user.location || ""}",
    gender: "${user.gender || ""}",
    ageRange: "${user.ageRange || ""}",
    countryOfOrigin: "${user.countryOfOrigin || ""}",
    educationLevel: "${user.education || user.educationLevel || ""}",
    income: "${user.income || "Medium"}",
    politicalView: "${user.politicalView || "Moderate"}",
    culturalBackground: "${user.culturalBackground || ""}",
    sexualOrientation: "${user.sexualOrientation || ""}",
    relationshipStatus: "${user.relationshipStatus || ""}",
    familySize: ${user.familySize || 1},
    digitalLiteracy: "${user.digitalLiteracy || "Medium"}",
    ruralUrban: "${user.ruralUrban || "Urban"}",
    personalValues: "${personalValues}",${attributeImportanceStr}${interestsStr}
  }`;
  })
  .join(",");

// Create the new SYNTHETIC_USERS array content
const syntheticUsersArrayStr = `const SYNTHETIC_USERS = [${formattedUsers}
];`;

// Find the current SYNTHETIC_USERS declaration and replace it
const syntheticUsersRegex = /const SYNTHETIC_USERS = \[\s*\{[\s\S]*?\}\s*\];/;
const updatedRoutesContent = routesContent.replace(
  syntheticUsersRegex,
  syntheticUsersArrayStr,
);

// Write the updated content back to routes.ts
fs.writeFileSync(routesFilePath, updatedRoutesContent, "utf8");

console.log(
  `Successfully updated routes.ts with ${usersData.length} synthetic users.`,
);
