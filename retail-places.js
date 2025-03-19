/**
 * Retail and Places Generator Script
 * 
 * This script generates retail stores, places, and digital platforms
 * and links them to user preferences. These entities represent diverse
 * businesses for testing the platform's overlap analysis features.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import * as schema from './shared/schema.ts';
import fs from 'fs';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Retail categories
const RETAIL_CATEGORIES = [
  'FASHION',
  'ELECTRONICS',
  'HOME_GOODS', 
  'BEAUTY',
  'SPORTS',
  'BOOKS',
  'TOYS',
  'GROCERY',
  'HEALTH',
  'ECO_FRIENDLY'
];

// Store types
const STORE_TYPES = [
  'physical_store',
  'online_shop',
  'marketplace',
  'popup_store',
  'department_store',
  'boutique',
  'outlet'
];

// Generate a realistic retail store name
function generateStoreName(category) {
  const prefixes = {
    'FASHION': ['Urban', 'Metro', 'Elite', 'Velvet', 'Lux', 'Classic', 'Trendy', 'Refined', 'Chic', 'Sleek'],
    'ELECTRONICS': ['Future', 'Tech', 'Digital', 'Circuit', 'Nova', 'Pulse', 'Smart', 'Quantum', 'Byte', 'Wave'],
    'HOME_GOODS': ['Comfort', 'Hearth', 'Nest', 'Harmony', 'Haven', 'Oasis', 'Cozy', 'Modern', 'Living', 'Elegant'],
    'BEAUTY': ['Glow', 'Radiance', 'Pure', 'Allure', 'Charm', 'Essence', 'Gleam', 'Bloom', 'Serene', 'Luxe'],
    'SPORTS': ['Active', 'Peak', 'Summit', 'Velocity', 'Endure', 'Fitness', 'Element', 'Apex', 'Vigor', 'Dynamic'],
    'BOOKS': ['Chapter', 'Page', 'Story', 'Novel', 'Literary', 'Saga', 'Tome', 'Narrative', 'Bookish', 'Reader'],
    'TOYS': ['Wonder', 'Playful', 'Joy', 'Imagine', 'Delight', 'Magic', 'Discovery', 'Whimsy', 'Adventure', 'Create'],
    'GROCERY': ['Fresh', 'Market', 'Harvest', 'Pantry', 'Basket', 'Garden', 'Orchard', 'Bounty', 'Culinary', 'Select'],
    'HEALTH': ['Vital', 'Wellness', 'Balance', 'Nourish', 'Thrive', 'Renew', 'Revive', 'Flourish', 'Optimal', 'Core'],
    'ECO_FRIENDLY': ['Green', 'Sustain', 'Earth', 'Nature', 'Eco', 'Terra', 'Verdant', 'Organic', 'Planet', 'Pure']
  };
  
  const suffixes = ['Store', 'Market', 'Shop', 'Outlet', 'Emporium', 'Depot', 'Hub', 'Center', 'World', 'Place', 'Co.', 'Collective', '& Co', 'Studio'];
  
  // Get a random prefix for the category
  const prefix = prefixes[category][Math.floor(Math.random() * prefixes[category].length)];
  
  // Sometimes add a suffix
  const shouldAddSuffix = Math.random() > 0.3;
  if (shouldAddSuffix) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix}`;
  }
  
  return prefix;
}

// Generate a realistic description for a retail store
function generateStoreDescription(name, category, storeType) {
  const categoryBase = category.replace('_', ' ').toLowerCase();
  const storeTypeFormatted = storeType.replace('_', ' ');
  
  const templates = [
    `${name} is a premier ${storeTypeFormatted} specializing in high-quality ${categoryBase} products, offering exceptional customer service and a curated selection.`,
    `Discover the unique shopping experience at ${name}, a ${categoryBase} ${storeTypeFormatted} dedicated to bringing you the finest products and personalized service.`,
    `${name} brings a fresh perspective to the ${categoryBase} market as a distinctive ${storeTypeFormatted} featuring thoughtfully selected items for discerning customers.`,
    `Welcome to ${name}, where passion for ${categoryBase} meets exceptional retail experience in our carefully designed ${storeTypeFormatted}.`,
    `At ${name}, we've reimagined what a ${categoryBase} ${storeTypeFormatted} can be, focusing on quality, sustainability, and customer satisfaction.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Generate realistic products for a store
function generateStoreProducts(category) {
  const productsByCategory = {
    'FASHION': ['Premium Cotton Shirts', 'Designer Jeans', 'Seasonal Dresses', 'Handcrafted Shoes', 'Statement Accessories'],
    'ELECTRONICS': ['Smartphones', 'Ultrabook Laptops', 'Wireless Headphones', 'Digital Cameras', 'Smart Home Speakers'],
    'HOME_GOODS': ['Artisan Furniture', 'Gourmet Kitchenware', 'Stylish Home Decor', 'Luxury Bedding', 'Designer Lighting'],
    'BEAUTY': ['Premium Cosmetics', 'Organic Skincare', 'Signature Fragrances', 'Professional Hair Products', 'Spa Essentials'],
    'SPORTS': ['Performance Activewear', 'Professional Equipment', 'Fitness Accessories', 'Outdoor Gear', 'Training Supplements'],
    'BOOKS': ['Bestselling Fiction', 'Reference Works', 'Educational Resources', 'Graphic Novels', 'Journals & Planners'],
    'TOYS': ['Collectible Figures', 'Strategy Board Games', 'Educational Toys', 'Limited Edition Collectibles', 'Outdoor Play Equipment'],
    'GROCERY': ['Gourmet Pantry Items', 'Organic Produce', 'Artisanal Snacks', 'Craft Beverages', 'Ready-to-Serve Meals'],
    'HEALTH': ['Natural Vitamins', 'Performance Supplements', 'Fitness Equipment', 'Wellness Accessories', 'Organic Health Foods'],
    'ECO_FRIENDLY': ['Sustainable Home Products', 'Eco-Conscious Fashion', 'Zero-Waste Essentials', 'Recycled Decor Items', 'Renewable Energy Gadgets']
  };
  
  // Select 3-5 random products from the category
  const products = [...productsByCategory[category]]; // Create a copy of the array
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

// Create data structure for retail stores
async function generateRetailData() {
  console.log('Generating retail store data...');
  
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
        products
      });
    }
  }
  
  console.log(`Generated ${retailStores.length} retail stores`);
  return retailStores;
}

// Update user preferences with retail preferences
async function updateUserPreferences() {
  console.log('Starting update of user retail preferences...');
  
  try {
    // Get all users
    const allUsers = await db.select().from(schema.users);
    
    if (allUsers.length === 0) {
      console.log('No users found in the database. Please create users first.');
      return [];
    }
    
    console.log(`Found ${allUsers.length} users. Updating with retail preferences...`);
    
    // Generate retail data
    const retailStores = await generateRetailData();
    
    // Extract just the retail categories for preferences
    const retailCategories = RETAIL_CATEGORIES.map(category => {
      // Convert from CATEGORY to display format
      return category.replace('_', ' ');
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
          .where(eq(schema.users.id, user.id))
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

// Check if we're in preview mode
const isPreviewMode = process.argv.includes('--preview');

if (isPreviewMode) {
  // Preview mode - don't save to database
  console.log('PREVIEW MODE: Generating sample retail data without saving to database');
  
  // Generate some sample retail stores
  const sampleStores = [];
  
  // For each retail category, create a sample store
  for (const category of RETAIL_CATEGORIES) {
    const storeType = STORE_TYPES[Math.floor(Math.random() * STORE_TYPES.length)];
    const name = generateStoreName(category);
    const description = generateStoreDescription(name, category, storeType);
    const products = generateStoreProducts(category);
    
    sampleStores.push({
      name,
      category,
      type: storeType,
      description,
      products
    });
    
    console.log(`[PREVIEW] Retail Store: ${name} (${category})`);
    console.log(`  Type: ${storeType}`);
    console.log(`  Description: ${description}`);
    console.log(`  Products: ${products.join(', ')}`);
    console.log('');
  }
  
  // Sample user preferences
  const sampleUsers = [
    { id: 1, username: 'user1', preferences: { interests: ['Music', 'Art'] } },
    { id: 2, username: 'user2', preferences: { interests: ['Technology', 'Travel'] } },
    { id: 3, username: 'user3', preferences: { interests: ['Food', 'Sports'] } }
  ];
  
  // For each sample user, assign retail preferences
  for (const user of sampleUsers) {
    // Determine how many retail preferences to assign (2-3)
    const numPreferences = Math.floor(Math.random() * 2) + 2;
    
    // Extract categories for preferences
    const retailCategories = RETAIL_CATEGORIES.map(category => 
      category.replace('_', ' ')
    );
    
    // Assign random retail preferences
    const retailPreferences = [];
    for (let i = 0; i < numPreferences; i++) {
      const randomIndex = Math.floor(Math.random() * retailCategories.length);
      const preference = retailCategories[randomIndex];
      
      // Only add if not already in the list
      if (!retailPreferences.includes(preference)) {
        retailPreferences.push(preference);
      }
    }
    
    console.log(`[PREVIEW] User ${user.username} (ID: ${user.id}):`);
    console.log(`  Current interests: ${user.preferences.interests.join(', ')}`);
    console.log(`  Would add retail preferences: ${retailPreferences.join(', ')}`);
    console.log('');
  }
  
  console.log(`[PREVIEW] Would generate ${sampleStores.length} retail stores`);
  console.log('[PREVIEW] Would update user preferences (not saved)');
  
  // In preview mode, still save sample data to file for reference
  fs.writeFileSync('retail-data-preview.json', JSON.stringify(sampleStores, null, 2));
  console.log('Saved preview retail store data to retail-data-preview.json');
  
  process.exit(0);
} else {
  // Normal mode - save to database
  // Execute the function
  updateUserPreferences()
    .then((result) => {
      console.log('User retail preference update complete!');
      console.log(`Updated ${result.updatedUsers.length} users with retail preferences`);
      console.log(`Generated ${result.retailStores.length} retail stores for reference`);
      
      // Save retail stores data to a file for reference
      fs.writeFileSync('retail-data.json', JSON.stringify(result.retailStores, null, 2));
      console.log('Saved retail store data to retail-data.json');
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to update user retail preferences:', error);
      process.exit(1);
    });
}