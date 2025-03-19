/**
 * Retail and Places Generator Script
 * 
 * This script generates retail stores, places, and digital platforms
 * and links them to user preferences. These entities represent diverse
 * businesses for testing the platform's overlap analysis features.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './server/db.js';

dotenv.config();

// Get current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Retail categories
const RETAIL_CATEGORIES = [
  'CLOTHING', 
  'ELECTRONICS',
  'HOME_GOODS',
  'GROCERY',
  'BEAUTY',
  'SPORTING_GOODS',
  'BOOKSTORE',
  'TOY_STORE',
  'FURNITURE',
  'JEWELRY',
  'FOOTWEAR',
  'HEALTH',
  'SPECIALTY_FOOD',
  'PET_SUPPLIES',
  'DEPARTMENT_STORE',
  'HOBBY',
  'HARDWARE',
  'GARDEN',
  'OFFICE_SUPPLIES',
  'AUTOMOTIVE'
];

// Store types
const STORE_TYPES = {
  PHYSICAL: 'PHYSICAL',
  ONLINE: 'DIGITAL',
  HYBRID: 'HYBRID'
};

// Generate a store name based on the category
function generateStoreName(category) {
  const prefixes = {
    CLOTHING: ['Fashion', 'Trend', 'Style', 'Chic', 'Urban', 'Elite', 'Classic', 'Luxe'],
    ELECTRONICS: ['Tech', 'Digital', 'Circuit', 'Smart', 'Electron', 'Gadget', 'Innovation', 'Cyber'],
    HOME_GOODS: ['Home', 'Living', 'Comfort', 'Nest', 'Domestic', 'Dwelling', 'Interior', 'Habitat'],
    GROCERY: ['Fresh', 'Market', 'Pantry', 'Harvest', 'Gourmet', 'Organic', 'Green', 'Farm'],
    BEAUTY: ['Glow', 'Radiance', 'Beauty', 'Glamour', 'Elegance', 'Allure', 'Charm', 'Luxe'],
    SPORTING_GOODS: ['Active', 'Sport', 'Athletic', 'Fitness', 'Champion', 'Victory', 'Elite', 'Pro'],
    BOOKSTORE: ['Page', 'Read', 'Book', 'Story', 'Word', 'Novel', 'Literary', 'Scholar'],
    TOY_STORE: ['Play', 'Fun', 'Joy', 'Wonder', 'Imagine', 'Magic', 'Toy', 'Kiddo'],
    FURNITURE: ['Comfort', 'Home', 'Living', 'Interior', 'Modern', 'Classic', 'Design', 'Style'],
    JEWELRY: ['Gem', 'Sparkle', 'Jewel', 'Gold', 'Silver', 'Diamond', 'Precious', 'Treasure'],
    FOOTWEAR: ['Stride', 'Step', 'Sole', 'Foot', 'Walk', 'Run', 'Comfort', 'Trek'],
    HEALTH: ['Vital', 'Wellness', 'Health', 'Natural', 'Life', 'Pure', 'Essential', 'Balance'],
    SPECIALTY_FOOD: ['Gourmet', 'Taste', 'Flavor', 'Culinary', 'Delish', 'Savor', 'Artisan', 'Fine'],
    PET_SUPPLIES: ['Pet', 'Animal', 'Furry', 'Paw', 'Companion', 'Critter', 'Buddy', 'Friend'],
    DEPARTMENT_STORE: ['Grand', 'City', 'Metro', 'Universal', 'Complete', 'General', 'Total', 'All'],
    HOBBY: ['Craft', 'Create', 'Hobby', 'Leisure', 'Pastime', 'Interest', 'Art', 'Make'],
    HARDWARE: ['Tool', 'Build', 'Hard', 'Fix', 'Construct', 'Craft', 'Workshop', 'Pro'],
    GARDEN: ['Green', 'Garden', 'Plant', 'Grow', 'Bloom', 'Harvest', 'Nature', 'Earth'],
    OFFICE_SUPPLIES: ['Office', 'Work', 'Pro', 'Business', 'Bureau', 'Task', 'Desk', 'Corporate'],
    AUTOMOTIVE: ['Auto', 'Car', 'Drive', 'Motor', 'Gear', 'Speed', 'Wheel', 'Road']
  };
  
  const suffixes = {
    CLOTHING: ['Apparel', 'Clothes', 'Wear', 'Fashion', 'Attire', 'Garments', 'Collection', 'Wardrobe'],
    ELECTRONICS: ['Electronics', 'Tech', 'Digital', 'Devices', 'Systems', 'Gadgets', 'Solutions', 'Hub'],
    HOME_GOODS: ['Home', 'Living', 'Decor', 'Essentials', 'Furnishings', 'Interiors', 'House', 'Spaces'],
    GROCERY: ['Market', 'Grocers', 'Foods', 'Mart', 'Supermarket', 'Provisions', 'Fare', 'Edibles'],
    BEAUTY: ['Beauty', 'Cosmetics', 'Makeup', 'Care', 'Glamour', 'Aesthetics', 'Look', 'Style'],
    SPORTING_GOODS: ['Sports', 'Athletics', 'Active', 'Gear', 'Equipment', 'Fitness', 'Outdoors', 'Performance'],
    BOOKSTORE: ['Books', 'Pages', 'Reads', 'Literature', 'Stories', 'Tomes', 'Library', 'Press'],
    TOY_STORE: ['Toys', 'Games', 'Playthings', 'Fun', 'Wonders', 'Joy', 'Kids', 'Amusements'],
    FURNITURE: ['Furniture', 'Home', 'Interiors', 'Furnishings', 'Decor', 'Living', 'Spaces', 'Design'],
    JEWELRY: ['Jewelers', 'Gems', 'Fine Jewelry', 'Treasures', 'Adornments', 'Luxury', 'Collections', 'Designs'],
    FOOTWEAR: ['Shoes', 'Footwear', 'Stride', 'Step', 'Sole', 'Walk', 'Kicks', 'Treads'],
    HEALTH: ['Health', 'Wellness', 'Vitality', 'Essentials', 'Nutrition', 'Care', 'Remedies', 'Living'],
    SPECIALTY_FOOD: ['Gourmet', 'Tastes', 'Cuisine', 'Flavors', 'Foods', 'Delicacies', 'Edibles', 'Specialties'],
    PET_SUPPLIES: ['Pets', 'Animal Supply', 'Pet Care', 'Critters', 'Pet Shop', 'Companions', 'Paws', 'Pet Mart'],
    DEPARTMENT_STORE: ['Department Store', 'Emporium', 'Retail', 'Mart', 'Goods', 'Stores', 'Plaza', 'Shopping'],
    HOBBY: ['Hobbies', 'Crafts', 'Arts', 'Creations', 'Makers', 'Leisure', 'DIY', 'Pastimes'],
    HARDWARE: ['Hardware', 'Tools', 'Home Improvement', 'Building Supply', 'Construction', 'DIY', 'Fix-It', 'Builder'],
    GARDEN: ['Garden', 'Nursery', 'Plants', 'Landscape', 'Flora', 'Greenery', 'Botanical', 'Outdoor'],
    OFFICE_SUPPLIES: ['Office Supply', 'Workplace', 'Business', 'Stationery', 'Work Space', 'Professional', 'Supplies', 'Desk'],
    AUTOMOTIVE: ['Auto Parts', 'Car Care', 'Motor', 'Vehicle', 'Automotive', 'Drive', 'Auto Shop', 'Car Needs']
  };
  
  // Random number for name generation
  const random = Math.random();
  
  // Get random elements from each array for the selected category
  const prefix = prefixes[category][Math.floor(Math.random() * prefixes[category].length)];
  const suffix = suffixes[category][Math.floor(Math.random() * suffixes[category].length)];
  
  // Format name with various patterns
  if (random < 0.25) {
    return `${prefix} ${suffix}`;
  } else if (random < 0.5) {
    return `The ${prefix} ${suffix}`;
  } else if (random < 0.75) {
    return `${prefix}'s ${suffix}`;
  } else {
    // Use format like "Urban Apparel Co." or "Digital Tech Inc."
    const endings = ['Co.', 'Inc.', 'Ltd.', 'Group', 'Collective', 'Emporium', 'Depot', 'Center', 'Hub', 'Exchange'];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    return `${prefix} ${suffix} ${ending}`;
  }
}

// Generate a description for a store based on its name, category, and type
function generateStoreDescription(name, category, storeType) {
  const introductions = [
    `${name} is a ${storeType === STORE_TYPES.ONLINE ? 'premier online destination' : storeType === STORE_TYPES.PHYSICAL ? 'well-established retail store' : 'versatile retail business with physical and online presence'} specializing in`,
    `At ${name}, we pride ourselves on offering`,
    `Welcome to ${name}, your go-to source for`,
    `${name} has built a reputation for providing`,
    `Discover ${name}, where you'll find`
  ];
  
  const productDescriptions = {
    CLOTHING: 'stylish apparel, quality fashion, and trendy clothing for all occasions',
    ELECTRONICS: 'cutting-edge gadgets, reliable tech solutions, and innovative electronic products',
    HOME_GOODS: 'elegant home decor, practical household items, and quality furnishings',
    GROCERY: 'fresh produce, pantry staples, and a wide selection of food and beverages',
    BEAUTY: 'premium cosmetics, skincare products, and beauty accessories',
    SPORTING_GOODS: 'quality sports equipment, activewear, and fitness accessories',
    BOOKSTORE: 'diverse literature, bestsellers, and specialty publications',
    TOY_STORE: 'fun toys, educational games, and entertaining activities for all ages',
    FURNITURE: 'elegant furniture, comfortable home solutions, and stylish interior pieces',
    JEWELRY: 'exquisite jewelry, fine accessories, and timeless pieces',
    FOOTWEAR: 'comfortable shoes, stylish footwear, and athletic performance options',
    HEALTH: 'natural supplements, wellness products, and health essentials',
    SPECIALTY_FOOD: 'gourmet ingredients, specialty foods, and culinary delights',
    PET_SUPPLIES: 'quality pet food, toys, accessories, and animal care products',
    DEPARTMENT_STORE: 'a wide range of products across multiple categories for one-stop shopping',
    HOBBY: 'creative supplies, craft materials, and hobby essentials',
    HARDWARE: 'reliable tools, building materials, and home improvement supplies',
    GARDEN: 'plants, garden tools, outdoor decor, and landscaping supplies',
    OFFICE_SUPPLIES: 'professional stationery, office equipment, and workplace essentials',
    AUTOMOTIVE: 'car parts, vehicle accessories, and automotive maintenance products'
  };
  
  const customerPromises = [
    'dedicated to customer satisfaction with superior service',
    'committed to quality and value in every purchase',
    'focused on providing exceptional shopping experiences',
    'ensuring top product selection at competitive prices',
    'delivering reliability and expertise in our field'
  ];
  
  const storeFeatures = {
    [STORE_TYPES.PHYSICAL]: [
      'welcoming store environment',
      'knowledgeable in-store staff',
      'convenient locations',
      'hands-on product testing',
      'immediate product availability'
    ],
    [STORE_TYPES.ONLINE]: [
      'user-friendly website',
      'secure online shopping',
      'fast shipping options',
      'extensive product information',
      'convenient shopping from anywhere'
    ],
    [STORE_TYPES.HYBRID]: [
      'seamless integration between online and in-store shopping',
      'buy online, pick up in store options',
      'consistent experience across all shopping channels',
      'flexibility to shop your way',
      'bringing together the best of digital and physical retail'
    ]
  };
  
  // Select random elements from each array
  const introduction = introductions[Math.floor(Math.random() * introductions.length)];
  const products = productDescriptions[category];
  const promise = customerPromises[Math.floor(Math.random() * customerPromises.length)];
  const feature = storeFeatures[storeType][Math.floor(Math.random() * storeFeatures[storeType].length)];
  
  // Combine elements to create a cohesive description
  return `${introduction} ${products}. We are ${promise}, with a ${feature}. Since our founding, ${name} has been the destination of choice for discerning customers seeking quality and value.`;
}

// Generate random products for a store based on its category
function generateStoreProducts(category) {
  const productsByCategory = {
    CLOTHING: ['T-shirts', 'Jeans', 'Dresses', 'Jackets', 'Sweaters', 'Activewear', 'Formal attire', 'Accessories'],
    ELECTRONICS: ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Smart home devices', 'Gaming accessories', 'Cameras', 'Audio equipment'],
    HOME_GOODS: ['Bedding', 'Kitchen appliances', 'Decor items', 'Bath essentials', 'Storage solutions', 'Lighting', 'Dinnerware', 'Textiles'],
    GROCERY: ['Fresh produce', 'Dairy', 'Bakery items', 'Meat & seafood', 'Frozen foods', 'Snacks', 'Beverages', 'Organic options'],
    BEAUTY: ['Skincare', 'Makeup', 'Hair care', 'Fragrances', 'Bath & body', 'Beauty tools', 'Nail care', 'Natural products'],
    SPORTING_GOODS: ['Athletic wear', 'Fitness equipment', 'Team sports gear', 'Outdoor recreation', 'Water sports', 'Training accessories', 'Footwear', 'Camping gear'],
    BOOKSTORE: ['Fiction', 'Non-fiction', 'Children\'s books', 'Academic texts', 'Magazines', 'Specialty publications', 'E-books', 'Audiobooks'],
    TOY_STORE: ['Action figures', 'Board games', 'Educational toys', 'Outdoor play', 'Puzzles', 'Stuffed animals', 'Building sets', 'Creative arts'],
    FURNITURE: ['Living room', 'Bedroom', 'Dining', 'Office', 'Outdoor', 'Accent pieces', 'Storage', 'Youth furniture'],
    JEWELRY: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches', 'Fine jewelry', 'Fashion pieces', 'Custom designs'],
    FOOTWEAR: ['Casual shoes', 'Athletic footwear', 'Formal shoes', 'Boots', 'Sandals', 'Children\'s shoes', 'Specialty footwear', 'Accessories'],
    HEALTH: ['Vitamins', 'Supplements', 'Natural remedies', 'Wellness devices', 'Fitness nutrition', 'Health foods', 'Personal care', 'First aid'],
    SPECIALTY_FOOD: ['Artisanal cheeses', 'Gourmet chocolates', 'Specialty coffees', 'Imported foods', 'Organic selections', 'Gluten-free options', 'Vegan foods', 'Luxury ingredients'],
    PET_SUPPLIES: ['Pet food', 'Toys', 'Beds & furniture', 'Grooming supplies', 'Health care', 'Training aids', 'Carriers & travel', 'Clothing & accessories'],
    DEPARTMENT_STORE: ['Apparel', 'Home goods', 'Beauty', 'Accessories', 'Footwear', 'Electronics', 'Kitchenware', 'Bedding'],
    HOBBY: ['Art supplies', 'Crafting materials', 'Model kits', 'Collectibles', 'DIY projects', 'Fabric & textiles', 'Paper crafts', 'Tools & storage'],
    HARDWARE: ['Tools', 'Building materials', 'Electrical', 'Plumbing', 'Paint & supplies', 'Outdoor equipment', 'Safety gear', 'Storage solutions'],
    GARDEN: ['Plants', 'Seeds', 'Soil & fertilizers', 'Gardening tools', 'Outdoor decor', 'Pots & planters', 'Landscaping materials', 'Outdoor furniture'],
    OFFICE_SUPPLIES: ['Writing instruments', 'Paper products', 'Organization', 'Desk accessories', 'Technology', 'Furniture', 'Shipping supplies', 'Presentation materials'],
    AUTOMOTIVE: ['Car parts', 'Maintenance supplies', 'Interior accessories', 'Exterior accessories', 'Tools', 'Fluids & chemicals', 'Electronics', 'Safety equipment']
  };
  
  // Choose a random subset of products for this store
  const allProducts = productsByCategory[category];
  const productCount = Math.floor(Math.random() * 4) + 3; // 3-6 products
  const selectedProducts = [];
  
  for (let i = 0; i < productCount; i++) {
    const randomIndex = Math.floor(Math.random() * allProducts.length);
    if (!selectedProducts.includes(allProducts[randomIndex])) {
      selectedProducts.push(allProducts[randomIndex]);
    }
  }
  
  return selectedProducts;
}

// Generate retail data
async function generateRetailData(previewMode = false) {
  try {
    // Determine how many retail entities to create
    const entityCount = previewMode ? 5 : 30; // Lower count in preview mode
    console.log(`🛍️ Creating ${entityCount} retail entities...`);
    
    const createdEntities = [];
    
    for (let i = 0; i < entityCount; i++) {
      // Select a random category
      const category = RETAIL_CATEGORIES[Math.floor(Math.random() * RETAIL_CATEGORIES.length)];
      
      // Determine store type (physical, online, or hybrid)
      const storeTypeOptions = [STORE_TYPES.PHYSICAL, STORE_TYPES.ONLINE, STORE_TYPES.HYBRID];
      const storeTypeWeights = [0.4, 0.4, 0.2]; // 40% physical, 40% online, 20% hybrid
      
      // Choose store type based on weights
      let randomValue = Math.random();
      let storeType;
      if (randomValue < storeTypeWeights[0]) {
        storeType = storeTypeOptions[0];
      } else if (randomValue < storeTypeWeights[0] + storeTypeWeights[1]) {
        storeType = storeTypeOptions[1];
      } else {
        storeType = storeTypeOptions[2];
      }
      
      // Map store type to entity type
      const entityType = storeType === STORE_TYPES.ONLINE ? 'DIGITAL' : 
                         storeType === STORE_TYPES.PHYSICAL ? 'PHYSICAL' : 
                         (Math.random() > 0.5 ? 'PHYSICAL' : 'DIGITAL');
      
      // Generate entity name and details
      const storeName = generateStoreName(category);
      const description = generateStoreDescription(storeName, category, storeType);
      const products = generateStoreProducts(category);
      const coordinates = {
        lat: (Math.random() * 170 - 85).toFixed(6),
        lng: (Math.random() * 360 - 180).toFixed(6)
      };
      
      // Create entity object
      const entity = {
        name: storeName,
        category: 'RETAIL', // All are under the main RETAIL category
        subCategory: category, // Store the specific retail category in description or metadata
        description,
        location: {
          coordinates,
          address: '123 Shopping St', // Placeholder address
          city: 'Retailville', // Placeholder city
          country: 'US' // Placeholder country
        },
        type: entityType,
        products,
        storeType,
        isSynthetic: true // Mark as synthetic data
      };
      
      // Log in preview mode or insert into DB
      if (previewMode) {
        console.log('\n-----------------------------------');
        console.log(`Retail Entity ${i+1}:`, entity.name);
        console.log('Category:', entity.subCategory);
        console.log('Store Type:', entity.storeType);
        console.log('Entity Type:', entity.type);
        console.log('Description:', entity.description);
        console.log('Products:', entity.products.join(', '));
        
      } else {
        // Insert into database
        try {
          // Add sub-category to the location object to keep it organized
          const locationWithMetadata = {
            ...entity.location,
            subCategory: entity.subCategory,
            storeType: entity.storeType,
            products: entity.products
          };
          
          // Insert entity record
          const result = await db.query(
            'INSERT INTO entities (name, category, description, location, type, is_synthetic) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [entity.name, entity.category, entity.description, JSON.stringify(locationWithMetadata), entity.type, entity.isSynthetic]
          );
          
          const entityId = result.rows[0].id;
          
          // Create content items for this retail entity
          
          // 1. About the store
          await db.query(
            'INSERT INTO entity_content (entity_id, content_type, title, content, created_at) VALUES ($1, $2, $3, $4, $5)',
            [
              entityId,
              'ABOUT',
              'About Us',
              `${entity.name} is a ${entity.storeType.toLowerCase()} retailer specializing in ${entity.subCategory.toLowerCase().replace('_', ' ')} products. ${entity.description}`,
              new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
            ]
          );
          
          // 2. Products
          await db.query(
            'INSERT INTO entity_content (entity_id, content_type, title, content, created_at) VALUES ($1, $2, $3, $4, $5)',
            [
              entityId,
              'PRODUCT',
              'Our Products',
              `At ${entity.name}, we offer a wide selection of high-quality ${entity.subCategory.toLowerCase().replace('_', ' ')} products, including: ${entity.products.join(', ')}. Visit us ${entity.storeType === 'ONLINE' ? 'online' : entity.storeType === 'PHYSICAL' ? 'in-store' : 'online or in-store'} to explore our full range of options.`,
              new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000))
            ]
          );
          
          // 3. Either location details (physical) or shipping info (online)
          if (entity.storeType === 'PHYSICAL' || entity.storeType === 'HYBRID') {
            await db.query(
              'INSERT INTO entity_content (entity_id, content_type, title, content, created_at) VALUES ($1, $2, $3, $4, $5)',
              [
                entityId,
                'LOCATION',
                'Visit Our Store',
                `${entity.name} is conveniently located to serve our customers. Our store offers a welcoming environment where you can browse our products, speak with our knowledgeable staff, and enjoy a personalized shopping experience.`,
                new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
              ]
            );
          } else {
            await db.query(
              'INSERT INTO entity_content (entity_id, content_type, title, content, created_at) VALUES ($1, $2, $3, $4, $5)',
              [
                entityId,
                'SERVICE',
                'Shipping & Delivery',
                `${entity.name} offers convenient shipping options to bring your purchases directly to your door. We provide fast, reliable delivery services and secure packaging to ensure your items arrive in perfect condition.`,
                new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
              ]
            );
          }
          
          createdEntities.push({
            id: entityId,
            name: entity.name, 
            category: entity.subCategory,
            storeType: entity.storeType
          });
          
          // Log progress for every 10 entities
          if (createdEntities.length % 10 === 0) {
            console.log(`Created ${createdEntities.length} retail entities so far...`);
          }
        } catch (error) {
          console.error(`Error creating retail entity ${entity.name}:`, error.message);
        }
      }
    }
    
    if (!previewMode) {
      console.log('\n✅ Retail entity generation complete!');
      console.log(`Created ${createdEntities.length} retail entities with content`);
      
      // Show sample of created entities
      console.log('\nSample of created retail entities:');
      createdEntities.slice(0, 5).forEach(entity => {
        console.log(`- ${entity.name} (${entity.category} / ${entity.storeType})`);
      });
    }
    
    return createdEntities;
    
  } catch (error) {
    console.error('❌ Error generating retail entities:', error.message);
    if (error.stack) console.error(error.stack);
    return [];
  }
}

// Update user preferences with new retail entities
async function updateUserPreferences(previewMode = false) {
  if (previewMode) {
    console.log('\n🔄 Preview mode - skipping user preference updates');
    return;
  }
  
  try {
    console.log('\n🔄 Updating user preferences with retail entities...');
    
    // Get all users
    const users = await db.query('SELECT id FROM users');
    
    if (users.rows.length === 0) {
      console.log('No users found in the database. Please generate users first.');
      return;
    }
    
    // Get all retail entities
    const entities = await db.query('SELECT id, name, category, type FROM entities WHERE category = $1', ['RETAIL']);
    
    if (entities.rows.length === 0) {
      console.log('No retail entities found in the database. Please generate retail entities first.');
      return;
    }
    
    console.log(`Found ${users.rows.length} users and ${entities.rows.length} retail entities.`);
    
    // For each user, assign 2-5 random retail entities
    let updatedUserCount = 0;
    
    for (const user of users.rows) {
      // Get current user preferences
      const userResult = await db.query('SELECT preferences FROM users WHERE id = $1', [user.id]);
      
      if (!userResult.rows[0]) continue;
      
      let preferences = userResult.rows[0].preferences || {};
      
      // Ensure 'retail' array exists in preferences
      if (!preferences.retail) {
        preferences.retail = [];
      }
      
      // Select 2-5 random entities for this user
      const numberOfEntities = Math.floor(Math.random() * 4) + 2; // 2-5 entities
      const selectedEntities = [];
      
      for (let i = 0; i < numberOfEntities; i++) {
        const randomIndex = Math.floor(Math.random() * entities.rows.length);
        const entity = entities.rows[randomIndex];
        
        // Avoid duplicates
        if (!selectedEntities.some(e => e.id === entity.id)) {
          selectedEntities.push({
            id: entity.id,
            name: entity.name,
            frequency: ['weekly', 'monthly', 'occasionally', 'frequently'][Math.floor(Math.random() * 4)],
            preference: ['favorite', 'like', 'neutral'][Math.floor(Math.random() * 3)]
          });
        }
      }
      
      // Update user preferences
      preferences.retail = selectedEntities;
      
      // Save updated preferences
      await db.query('UPDATE users SET preferences = $1 WHERE id = $2', [preferences, user.id]);
      updatedUserCount++;
      
      // Log progress for every 10 users
      if (updatedUserCount % 10 === 0) {
        console.log(`Updated preferences for ${updatedUserCount} users so far...`);
      }
    }
    
    console.log(`\n✅ Successfully updated preferences for ${updatedUserCount} users with retail entities.`);
    
  } catch (error) {
    console.error('❌ Error updating user preferences:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

// Main function to run the script
async function main() {
  const isPreviewMode = process.argv.includes('--preview');
  
  try {
    // First step: Generate retail entities
    const retailEntities = await generateRetailData(isPreviewMode);
    
    // Second step: Update user preferences with the new entities
    if (!isPreviewMode && retailEntities.length > 0) {
      await updateUserPreferences(isPreviewMode);
    }
    
    // Process exit in script mode (not in preview mode)
    if (!isPreviewMode) {
      console.log('✅ Retail data generation and user preference updates completed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Retail data generation failed:', error);
    process.exit(1);
  }
}

// Run main function
main();