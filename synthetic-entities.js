/**
 * Entity Generator Script
 * 
 * This script generates entities such as stores, websites, and physical locations
 * for testing purposes. These entities represent a diverse range of businesses
 * and organizations for the platform.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema.js';

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
  
  const contentType = contentTypes[category][Math.floor(Math.random() * contentTypes[category].length)];
  
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
    interestId: entityId,
    title,
    description,
    url,
    thumbnailUrl,
    type: contentType.toUpperCase(),
  };
}

// Create entities and their content
async function createEntities(previewMode = false) {
  if (previewMode) {
    console.log('PREVIEW MODE: Generating sample entities without saving to database');
  } else {
    console.log('Starting entity generation...');
  }
  
  const createdEntities = [];
  const createdContent = [];
  
  try {
    // For preview mode, only create a sample of entities
    const categoriesToUse = previewMode 
      ? ENTITY_CATEGORIES.slice(0, 3) // Use just first 3 categories for preview
      : ENTITY_CATEGORIES;
    
    // For each category, create entities
    for (const category of categoriesToUse) {
      // Limit number of entities in preview mode
      const numEntities = previewMode ? 2 : Math.floor(Math.random() * 3) + 3; // 3-5 entities in regular mode
      
      if (previewMode) {
        console.log(`\n[PREVIEW] Entity: ${generateEntityName(category)} (${category})`);
      } else {
        console.log(`Creating ${numEntities} entities for category ${category}...`);
      }
      
      for (let i = 0; i < numEntities; i++) {
        const entityName = generateEntityName(category);
        const entityDescription = generateEntityDescription(entityName, category);
        
        // Generate icon URL based on category
        const categoryBase = category.toLowerCase();
        const iconUrl = `https://source.unsplash.com/random/100x100/?${categoryBase},icon`;
        
        if (previewMode) {
          console.log(`  Description: ${entityDescription}`);
          
          // Show sample content in preview mode
          const contentSamples = [];
          const numContentItems = 2; // Just show 2 samples in preview
          
          for (let j = 0; j < numContentItems; j++) {
            const contentData = generateEntityContent(j+1, entityName, category);
            contentSamples.push(contentData.title);
          }
          
          console.log(`  Content: ${contentSamples.join(', ')}`);
          
          // Still store in memory for reporting
          createdEntities.push({
            id: createdEntities.length + 1,
            name: entityName,
            category,
            description: entityDescription,
            iconUrl
          });
        } else {
          try {
            // Insert the entity as an interest
            const [entity] = await db
              .insert(schema.interests)
              .values({
                name: entityName,
                category,
                description: entityDescription,
                iconUrl,
              })
              .returning();
            
            createdEntities.push(entity);
            console.log(`Created entity: ${entityName} (ID: ${entity.id})`);
            
            // Create 2-4 content items for each entity
            const numContentItems = Math.floor(Math.random() * 3) + 2; // 2-4 content items
            
            for (let j = 0; j < numContentItems; j++) {
              const contentData = generateEntityContent(entity.id, entityName, category);
              
              const [content] = await db
                .insert(schema.interestContent)
                .values(contentData)
                .returning();
              
              createdContent.push(content);
              console.log(`Created content: ${content.title} for entity ${entityName}`);
            }
          } catch (error) {
            console.error(`Error creating entity ${entityName}:`, error);
          }
        }
      }
    }
    
    if (previewMode) {
      console.log(`\n[PREVIEW] Would create ${createdEntities.length} entities (not saved)`);
    } else {
      console.log(`Successfully created ${createdEntities.length} entities with ${createdContent.length} content items`);
    }
    
    return { entities: createdEntities, content: createdContent };
    
  } catch (error) {
    console.error('Error in entity creation process:', error);
    throw error;
  }
}

// Check for preview mode flag
const isPreviewMode = process.argv.includes('--preview');

// Call the function to create entities
createEntities(isPreviewMode)
  .then((result) => {
    if (isPreviewMode) {
      console.log('Preview complete - no data was saved to the database');
    } else {
      console.log('Entity generation complete!');
      console.log(`Created ${result.entities.length} entities and ${result.content.length} content items`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate entities:', error);
    process.exit(1);
  });