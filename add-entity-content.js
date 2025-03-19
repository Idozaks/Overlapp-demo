/**
 * Entity Content Generator Script
 * 
 * This script adds rich content to all entities in the database.
 * It generates different types of content (reviews, events, products, posts)
 * based on the entity type and category.
 */

import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper function to generate random date within the last year
function getRandomDate() {
  const now = new Date();
  const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const timestamp = pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime());
  return new Date(timestamp);
}

// Function to format date
function formatDate(date) {
  return date.toISOString();
}

// Generate different types of content based on entity type and category
function generateContentForEntity(entity) {
  const contentItems = [];
  const contentTypes = ['review', 'event', 'product', 'post', 'promotion', 'update'];
  
  // Number of content items to generate per entity (3-7)
  const numItems = Math.floor(Math.random() * 5) + 3;
  
  for (let i = 0; i < numItems; i++) {
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    const date = getRandomDate();
    let content = '';
    
    switch (contentType) {
      case 'review':
        const ratings = ['excellent', 'good', 'average', 'poor'];
        const rating = ratings[Math.floor(Math.random() * ratings.length)];
        content = generateReview(entity, rating);
        break;
      case 'event':
        content = generateEvent(entity);
        break;
      case 'product':
        content = generateProduct(entity);
        break;
      case 'post':
        content = generatePost(entity);
        break;
      case 'promotion':
        content = generatePromotion(entity);
        break;
      case 'update':
        content = generateUpdate(entity);
        break;
    }
    
    contentItems.push({
      entityId: entity.id,
      contentType,
      content,
      createdAt: formatDate(date)
    });
  }
  
  return contentItems;
}

// Generate a review based on entity type
function generateReview(entity, rating) {
  const reviewPhrases = {
    excellent: [
      `Absolutely love ${entity.name}! The quality is outstanding and the experience is unmatched.`,
      `${entity.name} exceeds all expectations. Definitely a 5-star experience!`,
      `Incredible service at ${entity.name}. Can't recommend enough.`
    ],
    good: [
      `${entity.name} offers good value and reliable service overall.`,
      `Enjoyed my experience with ${entity.name}. A few small issues but nothing major.`,
      `${entity.name} is definitely above average in its category. Would visit again.`
    ],
    average: [
      `${entity.name} is adequate but nothing special compared to competitors.`,
      `Had an acceptable experience at ${entity.name}, though there's room for improvement.`,
      `${entity.name} meets basic expectations but doesn't go above and beyond.`
    ],
    poor: [
      `Disappointed with my experience at ${entity.name}. Several issues need addressing.`,
      `${entity.name} fell short of expectations in multiple ways.`,
      `Had some problems with ${entity.name} that made the experience frustrating.`
    ]
  };
  
  const reviews = reviewPhrases[rating];
  return reviews[Math.floor(Math.random() * reviews.length)];
}

// Generate an event based on entity type and category
function generateEvent(entity) {
  const eventTemplates = [
    `Upcoming ${entity.category} showcase at ${entity.name} - Join us for an exciting presentation!`,
    `${entity.name} community gathering - Connect with others interested in ${entity.category}`,
    `Special workshop hosted by ${entity.name} experts - Learn new skills and insights`,
    `${entity.name} anniversary celebration with special offers and activities`,
    `Seasonal event at ${entity.name} featuring guest speakers and demonstrations`
  ];
  
  return eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
}

// Generate a product based on entity category
function generateProduct(entity) {
  const productTemplates = [
    `New arrival at ${entity.name}: Premium ${entity.category} collection now available`,
    `Featured product at ${entity.name}: Exclusive ${entity.category} item with special pricing`,
    `${entity.name} bestseller: Our most popular ${entity.category} offering loved by customers`,
    `Limited edition ${entity.category} product now at ${entity.name} - Available while supplies last`,
    `Seasonal ${entity.category} selection now featured at ${entity.name}`
  ];
  
  return productTemplates[Math.floor(Math.random() * productTemplates.length)];
}

// Generate a general post for the entity
function generatePost(entity) {
  const postTemplates = [
    `${entity.name} is proud to support local community initiatives in ${entity.category}`,
    `Behind the scenes at ${entity.name}: How we maintain quality in everything we do`,
    `The story of ${entity.name}: Our journey and commitment to excellence in ${entity.category}`,
    `Customer spotlight: See how ${entity.name} has helped clients achieve their goals`,
    `Industry insights from ${entity.name}: Trends and developments in ${entity.category}`
  ];
  
  return postTemplates[Math.floor(Math.random() * postTemplates.length)];
}

// Generate a promotion
function generatePromotion(entity) {
  const promoTemplates = [
    `Limited time offer at ${entity.name}: Special discounts on selected ${entity.category} items`,
    `Members-only promotion at ${entity.name}: Join our loyalty program for exclusive benefits`,
    `Holiday special at ${entity.name}: Celebrate with our seasonal ${entity.category} offerings`,
    `Referral bonus: Introduce friends to ${entity.name} and both receive special perks`,
    `Flash sale at ${entity.name}: 24-hour special pricing on premium ${entity.category} selections`
  ];
  
  return promoTemplates[Math.floor(Math.random() * promoTemplates.length)];
}

// Generate an update about the entity
function generateUpdate(entity) {
  const updateTemplates = [
    `${entity.name} has expanded our ${entity.category} offerings with new additions`,
    `Exciting improvements at ${entity.name}: Enhanced facilities and services`,
    `${entity.name} now offers extended hours to better serve our community`,
    `New team members joining ${entity.name} to provide expert ${entity.category} guidance`,
    `${entity.name} has updated our approach to ${entity.category} with latest industry standards`
  ];
  
  return updateTemplates[Math.floor(Math.random() * updateTemplates.length)];
}

// Main function to get all entities and add content
async function addContentToAllEntities() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    console.log('Fetching all entities...');
    const entitiesResult = await client.query('SELECT * FROM entities');
    const entities = entitiesResult.rows;
    
    console.log(`Found ${entities.length} entities. Adding content...`);
    
    // Count for tracking progress
    let processed = 0;
    let totalContentItems = 0;
    
    for (const entity of entities) {
      // Generate content for this entity
      const contentItems = generateContentForEntity(entity);
      totalContentItems += contentItems.length;
      
      // Insert each content item
      for (const item of contentItems) {
        await client.query(
          'INSERT INTO entity_content (entity_id, content_type, content, created_at) VALUES ($1, $2, $3, $4)',
          [item.entityId, item.contentType, item.content, item.createdAt]
        );
      }
      
      processed++;
      if (processed % 10 === 0 || processed === entities.length) {
        console.log(`Progress: ${processed}/${entities.length} entities processed`);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log(`Successfully added ${totalContentItems} content items to ${entities.length} entities.`);
  } catch (e) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error adding content to entities:', e);
    throw e;
  } finally {
    client.release();
  }
}

// Execute the main function
addContentToAllEntities()
  .then(() => {
    console.log('Content generation complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error in content generation process:', err);
    process.exit(1);
  });