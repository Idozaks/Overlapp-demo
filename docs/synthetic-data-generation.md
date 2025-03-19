# Synthetic Data Generation System

This documentation explains the comprehensive data generation system for creating realistic test data for the platform. The system generates entities, locations, retail places, and enhanced user profiles while maintaining data integrity.

## Overview

The data generation system creates:

1. **Enhanced User Profiles** - Realistic user profiles with diverse attributes, interests, and preferences
2. **Digital & Physical Entities** - Businesses, stores, and organizations 
3. **Location Posts** - User posts with geographic location data
4. **Retail Places** - Shopping and commercial venues with user preference connections

## Commands

### Generate All Data (with Preview)

To preview generated data without saving to the database:

```bash
npx tsx generate-all-data.js --preview
```

This will:
- Show sample data for all components
- Display detailed sample user profiles
- Show sample entities, locations, and retail places
- **Not write anything to the database**

### Generate All Data (Production)

To generate data and save to the database (requires confirmation):

```bash
npx tsx generate-all-data.js
```

### Generate Only Enhanced Users

To generate only user profiles:

```bash
npx tsx enhanced-generate-users.js
```

Add `--preview` flag to preview only.

## Data Types

### Enhanced User Profiles

Each generated user includes:
- Personal attributes (name, age, location, occupation)
- Cultural background and languages spoken
- Educational and professional background
- Personal values and identity preferences
- Interests pulled directly from the database
- Digital identity and collaboration style
- Weighted attribute importance for identity matching

### Entity Generation

Entities represent digital and physical places:
- Retail stores and shopping venues
- Online platforms and websites
- Educational institutions
- Entertainment venues
- Healthcare facilities

### Location Posts

Simulates user posts with location data:
- Travel destinations
- Dining experiences 
- Event venues
- Geographic coordinates
- Post content related to location

### Retail Places

Specialized entities focused on shopping:
- Retail stores by category
- User retail preferences
- Product offerings
- Store descriptions

## Database Integration

The system:
1. Fetches existing interests from the database
2. Creates user profiles with connected interests
3. Respects database constraints
4. Uses the same schema as production data

## Preview Mode

Preview mode is available in all scripts by adding the `--preview` flag. This enables:
- Viewing sample data without database writes
- Displaying a subset of generated data
- Seeing realistic output formats
- Testing data generation logic safely

## User Import Process

After generating enhanced user profiles:
1. A JSON file is saved with all user data
2. The create-enhanced-users.js script is created
3. Run that script to import users to the database
4. User interests are automatically connected

## Data Integrity

All generated data:
- Uses realistic values without synthetic markers
- Creates coherent profiles with sensible attributes
- Makes meaningful connections between data types
- Is indistinguishable from real user data