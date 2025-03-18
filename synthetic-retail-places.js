/**
 * Synthetic Retail and Places Generator Script
 * 
 * This script generates synthetic retail stores, places, and digital platforms
 * and links them to user preferences. All entities are clearly marked as synthetic/AI-generated.
 */

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./shared/schema');

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Synthetic retail categories
const RETAIL_CATEGORIES = [
  'SYNTHETIC_FASHION',
  'SYNTHETIC_ELECTRONICS',
  'SYNTHETIC_HOME_GOODS', 
  'SYNTHETIC_BEAUTY',
  'SYNTHETIC_SPORTS',
  'SYNTHETIC_BOOKS',
  'SYNTHETIC_TOYS',
  'SYNTHETIC_GROCERY',
  'SYNTHETIC_HEALTH',
  'SYNTHETIC_ECO_FRIENDLY'
];

// Synthetic store types
const STORE_TYPES = [
  'physical_store',
  'online_shop',
  'marketplace',
  'popup_store',
  'department_store',
  'boutique',
  'outlet'
];

// Generate a synthetic retail store name
function generateStoreName(category) {
  const categoryBase = category.replace('SYNTHETIC_', '');
  
  const prefixes = {
    'FASHION': ['SynthStyle', 'AIFashion', 'VirtualThreads', 'PixelWear', 'SimuStyle'],
    'ELECTRONICS': ['TechSim', 'AIGadgets', 'VirtualTech', 'SynthElectro', 'PixelGear'],
    'HOME_GOODS': ['SynthHome', 'AILiving', 'VirtualNest', 'PixelHouse', 'SimuDecor'],
    'BEAUTY': ['SynthBeauty', 'AIGlow', 'VirtualLooks', 'PixelGlam', 'SimuCosmetics'],
    'SPORTS': ['SynthSports', 'AIFitness', 'VirtualAthletic', 'PixelGym', 'SimuActive'],
    'BOOKS': ['SynthReads', 'AIBooks', 'VirtualLibrary', 'PixelPages', 'SimuLit'],
    'TOYS': ['SynthPlay', 'AIToys', 'VirtualFun', 'PixelGames', 'SimuJoy'],
    'GROCERY': ['SynthMart', 'AIFoods', 'VirtualMarket', 'PixelPantry', 'SimuGrocery'],
    'HEALTH': ['SynthHealth', 'AIWellness', 'VirtualCare', 'PixelVitality', 'SimuHealth'],
    'ECO_FRIENDLY': ['SynthGreen', 'AISustain', 'VirtualEco', 'PixelEarth', 'SimuNature']
  };
  
  const suffixes = ['Store', 'Market', 'Shop', 'Outlet', 'Emporium', 'Depot', 'Hub', 'Center', 'World', 'Place'];
  
  // Get a random prefix for the category
  const prefix = prefixes[categoryBase][Math.floor(Math.random() * prefixes[categoryBase].length)];
  
  // Sometimes add a suffix
  const shouldAddSuffix = Math.random() > 0.3;
  if (shouldAddSuffix) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix}`;
  }
  
  return prefix;
}

// Generate a description for a retail store
function generateStoreDescription(name, category, storeType) {
  const categoryBase = category.replace('SYNTHETIC_', '').replace('_', ' ').toLowerCase();
  const storeTypeFormatted = storeType.replace('_', ' ');
  
  const templates = [
    `${name} is a synthetic ${storeTypeFormatted} specializing in ${categoryBase} products. This is an AI-generated store for testing purposes and does not exist in the real world.`,
    `A simulated ${categoryBase} ${storeTypeFormatted} called ${name}. This is a fictional retail entity created for application testing.`,
    `${name} represents a computer-generated ${storeTypeFormatted} in the ${categoryBase} category. This synthetic store is used for demonstration purposes only.`,
    `An AI-created ${categoryBase} ${storeTypeFormatted} named ${name}. This retail entity doesn't exist in reality and is used for testing user preferences.`,
    `${name} - a synthetic ${storeTypeFormatted} offering ${categoryBase} products. This is a fictional store created for application testing and development.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Generate products for a store
function generateStoreProducts(category) {
  const categoryBase = category.replace('SYNTHETIC_', '');
  
  const productsByCategory = {
    'FASHION': ['AI-Generated Shirts', 'Synthetic Jeans', 'Virtual Dresses', 'Pixel Shoes', 'Simulated Accessories'],
    'ELECTRONICS': ['AI-Generated Phones', 'Synthetic Laptops', 'Virtual Headphones', 'Pixel Cameras', 'Simulated Speakers'],
    'HOME_GOODS': ['AI-Generated Furniture', 'Synthetic Kitchenware', 'Virtual Decor', 'Pixel Bedding', 'Simulated Lighting'],
    'BEAUTY': ['AI-Generated Makeup', 'Synthetic Skincare', 'Virtual Fragrances', 'Pixel Hair Products', 'Simulated Spa Items'],
    'SPORTS': ['AI-Generated Sportswear', 'Synthetic Equipment', 'Virtual Fitness Gear', 'Pixel Outdoor Gear', 'Simulated Training Tools'],
    'BOOKS': ['AI-Generated Fiction', 'Synthetic Non-Fiction', 'Virtual Textbooks', 'Pixel Comics', 'Simulated Journals'],
    'TOYS': ['AI-Generated Action Figures', 'Synthetic Board Games', 'Virtual Educational Toys', 'Pixel Collectibles', 'Simulated Outdoor Toys'],
    'GROCERY': ['AI-Generated Pantry Items', 'Synthetic Produce', 'Virtual Snacks', 'Pixel Beverages', 'Simulated Prepared Foods'],
    'HEALTH': ['AI-Generated Vitamins', 'Synthetic Supplements', 'Virtual Fitness Products', 'Pixel Wellness Items', 'Simulated Health Foods'],
    'ECO_FRIENDLY': ['AI-Generated Sustainable Products', 'Synthetic Eco Goods', 'Virtual Green Living Items', 'Pixel Earth-Friendly Products', 'Simulated Recycled Goods']
  };
  
  // Select 3-5 random products from the category
  const products = productsByCategory[categoryBase];
  const numProducts = Math.floor(Math.random() * 3) + 3; // 3-5 products
  const selectedProducts = [];
  
  for (let i = 0; i < numProducts; i++) {
    const randomIndex = Math.floor(Math.random() * products.length);
    selectedProducts.push(products[randomIndex]);
    // Remove the selected product to avoid duplicates
    products.splice(randomIndex, 1);
    
    // Break if we've used all available products
    if (products.length === 0) break;
  }
  
  return selectedProducts;
}

// Create data structure for synthetic retail stores
async function generateSyntheticRetailData() {
  console.log('Generating synthetic retail store data...');
  
  const retailStores = [];
  
  // For each retail category, create 2-3 stores
  for (const category of RETAIL_CATEGORIES) {
    const numStores = Math.floor(Math.random() * 2) + 2; // 2-3 stores per category
    
    for (let i = 0; i < numStores; i++) {
      const storeType = STORE_TYPES[Math.floor(Math.random() * STORE_TYPES.length)];
      const name = generateStoreName(category);
      const description = generateStoreDescription(name, category, storeType);
      const products = generateStoreProducts(category);
      
      retailStores.push({
        name,
        category,
        type: storeType,
        description,
        products,
        isAiGenerated: true
      });
    }
  }
  
  console.log(`Generated ${retailStores.length} synthetic retail stores`);
  return retailStores;
}

// Update user preferences with synthetic retail preferences
async function updateUserPreferences() {
  console.log('Starting update of user retail preferences...');
  
  try {
    // Get all users
    const allUsers = await db.select().from(schema.users);
    
    if (allUsers.length === 0) {
      console.log('No users found in the database. Please create users first.');
      return [];
    }
    
    console.log(`Found ${allUsers.length} users. Updating with synthetic retail preferences...`);
    
    // Generate synthetic retail data
    const retailStores = await generateSyntheticRetailData();
    
    // Extract just the retail categories for preferences
    const retailCategories = RETAIL_CATEGORIES.map(category => {
      // Convert from SYNTHETIC_CATEGORY to Display Category
      return category.replace('SYNTHETIC_', '').replace('_', ' ');
    });
    
    const updatedUsers = [];
    
    // For each user, assign 2-4 random retail preferences
    for (const user of allUsers) {
      try {
        // Get current preferences or initialize empty
        const currentPreferences = user.preferences || { interests: [], retailPreferences: [] };
        
        // Determine how many retail preferences to assign (2-4)
        const numPreferences = Math.floor(Math.random() * 3) + 2;
        
        // Assign random retail preferences
        const retailPreferences = [];
        for (let i = 0; i < numPreferences; i++) {
          const randomIndex = Math.floor(Math.random() * retailCategories.length);
          const preference = retailCategories[randomIndex];
          
          // Only add if not already in the list
          if (!retailPreferences.includes(preference)) {
            retailPreferences.push(preference);
          }
          
          // If we've exhausted all categories, break
          if (retailPreferences.length >= Math.min(numPreferences, retailCategories.length)) {
            break;
          }
        }
        
        // Update user preferences
        const newPreferences = {
          interests: currentPreferences.interests || [],
          retailPreferences: retailPreferences
        };
        
        // Update in database
        const [updatedUser] = await db
          .update(schema.users)
          .set({ preferences: newPreferences })
          .where(db.eq(schema.users.id, user.id))
          .returning();
        
        updatedUsers.push(updatedUser);
        console.log(`Updated user ${user.username} with retail preferences: ${retailPreferences.join(', ')}`);
      } catch (error) {
        console.error(`Error updating preferences for user ${user.username}:`, error);
      }
    }
    
    return { updatedUsers, retailStores };
  } catch (error) {
    console.error('Error in updating user preferences:', error);
    throw error;
  }
}

// Execute the function
updateUserPreferences()
  .then((result) => {
    console.log('User retail preference update complete!');
    console.log(`Updated ${result.updatedUsers.length} users with synthetic retail preferences`);
    console.log(`Generated ${result.retailStores.length} synthetic retail stores for reference`);
    
    // Save retail stores data to a file for reference
    const fs = require('fs');
    fs.writeFileSync('synthetic-retail-data.json', JSON.stringify(result.retailStores, null, 2));
    console.log('Saved retail store data to synthetic-retail-data.json');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to update user retail preferences:', error);
    process.exit(1);
  });