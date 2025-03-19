/**
 * Entity Generator Script
 * 
 * This script generates entities such as stores, websites, and physical locations
 * for testing purposes. These entities represent a diverse range of businesses
 * and organizations for the platform.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import * as schema from './shared/schema.ts';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Categories for our entities
const ENTITY_CATEGORIES = [
  'RETAIL',       // Physical stores
  'ONLINE',       // Websites and online platforms
  'EDUCATION',    // Educational institutions
  'HOSPITALITY',  // Hotels, restaurants, etc.
  'ENTERTAINMENT', // Theaters, parks, etc.
  'HEALTHCARE',   // Hospitals, clinics, etc.
];

// Entity types mapping
const ENTITY_TYPES = {
  'RETAIL': 'PHYSICAL',
  'ONLINE': 'DIGITAL',
  'EDUCATION': 'PHYSICAL',
  'HOSPITALITY': 'PHYSICAL',
  'ENTERTAINMENT': 'PHYSICAL',
  'HEALTHCARE': 'PHYSICAL'
};

// Generate a realistic name for our entities
function generateEntityName(category) {
  const prefixes = {
    'RETAIL': ['Urban', 'Ivy', 'Summit', 'Harbor', 'Meridian', 'Horizon', 'Coastal', 'Alpine', 'Prism', 'Metro'],
    'ONLINE': ['Atlas', 'Nimble', 'Bright', 'Clear', 'Evolve', 'Elevate', 'Wave', 'Peak', 'Spark', 'Lunar'],
    'EDUCATION': ['Spark', 'Summit', 'Pioneer', 'Discovery', 'Horizon', 'Quest', 'Insight', 'Legacy', 'Beacon', 'Vertex'],
    'HOSPITALITY': ['Haven', 'Oasis', 'Horizon', 'Skyline', 'Meridian', 'Serenity', 'Utopia', 'Comfort', 'Mosaic', 'Elite'],
    'ENTERTAINMENT': ['Pulse', 'Encore', 'Spotlight', 'Echo', 'Zenith', 'Prism', 'Spectrum', 'Anthem', 'Harmony', 'Spark'],
    'HEALTHCARE': ['Vitality', 'Wellness', 'Balance', 'Restore', 'Harmony', 'Thrive', 'Tranquil', 'Serene', 'Revive', 'Core'],
  };
  
  const suffixes = [
    'Group', 'Hub', 'Connect', 'Center', 'Network', 'Studios', 'Partners', 'Labs', 
    'Solutions', 'Exchange', 'Global', 'Works', 'Collective', 'Ventures', 'Dynamics'
  ];
  
  // Handle case where category doesn't exist in prefixes
  if (!prefixes[category]) {
    console.log(`Warning: Category ${category} not found in name prefixes, using default names`);
    // Use a random set of prefixes as fallback
    const allPrefixArrays = Object.values(prefixes);
    const randomPrefixArray = allPrefixArrays[Math.floor(Math.random() * allPrefixArrays.length)];
    const randomPrefix = randomPrefixArray[Math.floor(Math.random() * randomPrefixArray.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${randomPrefix} ${randomSuffix}`;
  }
  
  // Get a random prefix for the category
  const prefix = prefixes[category][Math.floor(Math.random() * prefixes[category].length)];
  
  // Sometimes add a suffix
  const shouldAddSuffix = Math.random() > 0.5;
  if (shouldAddSuffix) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix}`;
  }
  
  return prefix;
}

// Generate a natural description for the entity
function generateEntityDescription(name, category) {
  const descriptions = {
    'RETAIL': [
      `${name} offers a curated collection of premium products with a focus on quality and customer experience.`,
      `${name} is a modern retail destination known for its innovative approach to merchandising and customer service.`,
      `At ${name}, we believe in providing exceptional value through carefully selected products and personalized shopping experiences.`,
    ],
    'ONLINE': [
      `${name} is a digital platform designed to connect users with the resources and services they need in today's fast-paced world.`,
      `${name} provides intuitive digital solutions that help users achieve their goals through streamlined technology and thoughtful design.`,
      `${name} is redefining the digital landscape with user-centric tools and services built for the modern web experience.`,
    ],
    'EDUCATION': [
      `${name} is dedicated to fostering growth through innovative learning approaches and comprehensive educational programs.`,
      `At ${name}, we believe in empowering individuals through knowledge and skills development tailored to today's evolving needs.`,
      `${name} creates enriching learning environments where curiosity and achievement are celebrated through thoughtful curriculum design.`,
    ],
    'HOSPITALITY': [
      `${name} creates memorable experiences through attentive service and thoughtfully designed spaces that feel like a home away from home.`,
      `At ${name}, hospitality is reimagined through a blend of comfort, style, and personalized attention to every guest's needs.`,
      `${name} is where exceptional service meets contemporary comfort, creating spaces that welcome and inspire every visitor.`,
    ],
    'ENTERTAINMENT': [
      `${name} delivers unforgettable experiences that transport audiences to new worlds through innovative performances and immersive events.`,
      `At ${name}, entertainment becomes art through carefully crafted experiences that engage, inspire, and delight audiences of all ages.`,
      `${name} is a premier destination for those seeking exceptional entertainment that pushes boundaries and creates lasting memories.`,
    ],
    'HEALTHCARE': [
      `${name} is committed to whole-person wellness through comprehensive care approaches that address both physical and emotional health.`,
      `At ${name}, healthcare is delivered with compassion and expertise, focusing on prevention and personalized treatment plans.`,
      `${name} provides innovative health solutions that empower individuals to take control of their wellbeing with professional guidance.`,
    ],
  };
  
  // Handle case where category doesn't exist in descriptions
  if (!descriptions[category]) {
    console.log(`Warning: Category ${category} not found in descriptions, using default descriptions`);
    // Default descriptions for any category
    const defaultDescriptions = [
      `${name} is an innovative organization dedicated to excellence in all aspects of our operations.`,
      `At ${name}, we prioritize quality, service, and customer satisfaction through our industry-leading approach.`,
      `${name} combines traditional values with modern innovation to deliver exceptional experiences for our customers.`
    ];
    return defaultDescriptions[Math.floor(Math.random() * defaultDescriptions.length)];
  }
  
  const categoryDescriptions = descriptions[category];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

// Generate random coordinates for physical locations
function generateRandomCoordinates() {
  // Generate coordinates in reasonable ranges
  const latitude = (Math.random() * 180 - 90).toFixed(6);
  const longitude = (Math.random() * 360 - 180).toFixed(6);
  return { latitude, longitude };
}

// Generate realistic content for an entity
function generateEntityContent(entityId, entityName, category) {
  const contentTypes = {
    'RETAIL': ['product', 'promotion', 'event', 'review'],
    'ONLINE': ['article', 'service', 'tool', 'community'],
    'EDUCATION': ['course', 'program', 'resource', 'event'],
    'HOSPITALITY': ['service', 'menu', 'room', 'event'],
    'ENTERTAINMENT': ['show', 'event', 'attraction', 'experience'],
    'HEALTHCARE': ['service', 'specialist', 'treatment', 'program'],
  };
  
  // Default content types for unknown categories
  const defaultContentTypes = ['article', 'event', 'service', 'review'];
  
  // Handle case where category doesn't exist in contentTypes
  let contentType;
  if (!contentTypes[category]) {
    console.log(`Warning: Category ${category} not found in content types, using default content types`);
    contentType = defaultContentTypes[Math.floor(Math.random() * defaultContentTypes.length)];
  } else {
    contentType = contentTypes[category][Math.floor(Math.random() * contentTypes[category].length)];
  }
  
  // Title templates
  const titleTemplates = {
    'product': [
      `New Collection at ${entityName}`, 
      `Exclusive Products from ${entityName}`, 
      `Featured Items at ${entityName}`
    ],
    'promotion': [
      `Limited Time Offer at ${entityName}`, 
      `Special Promotion: ${entityName} Summer Collection`, 
      `${entityName} Seasonal Discount`
    ],
    'event': [
      `Upcoming Event at ${entityName}`, 
      `Join Us: ${entityName} Community Gathering`, 
      `${entityName} Presents: Industry Insights`
    ],
    'review': [
      `Customer Experiences at ${entityName}`, 
      `What People are Saying about ${entityName}`, 
      `${entityName} Customer Testimonials`
    ],
    'article': [
      `Latest Insights from ${entityName}`, 
      `${entityName} Industry Perspectives`, 
      `Thought Leadership: ${entityName}`
    ],
    'service': [
      `Services Offered by ${entityName}`, 
      `How ${entityName} Can Help You`, 
      `Professional Services at ${entityName}`
    ],
    'tool': [
      `Tools Available at ${entityName}`, 
      `${entityName} Professional Resources`, 
      `Digital Solutions from ${entityName}`
    ],
    'community': [
      `Join the ${entityName} Community`, 
      `${entityName} Network Opportunities`, 
      `Connect with ${entityName}`
    ],
    'course': [
      `Courses Offered by ${entityName}`, 
      `Learn with ${entityName}`, 
      `Educational Opportunities at ${entityName}`
    ],
    'program': [
      `Programs at ${entityName}`, 
      `${entityName} Educational Tracks`, 
      `Professional Development with ${entityName}`
    ],
    'resource': [
      `Resources from ${entityName}`, 
      `${entityName} Knowledge Center`, 
      `Helpful Guides from ${entityName}`
    ],
    'menu': [
      `Seasonal Menu at ${entityName}`, 
      `Culinary Offerings at ${entityName}`, 
      `${entityName} Signature Dishes`
    ],
    'room': [
      `Accommodations at ${entityName}`, 
      `Stay with ${entityName}`, 
      `Room Options at ${entityName}`
    ],
    'show': [
      `Current Shows at ${entityName}`, 
      `${entityName} Performances`, 
      `Entertainment at ${entityName}`
    ],
    'attraction': [
      `Attractions at ${entityName}`, 
      `Must-See at ${entityName}`, 
      `${entityName} Featured Experiences`
    ],
    'experience': [
      `Experiences at ${entityName}`, 
      `Unique Offerings from ${entityName}`, 
      `${entityName} Signature Experiences`
    ],
    'specialist': [
      `Meet the Specialists at ${entityName}`, 
      `Expert Team at ${entityName}`, 
      `${entityName} Professional Network`
    ],
    'treatment': [
      `Treatments at ${entityName}`, 
      `${entityName} Wellness Options`, 
      `Health Services at ${entityName}`
    ],
  };
  
  // Default titles if content type not found
  const titles = titleTemplates[contentType] || [`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} at ${entityName}`];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  // Description templates based on content type
  const descriptionTemplates = {
    'product': [
      `Discover our latest collection at ${entityName}, featuring premium quality and innovative design to enhance your lifestyle.`,
      `Our signature products at ${entityName} represent the perfect blend of form and function, crafted with attention to detail.`,
      `Explore the exclusive selection at ${entityName}, where we curate exceptional products that meet our rigorous standards.`
    ],
    'promotion': [
      `For a limited time, enjoy special pricing on select items at ${entityName}. Visit us to take advantage of these seasonal offers.`,
      `${entityName} is excited to announce our special promotion, offering exceptional value on premium selections.`,
      `Don't miss our current promotion at ${entityName} – the perfect opportunity to experience our most popular offerings.`
    ],
    'event': [
      `Join us for an upcoming event at ${entityName}, where we'll explore trending topics and connect with like-minded individuals.`,
      `${entityName} is hosting a special gathering featuring industry experts and innovative presentations.`,
      `Our next event at ${entityName} promises to deliver valuable insights and meaningful connections in a welcoming environment.`
    ],
    'review': [
      `Hear what our customers are saying about their experiences with ${entityName} and how we've helped them achieve their goals.`,
      `Read authentic testimonials from ${entityName} clients who have shared their journey with our products and services.`,
      `Discover why customers choose ${entityName} through real experiences shared by our community.`
    ],
    'article': [
      `Stay informed with the latest insights from ${entityName}, where we explore industry trends and practical applications.`,
      `${entityName}'s thought leadership article provides valuable perspective on evolving developments in our field.`,
      `Read our latest publication from ${entityName} that addresses key challenges and innovative solutions.`
    ]
  };
  
  // Generate a default description if content type not found
  const defaultDescriptions = [
    `Learn more about our offerings at ${entityName} and how they can enhance your experience.`,
    `${entityName} provides exceptional quality and service in everything we offer.`,
    `Discover what makes ${entityName} a leader in our field through our dedicated approach.`
  ];
  
  const descriptions = descriptionTemplates[contentType] || defaultDescriptions;
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // URL structure
  const url = `https://example.com/${category.toLowerCase()}/${entityName.replace(/\s+/g, '-').toLowerCase()}/${contentType}`;
  
  // Thumbnail URL based on content type
  const thumbnailUrl = `https://source.unsplash.com/random/300x200/?${contentType},${category.toLowerCase()}`;
  
  return {
    entityId: entityId,
    title,
    description,
    url,
    thumbnailUrl,
    type: contentType.toUpperCase(),
  };
}

// Create entities and their content
async function createEntities() {
  console.log('Starting entity generation...');
  
  const createdEntities = [];
  const createdContent = [];
  
  try {
    // For each category, create 3-5 entities
    for (const category of ENTITY_CATEGORIES) {
      const numEntities = Math.floor(Math.random() * 3) + 3; // 3-5 entities per category
      
      console.log(`Creating ${numEntities} entities for category ${category}...`);
      
      for (let i = 0; i < numEntities; i++) {
        const entityName = generateEntityName(category);
        const entityDescription = generateEntityDescription(entityName, category);
        
        // Generate icon URL based on category
        const categoryBase = category.toLowerCase();
        const iconUrl = `https://source.unsplash.com/random/100x100/?${categoryBase},icon`;
        
        try {
          // Check if entity with this name already exists
          const existingEntity = await db
            .select()
            .from(schema.entities)
            .where(eq(schema.entities.name, entityName))
            .limit(1);
            
          let entity;
          
          if (existingEntity.length > 0) {
            // Entity already exists, use the existing one
            entity = existingEntity[0];
            console.log(`Using existing entity: ${entityName} (ID: ${entity.id})`);
          } else {
            // Create the coordinates for physical entities
            const coordinates = ENTITY_TYPES[category] === 'PHYSICAL' ? generateRandomCoordinates() : null;
            
            // Insert the entity in the dedicated entities table
            const [newEntity] = await db
              .insert(schema.entities)
              .values({
                name: entityName,
                category,
                description: entityDescription,
                entityType: ENTITY_TYPES[category],
                iconUrl,
                coordinates
              })
              .returning();
            
            entity = newEntity;
            console.log(`Created entity: ${entityName} (ID: ${entity.id})`);
          }
          
          createdEntities.push(entity);
          
          // Create 2-4 content items for each entity
          const numContentItems = Math.floor(Math.random() * 3) + 2; // 2-4 content items
          
          for (let j = 0; j < numContentItems; j++) {
            const contentData = generateEntityContent(entity.id, entityName, category);
            
            // Update the content creation to use the entity_content table
            const [content] = await db
              .insert(schema.entityContent)
              .values({
                entityId: entity.id,
                title: contentData.title,
                description: contentData.description,
                url: contentData.url,
                thumbnailUrl: contentData.thumbnailUrl,
                type: contentData.type
              })
              .returning();
            
            createdContent.push(content);
            console.log(`Created content: ${content.title} for entity ${entityName}`);
          }
        } catch (error) {
          console.error(`Error creating entity ${entityName}:`, error);
        }
      }
    }
    
    console.log(`Successfully created ${createdEntities.length} entities with ${createdContent.length} content items`);
    return { entities: createdEntities, content: createdContent };
    
  } catch (error) {
    console.error('Error in entity creation process:', error);
    throw error;
  }
}

// Check if we're in preview mode
const isPreviewMode = process.argv.includes('--preview');

if (isPreviewMode) {
  // Preview mode - don't save to database
  console.log('PREVIEW MODE: Generating sample entities without saving to database');
  
  // Generate some sample entities
  const previewEntities = [];
  
  for (const category of ENTITY_CATEGORIES) {
    const entityName = generateEntityName(category);
    const entityDescription = generateEntityDescription(entityName, category);
    const coordinates = generateRandomCoordinates();
    
    previewEntities.push({
      name: entityName,
      description: entityDescription,
      type: ENTITY_TYPES[category] || 'PHYSICAL',
      category: category,
      coordinates
    });
    
    // Generate 1-2 sample content items
    const contentItems = [];
    const numContent = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numContent; i++) {
      const contentTitle = generateEntityContent(999, entityName, category).title;
      contentItems.push(contentTitle);
    }
    
    console.log(`[PREVIEW] Entity: ${entityName} (${category})`);
    console.log(`  Description: ${entityDescription}`);
    console.log(`  Content: ${contentItems.join(', ')}`);
    console.log('');
  }
  
  console.log(`[PREVIEW] Would create ${previewEntities.length} entities (not saved)`);
  process.exit(0);
} else {
  // Normal mode - save to database
  // Call the function to create entities
  createEntities()
    .then((result) => {
      console.log('Entity generation complete!');
      console.log(`Created ${result.entities.length} entities and ${result.content.length} content items`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to generate entities:', error);
      process.exit(1);
    });
}