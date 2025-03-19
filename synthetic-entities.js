/**
 * Entity Generator Script
 * 
 * This script generates entities such as stores, websites, and physical locations
 * for testing purposes. These entities represent a diverse range of businesses
 * and organizations for the platform.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './server/db.ts';

dotenv.config();

// Get current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Entity categories
const ENTITY_CATEGORIES = [
  'RETAIL',
  'E_COMMERCE',
  'RESTAURANT',
  'EDUCATION',
  'ENTERTAINMENT',
  'TECHNOLOGY',
  'WELLNESS',
  'FINANCIAL',
  'TRAVEL',
  'MEDIA'
];

// Generate a diverse set of entity names based on the category
function generateEntityName(category) {
  const prefixes = {
    RETAIL: ['Urban', 'Metro', 'Elite', 'Classic', 'Premier', 'Modern', 'Trendy', 'Luxury'],
    E_COMMERCE: ['Digital', 'Online', 'Net', 'Web', 'Shop', 'Click', 'Byte', 'Market'],
    RESTAURANT: ['Taste', 'Savory', 'Spice', 'Flavor', 'Fresh', 'Delish', 'Gourmet', 'Culinary'],
    EDUCATION: ['Knowledge', 'Learn', 'Minds', 'Scholar', 'Academy', 'Discover', 'Wisdom', 'Edu'],
    ENTERTAINMENT: ['Fun', 'Joy', 'Thrill', 'Excitement', 'Adventure', 'Play', 'Leisure', 'Enjoy'],
    TECHNOLOGY: ['Tech', 'Smart', 'Future', 'Innovative', 'Digital', 'Next', 'Wave', 'Cyber'],
    WELLNESS: ['Vital', 'Glow', 'Zen', 'Balance', 'Life', 'Natural', 'Harmony', 'Pure'],
    FINANCIAL: ['Wealth', 'Capital', 'Secure', 'Trust', 'Prosper', 'Equity', 'Growth', 'Invest'],
    TRAVEL: ['Voyage', 'Journey', 'Wander', 'Explore', 'Adventure', 'Trek', 'Global', 'World'],
    MEDIA: ['Voice', 'Buzz', 'Inform', 'Vision', 'Stream', 'Pulse', 'Channel', 'Scope']
  };
  
  const suffixes = {
    RETAIL: ['Store', 'Boutique', 'Outlet', 'Shop', 'Emporium', 'Market', 'Collection', 'Gallery'],
    E_COMMERCE: ['.com', 'Shop', 'Store', 'Market', 'Express', 'Direct', 'Hub', 'Place'],
    RESTAURANT: ['Kitchen', 'Bistro', 'Cafe', 'Grill', 'Diner', 'Eats', 'Table', 'Cuisine'],
    EDUCATION: ['Academy', 'School', 'Institute', 'College', 'University', 'Center', 'Labs', 'Course'],
    ENTERTAINMENT: ['Theater', 'Arena', 'Studio', 'Stage', 'Park', 'Hub', 'Zone', 'Club'],
    TECHNOLOGY: ['Labs', 'Systems', 'Solutions', 'Innovations', 'Tech', 'Dynamics', 'Networks', 'Works'],
    WELLNESS: ['Spa', 'Center', 'Studio', 'Retreat', 'Club', 'Oasis', 'Sanctuary', 'Haven'],
    FINANCIAL: ['Bank', 'Advisors', 'Partners', 'Group', 'Capital', 'Trust', 'Securities', 'Associates'],
    TRAVEL: ['Tours', 'Expeditions', 'Adventures', 'Destinations', 'Travels', 'Journeys', 'Escapes', 'Getaways'],
    MEDIA: ['Media', 'Network', 'News', 'Productions', 'Studios', 'Press', 'Communications', 'Broadcasting']
  };
  
  const nouns = {
    RETAIL: ['Fashion', 'Styles', 'Trends', 'Apparel', 'Clothing', 'Wear', 'Goods', 'Products'],
    E_COMMERCE: ['Cart', 'Shop', 'Deals', 'Goods', 'Products', 'Items', 'Finds', 'Selection'],
    RESTAURANT: ['Flavor', 'Taste', 'Dish', 'Palate', 'Cuisine', 'Meal', 'Plate', 'Menu'],
    EDUCATION: ['Learning', 'Knowledge', 'Skills', 'Training', 'Education', 'Studies', 'Development', 'Growth'],
    ENTERTAINMENT: ['Entertainment', 'Fun', 'Excitement', 'Amusement', 'Leisure', 'Recreation', 'Enjoyment', 'Pleasure'],
    TECHNOLOGY: ['Technology', 'Software', 'Systems', 'Devices', 'Gadgets', 'Computing', 'Digital', 'Electronics'],
    WELLNESS: ['Health', 'Wellness', 'Fitness', 'Well-being', 'Lifestyle', 'Care', 'Balance', 'Vitality'],
    FINANCIAL: ['Finance', 'Investments', 'Savings', 'Assets', 'Wealth', 'Money', 'Capital', 'Funds'],
    TRAVEL: ['Travel', 'Vacation', 'Trip', 'Exploration', 'Tourism', 'Adventure', 'Excursion', 'Voyage'],
    MEDIA: ['Media', 'Content', 'News', 'Information', 'Entertainment', 'Publications', 'Broadcasting', 'Communication']
  };
  
  // Get random elements from each array for the selected category
  const prefix = prefixes[category][Math.floor(Math.random() * prefixes[category].length)];
  const suffix = suffixes[category][Math.floor(Math.random() * suffixes[category].length)];
  const noun = nouns[category][Math.floor(Math.random() * nouns[category].length)];
  
  // Generate name with a 50% chance of including a noun
  return Math.random() > 0.5 
    ? `${prefix} ${noun} ${suffix}`
    : `${prefix} ${suffix}`;
}

// Generate a description for an entity based on its name and category
function generateEntityDescription(name, category) {
  const missionStatements = [
    'dedicated to providing the best experience',
    'committed to excellence in every aspect',
    'focused on quality and customer satisfaction',
    'known for outstanding service and products',
    'pioneering innovations in',
    'a leader in the field of',
    'recognized for exceptional quality in',
    'setting the standard for'
  ];
  
  const valuePropositions = {
    RETAIL: [
      'curated selection of premium products',
      'stylish and trendy merchandise',
      'personalized shopping experiences',
      'affordable luxury goods',
      'sustainable and ethical products'
    ],
    E_COMMERCE: [
      'seamless online shopping experience',
      'vast selection of products at competitive prices',
      'fast delivery and hassle-free returns',
      'personalized recommendations',
      'convenient digital marketplace'
    ],
    RESTAURANT: [
      'mouthwatering culinary creations',
      'locally-sourced ingredients',
      'authentic flavors and innovative dishes',
      'exceptional dining experiences',
      'fusion of traditional and modern cuisine'
    ],
    EDUCATION: [
      'comprehensive learning programs',
      'cutting-edge educational methodologies',
      'nurturing environment for growth',
      'industry-relevant training',
      'personalized learning paths'
    ],
    ENTERTAINMENT: [
      'immersive entertainment experiences',
      'thrilling adventures for all ages',
      'unforgettable memories',
      'creative expression and artistic excellence',
      'engaging activities and performances'
    ],
    TECHNOLOGY: [
      'innovative technological solutions',
      'cutting-edge software and hardware',
      'digital transformation services',
      'tech-enabled productivity tools',
      'future-forward digital products'
    ],
    WELLNESS: [
      'holistic wellness experiences',
      'rejuvenating treatments',
      'mind-body balance approach',
      'personalized health journeys',
      'natural and organic products'
    ],
    FINANCIAL: [
      'secure and reliable financial services',
      'personalized investment strategies',
      'transparent and ethical money management',
      'wealth-building solutions',
      'innovative financial tools'
    ],
    TRAVEL: [
      'unforgettable travel experiences',
      'carefully curated destinations',
      'authentic cultural immersions',
      'hassle-free travel planning',
      'adventure and exploration'
    ],
    MEDIA: [
      'engaging and informative content',
      'cutting-edge storytelling',
      'diverse perspectives and voices',
      'timely and accurate reporting',
      'entertaining and thought-provoking media'
    ]
  };
  
  const audiences = {
    RETAIL: [
      'fashion enthusiasts',
      'trendy shoppers',
      'quality-conscious consumers',
      'style-savvy individuals',
      'discerning customers'
    ],
    E_COMMERCE: [
      'online shoppers',
      'busy professionals',
      'tech-savvy consumers',
      'value-seekers',
      'convenience-focused buyers'
    ],
    RESTAURANT: [
      'food lovers',
      'culinary enthusiasts',
      'discerning diners',
      'families and couples',
      'adventurous eaters'
    ],
    EDUCATION: [
      'lifelong learners',
      'ambitious professionals',
      'curious minds',
      'students of all ages',
      'knowledge seekers'
    ],
    ENTERTAINMENT: [
      'thrill-seekers',
      'families looking for fun',
      'entertainment enthusiasts',
      'adventure lovers',
      'those seeking memorable experiences'
    ],
    TECHNOLOGY: [
      'tech enthusiasts',
      'forward-thinking businesses',
      'digital natives',
      'innovative organizations',
      'early adopters'
    ],
    WELLNESS: [
      'health-conscious individuals',
      'those seeking balance',
      'wellness enthusiasts',
      'self-care advocates',
      'holistic health seekers'
    ],
    FINANCIAL: [
      'investors',
      'savers',
      'financially conscious individuals',
      'wealth builders',
      'those planning for the future'
    ],
    TRAVEL: [
      'adventure seekers',
      'world explorers',
      'cultural enthusiasts',
      'relaxation-focused travelers',
      'luxury vacationers'
    ],
    MEDIA: [
      'information seekers',
      'opinion leaders',
      'engaged citizens',
      'entertainment consumers',
      'content enthusiasts'
    ]
  };
  
  // Pick one of each
  const mission = missionStatements[Math.floor(Math.random() * missionStatements.length)];
  const valueIndex = Math.floor(Math.random() * valuePropositions[category].length);
  const audienceIndex = Math.floor(Math.random() * audiences[category].length);
  const value = valuePropositions[category][valueIndex];
  const audience = audiences[category][audienceIndex];
  
  // Put it all together
  return `${name} is ${mission} ${category.toLowerCase().replace('_', '-')}. We offer a ${value} designed for ${audience}. Founded with a passion for excellence, we continue to grow and serve our community.`;
}

// Generate random coordinates for an entity
function generateRandomCoordinates() {
  // Generate coordinates within reasonable bounds
  // Latitude: -90 to 90, Longitude: -180 to 180, but narrowed for more realistic distribution
  const lat = (Math.random() * 170 - 85).toFixed(6);
  const lng = (Math.random() * 360 - 180).toFixed(6);
  
  return { lat, lng };
}

// Generate content for an entity
function generateEntityContent(entityId, entityName, category) {
  const contents = [];
  
  // Generate between 2-5 content items for each entity
  const contentCount = Math.floor(Math.random() * 4) + 2;
  
  for (let i = 0; i < contentCount; i++) {
    contents.push(generateContentItem(entityId, entityName, category, i));
  }
  
  return contents;
}

// Generate a single content item for an entity
function generateContentItem(entityId, entityName, category, index) {
  const contentTypes = ['ABOUT', 'PRODUCT', 'SERVICE', 'EVENT', 'NEWS', 'PROMOTION'];
  const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
  
  const titles = {
    ABOUT: [
      'About Us', 
      'Our Story', 
      'Our Mission', 
      'Company History',
      'Meet the Team'
    ],
    PRODUCT: [
      'Featured Products', 
      'New Arrivals', 
      'Best Sellers',
      'Product Highlights',
      'Signature Collection'
    ],
    SERVICE: [
      'Our Services', 
      'Service Offerings', 
      'What We Provide',
      'Professional Solutions',
      'Service Excellence'
    ],
    EVENT: [
      'Upcoming Events', 
      'Special Events', 
      'Join Us For',
      'Exclusive Events',
      'Community Gatherings'
    ],
    NEWS: [
      'Latest News', 
      'Recent Developments', 
      'Announcements',
      'Industry Updates',
      'Press Releases'
    ],
    PROMOTION: [
      'Special Offers', 
      'Limited Time Deals', 
      'Exclusive Discounts',
      'Seasonal Promotions',
      'Member Benefits'
    ]
  };
  
  // Descriptive paragraphs based on content type
  const paragraphs = {
    ABOUT: [
      `At ${entityName}, we believe in creating meaningful experiences through our ${category.toLowerCase().replace('_', '-')} offerings. Our team is dedicated to excellence in everything we do.`,
      `${entityName} was founded with a vision to transform the ${category.toLowerCase().replace('_', '-')} landscape. Years later, we continue to innovate and grow.`,
      `What makes ${entityName} special is our commitment to quality and customer satisfaction. We strive to exceed expectations in every interaction.`
    ],
    PRODUCT: [
      `Discover our collection of premium products designed to enhance your experience. Each item is carefully selected for quality and value.`,
      `Our latest arrivals feature cutting-edge designs and exceptional craftsmanship, perfect for those who appreciate the finer things.`,
      `From everyday essentials to luxury items, our product range caters to diverse tastes and preferences.`
    ],
    SERVICE: [
      `Our comprehensive services are tailored to meet your specific needs. Our expert team ensures a seamless experience from start to finish.`,
      `Experience excellence with our professional services, designed to solve problems and create opportunities for growth.`,
      `We pride ourselves on delivering reliable, high-quality services that help you achieve your goals efficiently.`
    ],
    EVENT: [
      `Join us for exclusive events throughout the year, where you can connect with like-minded individuals and experience our offerings firsthand.`,
      `Our events are carefully curated to provide valuable insights, entertainment, and networking opportunities for our community.`,
      `Stay tuned for upcoming special events featuring industry experts, exciting activities, and special promotions.`
    ],
    NEWS: [
      `Stay updated with the latest developments at ${entityName} and in the ${category.toLowerCase().replace('_', '-')} industry through our news section.`,
      `We're excited to announce recent changes and improvements designed to enhance your experience with us.`,
      `Read about our recent achievements, community involvement, and future plans in our latest news updates.`
    ],
    PROMOTION: [
      `Take advantage of our limited-time offers and enjoy exceptional value on selected items and services.`,
      `Members receive exclusive access to special discounts and promotions throughout the year.`,
      `Seasonal promotions are our way of thanking our loyal customers and welcoming new ones to the ${entityName} community.`
    ]
  };
  
  // Pick title and content
  const title = titles[contentType][Math.floor(Math.random() * titles[contentType].length)];
  const paragraph = paragraphs[contentType][Math.floor(Math.random() * paragraphs[contentType].length)];
  
  // Additional content specific to the entity type
  const specificContent = getSpecificContent(category, contentType);
  
  return {
    entityId,
    contentType,
    title,
    content: `${paragraph} ${specificContent}`,
    // Randomize dates within the last year
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
  };
}

// Generate content specific to entity category and content type
function getSpecificContent(category, contentType) {
  switch (category) {
    case 'RETAIL':
      return contentType === 'PRODUCT' 
        ? 'Our products include clothing, accessories, home goods, and specialty items for all occasions.'
        : 'Visit our stores to experience personalized shopping assistance and exclusive in-store offers.';
      
    case 'E_COMMERCE':
      return contentType === 'SERVICE' 
        ? 'We offer fast shipping, easy returns, and 24/7 customer support for a seamless online shopping experience.'
        : 'Browse thousands of products from the comfort of your home, with new items added daily.';
      
    case 'RESTAURANT':
      return contentType === 'EVENT' 
        ? 'Join us for special dining events, chef\'s tables, and seasonal menu launches throughout the year.'
        : 'Our menu features a blend of traditional favorites and innovative culinary creations using the finest ingredients.';
      
    case 'EDUCATION':
      return contentType === 'SERVICE' 
        ? 'Our educational programs cater to various learning styles and goals, with personalized guidance available.'
        : 'Join a community of lifelong learners and expand your horizons through our diverse course offerings.';
      
    case 'ENTERTAINMENT':
      return contentType === 'EVENT' 
        ? 'From live performances to interactive experiences, our events calendar is packed with excitement for all ages.'
        : 'Creating memorable moments through innovative entertainment experiences is at the heart of what we do.';
      
    case 'TECHNOLOGY':
      return contentType === 'PRODUCT' 
        ? 'Stay ahead with our cutting-edge tech products designed for efficiency, performance, and user-friendly experience.'
        : 'Our tech solutions are built to address real-world challenges and enhance digital capabilities.';
      
    case 'WELLNESS':
      return contentType === 'SERVICE' 
        ? 'Our holistic wellness services include personalized consultations, treatments, and ongoing support for your journey.'
        : 'Discover the perfect balance of mind, body, and spirit through our carefully crafted wellness experiences.';
      
    case 'FINANCIAL':
      return contentType === 'NEWS' 
        ? 'Stay informed about market trends, investment opportunities, and financial best practices through our regular updates.'
        : 'Our financial experts provide personalized advice to help you achieve your short and long-term financial goals.';
      
    case 'TRAVEL':
      return contentType === 'PRODUCT' 
        ? 'From all-inclusive packages to customized itineraries, we have the perfect travel experience for your preferences.'
        : 'Explore destinations off the beaten path and create memories that last a lifetime with our curated travel experiences.';
      
    case 'MEDIA':
      return contentType === 'CONTENT' 
        ? 'Our content covers a wide range of topics, delivered through various formats to inform, entertain, and inspire.'
        : 'We pride ourselves on creating engaging, thought-provoking media that resonates with diverse audiences.';
      
    default:
      return "We're constantly evolving to meet the changing needs of our customers and community.";
  }
}

// Create entities in the database
async function createEntities(previewMode = false) {
  try {
    // Determine how many entities to create
    const entityCount = previewMode ? 5 : 50; // Lower count in preview mode
    console.log(`🏢 Creating ${entityCount} business entities...`);
    
    const createdEntities = [];
    
    for (let i = 0; i < entityCount; i++) {
      // Select a random category
      const category = ENTITY_CATEGORIES[Math.floor(Math.random() * ENTITY_CATEGORIES.length)];
      
      // Generate entity name and details
      const entityName = generateEntityName(category);
      const description = generateEntityDescription(entityName, category);
      const coordinates = generateRandomCoordinates();
      
      // Create entity object
      const entity = {
        name: entityName,
        category,
        description,
        location: {
          coordinates: coordinates,
          address: '123 Main St', // Placeholder address
          city: 'Anytown', // Placeholder city
          country: 'US' // Placeholder country
        },
        type: Math.random() > 0.5 ? 'PHYSICAL' : 'DIGITAL', // 50% chance of being physical or digital
        isSynthetic: true // Mark as synthetic data
      };
      
      // Log in preview mode or insert into DB
      if (previewMode) {
        console.log('\n-----------------------------------');
        console.log(`Entity ${i+1}:`, entity.name);
        console.log('Category:', entity.category);
        console.log('Type:', entity.type);
        console.log('Description:', entity.description);
        
        // Generate sample content for preview
        const sampleContent = generateEntityContent(-1, entity.name, entity.category);
        console.log('Sample Content Items:', sampleContent.length);
        console.log('First Content Item Title:', sampleContent[0].title);
        
      } else {
        // Insert into database
        try {
          // Insert entity record
          const result = await db.query(
            'INSERT INTO entities (name, category, description, location, type, is_synthetic) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [entity.name, entity.category, entity.description, JSON.stringify(entity.location), entity.type, entity.isSynthetic]
          );
          
          const entityId = result.rows[0].id;
          
          // Generate and insert content items for this entity
          const contentItems = generateEntityContent(entityId, entity.name, entity.category);
          
          for (const item of contentItems) {
            await db.query(
              'INSERT INTO entity_content (entity_id, content_type, title, content, created_at) VALUES ($1, $2, $3, $4, $5)',
              [entityId, item.contentType, item.title, item.content, item.createdAt]
            );
          }
          
          createdEntities.push({
            id: entityId,
            name: entity.name, 
            category: entity.category,
            contentCount: contentItems.length
          });
          
          // Log progress for every 10 entities
          if (createdEntities.length % 10 === 0) {
            console.log(`Created ${createdEntities.length} entities so far...`);
          }
        } catch (error) {
          console.error(`Error creating entity ${entity.name}:`, error.message);
        }
      }
    }
    
    if (!previewMode) {
      console.log('\n✅ Entity generation complete!');
      console.log(`Created ${createdEntities.length} entities with content`);
      
      // Show sample of created entities
      console.log('\nSample of created entities:');
      createdEntities.slice(0, 5).forEach(entity => {
        console.log(`- ${entity.name} (${entity.category}): ${entity.contentCount} content items`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating entities:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

// Main function to run the script
async function main() {
  const isPreviewMode = process.argv.includes('--preview');
  
  try {
    await createEntities(isPreviewMode);
    
    // Process exit in script mode (not in preview mode)
    if (!isPreviewMode) {
      console.log('✅ Entity generation completed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Entity generation failed:', error);
    process.exit(1);
  }
}

// Run main function
main();