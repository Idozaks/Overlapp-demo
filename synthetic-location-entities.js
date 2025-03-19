/**
 * Location Entity Generator Script
 * 
 * This script generates location entities with appropriate content
 * for testing purposes. The locations represent physical places 
 * that can be used for analyzing overlaps between users.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './server/db.js';

dotenv.config();

// Get current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Location categories
const LOCATION_CATEGORIES = [
  'CAFE',
  'RESTAURANT',
  'BAR',
  'PARK',
  'LIBRARY',
  'MUSEUM',
  'GALLERY',
  'GYM',
  'YOGA_STUDIO',
  'COWORKING_SPACE',
  'THEATER',
  'CONCERT_VENUE',
  'SHOPPING_MALL',
  'BOUTIQUE',
  'BOOKSTORE',
  'MARKET',
  'UNIVERSITY',
  'COMMUNITY_CENTER',
  'HOTEL',
  'BEACH',
  'AIRPORT',
  'TRAIN_STATION',
  'BUS_TERMINAL',
  'SPORTS_COMPLEX'
];

// Generate a location name based on the category
function generateLocationName(locationType) {
  const prefixes = {
    CAFE: ['Corner', 'Urban', 'Daily', 'The', 'Cozy', 'Sunrise', 'Green', 'Blue', 'Red', 'Golden'],
    RESTAURANT: ['Royal', 'Garden', 'Coastal', 'Fusion', 'Savory', 'Gourmet', 'Traditional', 'The', 'Old', 'New'],
    BAR: ['Hidden', 'The', 'Downtown', 'Uptown', 'Vintage', 'Classic', 'Modern', 'Craft', 'Speakeasy', 'Night'],
    PARK: ['Central', 'Riverside', 'Memorial', 'Heritage', 'Sunset', 'Green', 'Community', 'City', 'Nature', 'Family'],
    LIBRARY: ['Central', 'City', 'Public', 'Memorial', 'Heritage', 'Community', 'University', 'Grand', 'Metropolitan', 'District'],
    MUSEUM: ['National', 'Modern', 'Metropolitan', 'Contemporary', 'Historical', 'City', 'Heritage', 'Science', 'Art', 'Natural'],
    GALLERY: ['Contemporary', 'Modern', 'Fine', 'Urban', 'Avant-garde', 'Traditional', 'Local', 'International', 'Exclusive', 'The'],
    GYM: ['Fitness', 'Elite', 'Power', 'Strength', 'Ultimate', 'Total', 'Peak', 'Iron', 'City', 'Pro'],
    YOGA_STUDIO: ['Serenity', 'Harmony', 'Balance', 'Peaceful', 'Zen', 'Mindful', 'Flow', 'Essence', 'Pure', 'Centered'],
    COWORKING_SPACE: ['Hub', 'Collaborative', 'Creative', 'Innovative', 'Connect', 'Share', 'Urban', 'Central', 'The', 'Work'],
    THEATER: ['Grand', 'Royal', 'National', 'Palace', 'City', 'Metropolitan', 'Classic', 'Modern', 'Historic', 'The'],
    CONCERT_VENUE: ['Arena', 'Hall', 'Stadium', 'Center', 'Pavilion', 'Amphitheater', 'Auditorium', 'Stage', 'The', 'Live'],
    SHOPPING_MALL: ['Grand', 'City', 'Metro', 'Central', 'Plaza', 'Galleria', 'Premium', 'Royal', 'Uptown', 'The'],
    BOUTIQUE: ['Elegant', 'Chic', 'Exclusive', 'Premium', 'Unique', 'Stylish', 'Luxury', 'Modern', 'Classic', 'The'],
    BOOKSTORE: ['Corner', 'City', 'Book', 'Reader\'s', 'Page', 'Story', 'Literary', 'Word', 'Novel', 'The'],
    MARKET: ['Farmer\'s', 'City', 'Fresh', 'Local', 'Artisan', 'Organic', 'Central', 'Traditional', 'Gourmet', 'Grand'],
    UNIVERSITY: ['National', 'City', 'Metropolitan', 'International', 'Global', 'Central', 'State', 'Regional', 'Technical', 'Liberal'],
    COMMUNITY_CENTER: ['City', 'Town', 'Neighborhood', 'Local', 'Regional', 'Central', 'Cultural', 'Heritage', 'Civic', 'Community'],
    HOTEL: ['Grand', 'Royal', 'Plaza', 'Continental', 'Palace', 'Luxury', 'Boutique', 'Regent', 'Metropolitan', 'International'],
    BEACH: ['Golden', 'Sandy', 'Palm', 'Sunset', 'Crystal', 'Paradise', 'Ocean', 'Tropical', 'Bay', 'Coastal'],
    AIRPORT: ['International', 'City', 'Metropolitan', 'Regional', 'National', 'Central', 'Global', 'Continental', 'Major', 'Main'],
    TRAIN_STATION: ['Central', 'City', 'Main', 'Metropolitan', 'Union', 'Terminal', 'Junction', 'Grand', 'Railway', 'Transit'],
    BUS_TERMINAL: ['Central', 'City', 'Main', 'Metropolitan', 'Transit', 'Terminal', 'Regional', 'Express', 'Station', 'Hub'],
    SPORTS_COMPLEX: ['National', 'City', 'Olympic', 'Sports', 'Athletic', 'Stadium', 'Arena', 'Center', 'Field', 'Complex']
  };
  
  const suffixes = {
    CAFE: ['Café', 'Coffee', 'Espresso', 'Brew', 'Cup', 'Bean', 'Roastery', 'Coffee House', 'Bistro', 'Beanery'],
    RESTAURANT: ['Restaurant', 'Bistro', 'Kitchen', 'Eatery', 'Dining', 'Table', 'Cuisine', 'Grill', 'House', 'Place'],
    BAR: ['Bar', 'Lounge', 'Pub', 'Tavern', 'Spirits', 'Social', 'Brew', 'Distillery', 'Room', 'Club'],
    PARK: ['Park', 'Gardens', 'Reserve', 'Grounds', 'Woods', 'Meadows', 'Recreation Area', 'Common', 'Fields', 'Oasis'],
    LIBRARY: ['Library', 'Reading Room', 'Book Center', 'Media Center', 'Archives', 'Learning Center', 'Resource Center', 'Collection', 'Knowledge Center', 'Information Center'],
    MUSEUM: ['Museum', 'Gallery', 'Exhibition', 'Collection', 'Heritage Center', 'Cultural Center', 'Historical Center', 'Institute', 'Showcase', 'Exhibit'],
    GALLERY: ['Gallery', 'Exhibition', 'Collection', 'Art Space', 'Studio', 'Showcase', 'Art Center', 'Exhibition Hall', 'Salon', 'Display'],
    GYM: ['Gym', 'Fitness', 'Athletic Club', 'Health Club', 'Fitness Center', 'Training Center', 'Workout Center', 'Exercise Studio', 'Wellness Center', 'Strength Center'],
    YOGA_STUDIO: ['Yoga', 'Studio', 'Center', 'Space', 'Practice', 'Haven', 'Sanctuary', 'Room', 'Flow', 'Retreat'],
    COWORKING_SPACE: ['Coworking', 'Space', 'Office', 'Hub', 'Station', 'Center', 'Workspace', 'Studio', 'Labs', 'Commons'],
    THEATER: ['Theater', 'Cinema', 'Playhouse', 'Stage', 'Performance Center', 'Arts Center', 'Auditorium', 'Venue', 'Hall', 'House'],
    CONCERT_VENUE: ['Hall', 'Arena', 'Stadium', 'Center', 'Venue', 'Auditorium', 'Theatre', 'Stage', 'Amphitheater', 'Coliseum'],
    SHOPPING_MALL: ['Mall', 'Plaza', 'Center', 'Galleria', 'Shopping Center', 'Promenade', 'Square', 'Market', 'Shopping District', 'Arcade'],
    BOUTIQUE: ['Boutique', 'Shop', 'Store', 'Emporium', 'Collection', 'Atelier', 'Showroom', 'Gallery', 'Fashion House', 'Studio'],
    BOOKSTORE: ['Books', 'Book Shop', 'Bookstore', 'Book Nook', 'Book Haven', 'Bookshop', 'Reading Room', 'Literary Shop', 'Book Corner', 'Book Center'],
    MARKET: ['Market', 'Marketplace', 'Bazaar', 'Exchange', 'Trading Post', 'Square', 'Emporium', 'Mart', 'Mercantile', 'Trading Center'],
    UNIVERSITY: ['University', 'College', 'Academy', 'Institute', 'School', 'Educational Center', 'Learning Center', 'Center of Excellence', 'Studies', 'Learning'],
    COMMUNITY_CENTER: ['Community Center', 'Hall', 'Hub', 'House', 'Space', 'Building', 'Complex', 'Facility', 'Commons', 'Meeting Hall'],
    HOTEL: ['Hotel', 'Resort', 'Inn', 'Suites', 'Lodge', 'Residences', 'Retreat', 'House', 'Accommodations', 'Stay'],
    BEACH: ['Beach', 'Sands', 'Shores', 'Cove', 'Bay', 'Coast', 'Strand', 'Seaside', 'Peninsula', 'Waterfront'],
    AIRPORT: ['Airport', 'International', 'Air Hub', 'Air Terminal', 'Airways', 'Air Center', 'Aerodrome', 'Air Field', 'Aviation Center', 'Flight Center'],
    TRAIN_STATION: ['Station', 'Terminal', 'Depot', 'Railways', 'Train Hub', 'Rail Center', 'Rail Terminal', 'Transport Center', 'Rail Stop', 'Transit Point'],
    BUS_TERMINAL: ['Terminal', 'Station', 'Depot', 'Transport Center', 'Bus Station', 'Transit Station', 'Hub', 'Bus Center', 'Transport Hub', 'Coach Station'],
    SPORTS_COMPLEX: ['Complex', 'Arena', 'Stadium', 'Center', 'Field', 'Park', 'Grounds', 'Gymnasium', 'Athletic Center', 'Sports Center']
  };
  
  // Adjectives to make names more diverse
  const adjectives = [
    'Sunny', 'Vibrant', 'Peaceful', 'Elegant', 'Rustic', 'Charming', 'Modern', 'Classic', 'Traditional', 'Colorful',
    'Quiet', 'Busy', 'Central', 'Urban', 'Downtown', 'Uptown', 'Riverside', 'Seaside', 'Countryside', 'Metropolitan',
    'Local', 'International', 'Global', 'Regional', 'National', 'Iconic', 'Historic', 'Contemporary', 'Innovative', 'Exclusive'
  ];
  
  // Get random elements
  const prefix = prefixes[locationType][Math.floor(Math.random() * prefixes[locationType].length)];
  const suffix = suffixes[locationType][Math.floor(Math.random() * suffixes[locationType].length)];
  
  // 30% chance to add an adjective to make names more diverse
  if (Math.random() < 0.3) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${prefix} ${adjective} ${suffix}`;
  }
  
  return `${prefix} ${suffix}`;
}

// Generate a description for a location entity
function generateLocationDescription(name, locationType) {
  const descriptions = {
    CAFE: [
      `${name} is a cozy spot offering artisanal coffee, fresh pastries, and a relaxed atmosphere for work or socializing.`,
      `A neighborhood favorite, ${name} serves specialty coffee, light meals, and provides a warm, welcoming environment.`,
      `At ${name}, patrons enjoy premium coffee blends, homemade treats, and a charming ambiance perfect for casual meetings.`
    ],
    RESTAURANT: [
      `${name} offers an exquisite dining experience with innovative cuisine and exceptional service in an elegant setting.`,
      `A culinary destination, ${name} features chef-crafted dishes made with locally-sourced ingredients and seasonal flavors.`,
      `${name} combines traditional recipes with modern techniques, offering a diverse menu in a comfortable, stylish atmosphere.`
    ],
    BAR: [
      `${name} is known for its craft cocktails, extensive selection of spirits, and vibrant nightlife scene.`,
      `A sophisticated lounge, ${name} offers premium drinks, ambient music, and a stylish environment for evening entertainment.`,
      `At ${name}, guests enjoy expertly mixed drinks, local brews, and a lively atmosphere perfect for social gatherings.`
    ],
    PARK: [
      `${name} offers lush green spaces, walking trails, and recreational facilities for outdoor enjoyment and relaxation.`,
      `A serene urban oasis, ${name} features beautiful landscapes, picnic areas, and seasonal activities for all ages.`,
      `${name} provides a natural retreat with scenic views, diverse plant life, and open spaces for sports and leisure.`
    ],
    LIBRARY: [
      `${name} houses an extensive collection of books, digital resources, and quiet study spaces for learning and research.`,
      `A center for knowledge and community, ${name} offers diverse reading materials, educational programs, and media services.`,
      `${name} provides access to literary works, reference materials, and cultural resources in a peaceful, inspiring environment.`
    ],
    MUSEUM: [
      `${name} showcases fascinating exhibits, historical artifacts, and cultural treasures for an enriching experience.`,
      `A cultural institution, ${name} displays significant collections, interactive displays, and educational programming.`,
      `${name} presents compelling exhibitions, rare artifacts, and engaging presentations that illuminate history and art.`
    ],
    GALLERY: [
      `${name} exhibits contemporary and traditional artworks, sculptures, and installations from established and emerging artists.`,
      `A creative space, ${name} showcases diverse artistic expressions, rotating exhibitions, and cultural events.`,
      `${name} presents carefully curated art collections, innovative works, and immersive visual experiences.`
    ],
    GYM: [
      `${name} offers state-of-the-art fitness equipment, expert training, and diverse exercise programs for all fitness levels.`,
      `A modern fitness facility, ${name} provides comprehensive workout options, group classes, and personalized coaching.`,
      `${name} combines cutting-edge exercise technology, professional guidance, and a motivating environment for health goals.`
    ],
    YOGA_STUDIO: [
      `${name} offers a tranquil space for yoga practice, mindfulness, and holistic wellness activities.`,
      `A sanctuary for mind and body, ${name} provides expert instruction in various yoga styles, meditation, and relaxation.`,
      `${name} creates a nurturing environment for personal growth, physical strength, and inner peace through yoga.`
    ],
    COWORKING_SPACE: [
      `${name} provides flexible workspaces, professional amenities, and networking opportunities for remote workers and entrepreneurs.`,
      `A productive environment, ${name} offers modern office facilities, collaboration areas, and business services.`,
      `${name} combines comfortable workstations, meeting rooms, and community events to support professional growth.`
    ],
    THEATER: [
      `${name} presents live performances, theatrical productions, and cultural events in an acoustically designed venue.`,
      `A center for performing arts, ${name} hosts diverse shows, dramatic presentations, and entertainment experiences.`,
      `${name} showcases talented actors, compelling stories, and artistic expressions in an intimate setting.`
    ],
    CONCERT_VENUE: [
      `${name} hosts musical performances, concerts, and live events featuring local and international artists.`,
      `A premier music destination, ${name} provides exceptional acoustics, comfortable seating, and unforgettable shows.`,
      `${name} presents diverse musical genres, special performances, and entertainment experiences in an energetic atmosphere.`
    ],
    SHOPPING_MALL: [
      `${name} features a wide range of retail stores, dining options, and entertainment facilities for a complete shopping experience.`,
      `A shopping destination, ${name} houses popular brands, specialty shops, and leisure activities under one roof.`,
      `${name} offers diverse shopping options, food courts, and recreational areas in a convenient, indoor setting.`
    ],
    BOUTIQUE: [
      `${name} offers carefully selected merchandise, unique items, and personalized shopping assistance in an intimate setting.`,
      `A curated retail experience, ${name} features exclusive products, designer collections, and specialized selections.`,
      `${name} showcases distinctive fashion, accessories, and lifestyle items with attention to quality and style.`
    ],
    BOOKSTORE: [
      `${name} houses an extensive collection of books, literary events, and reading spaces for book lovers.`,
      `A literary haven, ${name} offers diverse genres, rare finds, and a peaceful environment for browsing and discovery.`,
      `${name} combines new releases, classics, and specialized titles with knowledgeable staff and community activities.`
    ],
    MARKET: [
      `${name} brings together vendors offering fresh produce, artisanal goods, and local specialties in a vibrant atmosphere.`,
      `A bustling marketplace, ${name} features diverse food stalls, crafts, and unique products from local producers.`,
      `${name} showcases regional foods, handcrafted items, and seasonal offerings in an authentic shopping experience.`
    ],
    UNIVERSITY: [
      `${name} provides quality education, research opportunities, and a dynamic learning environment across multiple disciplines.`,
      `An academic institution, ${name} offers diverse programs, expert faculty, and comprehensive resources for students.`,
      `${name} combines traditional scholarship, innovative teaching methods, and extensive facilities for intellectual growth.`
    ],
    COMMUNITY_CENTER: [
      `${name} serves as a gathering place offering social activities, educational programs, and community services.`,
      `A neighborhood hub, ${name} hosts cultural events, recreational activities, and support services for residents.`,
      `${name} provides spaces for group meetings, classes, and civic engagement to strengthen community bonds.`
    ],
    HOTEL: [
      `${name} offers comfortable accommodations, attentive service, and amenities for business and leisure travelers.`,
      `A hospitality destination, ${name} provides stylish rooms, dining options, and facilities for a memorable stay.`,
      `${name} combines elegant design, thoughtful amenities, and professional service for an exceptional lodging experience.`
    ],
    BEACH: [
      `${name} features pristine sands, clear waters, and scenic views for relaxation and water activities.`,
      `A coastal retreat, ${name} offers swimming areas, beach facilities, and natural beauty for outdoor enjoyment.`,
      `${name} provides a picturesque setting for sunbathing, water sports, and coastal exploration.`
    ],
    AIRPORT: [
      `${name} serves as a gateway for domestic and international travel with modern facilities and efficient services.`,
      `A transportation hub, ${name} offers passenger terminals, airline services, and connectivity to global destinations.`,
      `${name} provides flight operations, traveler amenities, and transport links in a well-designed aviation facility.`
    ],
    TRAIN_STATION: [
      `${name} connects rail travelers to various destinations with regular service, waiting areas, and passenger facilities.`,
      `A transportation center, ${name} offers train platforms, ticketing services, and connections to urban transit.`,
      `${name} serves rail passengers with scheduled departures, arrival information, and essential travel amenities.`
    ],
    BUS_TERMINAL: [
      `${name} facilitates bus travel with multiple routes, boarding areas, and passenger services.`,
      `A transit point, ${name} provides scheduled bus departures, waiting facilities, and connections to other transportation.`,
      `${name} serves as a hub for local and long-distance bus routes with traveler amenities and information services.`
    ],
    SPORTS_COMPLEX: [
      `${name} houses multiple sports facilities, training areas, and event spaces for athletics and recreation.`,
      `A center for sports activities, ${name} offers specialized venues, fitness facilities, and spaces for competition.`,
      `${name} provides courts, fields, and equipment for diverse sports activities and community recreation.`
    ]
  };
  
  // Choose a random description from the array for this location type
  return descriptions[locationType][Math.floor(Math.random() * descriptions[locationType].length)];
}

// Generate random coordinates for an entity
function generateRandomCoordinates() {
  // Generate coordinates within reasonable bounds
  // Latitude: -90 to 90, Longitude: -180 to 180, but narrowed for more realistic distribution
  const lat = (Math.random() * 170 - 85).toFixed(6);
  const lng = (Math.random() * 360 - 180).toFixed(6);
  
  return { lat, lng };
}

// Generate content for a location entity
function generateLocationContent(entityId, locationName, locationType) {
  const contents = [];
  
  // Generate between 2-4 content items for each location
  const contentCount = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < contentCount; i++) {
    contents.push(generateLocationContentItem(entityId, locationName, locationType, i));
  }
  
  return contents;
}

// Generate a single content item for a location entity
function generateLocationContentItem(entityId, locationName, locationType, index) {
  const contentTypes = ['INFO', 'FEATURES', 'EVENTS', 'PHOTOS', 'REVIEWS', 'HOURS'];
  const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
  
  const titles = {
    INFO: ['About Us', 'Location Information', 'Our Story', 'Visit Information', 'Overview'],
    FEATURES: ['Amenities', 'Special Features', 'Facilities', 'What We Offer', 'Highlights'],
    EVENTS: ['Upcoming Events', 'Regular Activities', 'Special Occasions', 'Calendar', 'What\'s Happening'],
    PHOTOS: ['Photo Gallery', 'Our Space', 'Visual Tour', 'See It Yourself', 'Inside Look'],
    REVIEWS: ['Visitor Experiences', 'What People Say', 'Testimonials', 'Guest Reviews', 'Feedback'],
    HOURS: ['Hours & Availability', 'When to Visit', 'Opening Times', 'Visiting Hours', 'Schedule']
  };
  
  // Content templates based on type and location category
  const contentTemplates = {
    INFO: {
      CAFE: `${locationName} offers a welcoming atmosphere with ethically sourced coffee, homemade pastries, and friendly service. Our café has been serving the community since ${2010 + Math.floor(Math.random() * 12)}.`,
      RESTAURANT: `${locationName} specializes in ${['Mediterranean', 'Asian fusion', 'American', 'Italian', 'French', 'Mexican', 'International'][Math.floor(Math.random() * 7)]} cuisine with an emphasis on fresh, quality ingredients and exceptional dining experiences.`,
      BAR: `${locationName} features a sophisticated selection of ${['craft cocktails', 'fine wines', 'artisanal spirits', 'local beers', 'premium drinks'][Math.floor(Math.random() * 5)]} in a ${['lively', 'relaxed', 'upscale', 'cozy', 'trendy'][Math.floor(Math.random() * 5)]} atmosphere.`,
      PARK: `${locationName} spans ${Math.floor(Math.random() * 100) + 5} acres of beautiful landscapes, featuring ${['walking trails', 'playgrounds', 'botanical gardens', 'sports fields', 'picnic areas'][Math.floor(Math.random() * 5)]}.`,
      LIBRARY: `${locationName} houses over ${(Math.floor(Math.random() * 9) + 1) * 10000} volumes across multiple collections, offering resources for research, education, and leisure reading.`,
      MUSEUM: `${locationName} showcases ${['historical artifacts', 'contemporary art', 'scientific exhibits', 'cultural heritage', 'interactive displays'][Math.floor(Math.random() * 5)]} with rotating and permanent exhibitions.`,
      GALLERY: `${locationName} exhibits works from ${['local artists', 'international creators', 'emerging talents', 'established masters', 'diverse artistic traditions'][Math.floor(Math.random() * 5)]}, with new shows every ${Math.floor(Math.random() * 3) + 1} months.`,
      GYM: `${locationName} provides state-of-the-art equipment, ${['personal training', 'group classes', 'specialized programs', 'fitness assessments', 'wellness coaching'][Math.floor(Math.random() * 5)]}, and a motivating environment for all fitness levels.`,
      YOGA_STUDIO: `${locationName} offers classes in ${['Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Kundalini'][Math.floor(Math.random() * 5)]} yoga, meditation, and mindfulness practices for practitioners of all levels.`,
      COWORKING_SPACE: `${locationName} provides flexible work environments with high-speed internet, meeting rooms, and community events for freelancers, startups, and remote workers.`,
      default: `${locationName} is a ${['popular', 'well-established', 'favorite', 'renowned', 'distinctive'][Math.floor(Math.random() * 5)]} destination offering unique experiences and services for visitors.`
    },
    FEATURES: {
      CAFE: `Our café features ${['comfortable seating', 'outdoor patio', 'free Wi-Fi', 'study spaces', 'local artwork'][Math.floor(Math.random() * 5)]} and serves ${['specialty coffees', 'organic teas', 'fresh pastries', 'light meals', 'vegan options'][Math.floor(Math.random() * 5)]}.`,
      RESTAURANT: `Our establishment offers ${['private dining rooms', 'chef\'s table experiences', 'outdoor seating', 'bar service', 'catering options'][Math.floor(Math.random() * 5)]} and specializes in ${['seasonal menus', 'wine pairings', 'tasting courses', 'farm-to-table cuisine', 'dietary accommodations'][Math.floor(Math.random() * 5)]}.`,
      BAR: `Our venue includes ${['live music', 'craft beer selection', 'signature cocktails', 'wine tastings', 'outdoor patio'][Math.floor(Math.random() * 5)]} and offers ${['happy hour specials', 'food pairings', 'themed nights', 'private events', 'tasting flights'][Math.floor(Math.random() * 5)]}.`,
      PARK: `Park amenities include ${['walking paths', 'bike trails', 'sports courts', 'picnic areas', 'water features'][Math.floor(Math.random() * 5)]} and ${['playgrounds', 'dog-friendly areas', 'botanical gardens', 'exercise stations', 'bird watching spots'][Math.floor(Math.random() * 5)]}.`,
      LIBRARY: `Our library provides ${['quiet study areas', 'computer stations', 'children\'s section', 'meeting rooms', 'digital resources'][Math.floor(Math.random() * 5)]} and offers ${['research assistance', 'interlibrary loans', 'community programs', 'technology workshops', 'special collections'][Math.floor(Math.random() * 5)]}.`,
      MUSEUM: `Museum features include ${['interactive exhibits', 'guided tours', 'educational programs', 'special collections', 'multimedia presentations'][Math.floor(Math.random() * 5)]} and ${['gift shop', 'café', 'research facilities', 'children\'s area', 'film screenings'][Math.floor(Math.random() * 5)]}.`,
      GALLERY: `Our gallery spaces include ${['multiple exhibition rooms', 'sculpture garden', 'artist workshops', 'multimedia installations', 'rotating exhibits'][Math.floor(Math.random() * 5)]} and offer ${['opening receptions', 'artist talks', 'art classes', 'guided tours', 'collection viewings'][Math.floor(Math.random() * 5)]}.`,
      GYM: `Fitness facilities include ${['cardio equipment', 'free weights', 'strength machines', 'functional training area', 'stretching zone'][Math.floor(Math.random() * 5)]} and ${['group fitness studios', 'personal training spaces', 'recovery area', 'locker rooms', 'nutrition bar'][Math.floor(Math.random() * 5)]}.`,
      YOGA_STUDIO: `Our studio features ${['heated rooms', 'props and equipment', 'meditation space', 'changing facilities', 'relaxation area'][Math.floor(Math.random() * 5)]} and offers ${['private sessions', 'workshops', 'teacher training', 'wellness retreats', 'community events'][Math.floor(Math.random() * 5)]}.`,
      COWORKING_SPACE: `Workspace amenities include ${['private offices', 'hot desks', 'conference rooms', 'phone booths', 'event space'][Math.floor(Math.random() * 5)]} and ${['high-speed internet', 'printing services', 'kitchen facilities', 'mail handling', 'networking events'][Math.floor(Math.random() * 5)]}.`,
      default: `We offer ${['comfortable facilities', 'modern amenities', 'specialized services', 'unique features', 'exceptional experiences'][Math.floor(Math.random() * 5)]} designed to enhance your visit and meet your needs.`
    },
    EVENTS: {
      CAFE: `We regularly host ${['live music', 'poetry readings', 'book clubs', 'art exhibitions', 'tasting events'][Math.floor(Math.random() * 5)]} on ${['weekends', 'Thursday evenings', 'monthly basis', 'select dates', 'Friday nights'][Math.floor(Math.random() * 5)]}.`,
      RESTAURANT: `Our calendar features ${['wine tastings', 'chef demonstrations', 'themed dinner nights', 'holiday specials', 'guest chef events'][Math.floor(Math.random() * 5)]} throughout the year.`,
      BAR: `Join us for ${['trivia nights', 'live music', 'DJ sets', 'tasting events', 'themed parties'][Math.floor(Math.random() * 5)]} every ${['Tuesday', 'weekend', 'Thursday', 'month', 'Friday'][Math.floor(Math.random() * 5)]}.`,
      PARK: `The park hosts ${['seasonal festivals', 'outdoor concerts', 'farmers markets', 'fitness classes', 'nature walks'][Math.floor(Math.random() * 5)]} throughout the year.`,
      LIBRARY: `Our event calendar includes ${['author talks', 'book clubs', 'children\'s storytime', 'workshops', 'lecture series'][Math.floor(Math.random() * 5)]} for all ages and interests.`,
      MUSEUM: `We organize ${['special exhibitions', 'curator talks', 'family days', 'film screenings', 'art workshops'][Math.floor(Math.random() * 5)]} on a regular basis.`,
      GALLERY: `Upcoming events include ${['exhibition openings', 'artist talks', 'collection previews', 'art workshops', 'gallery nights'][Math.floor(Math.random() * 5)]} for art enthusiasts.`,
      GYM: `We schedule ${['fitness challenges', 'specialty classes', 'wellness workshops', 'training camps', 'community events'][Math.floor(Math.random() * 5)]} to keep our members motivated.`,
      YOGA_STUDIO: `Our calendar features ${['intensive workshops', 'guest teachers', 'meditation retreats', 'specialized series', 'community classes'][Math.floor(Math.random() * 5)]} throughout the year.`,
      COWORKING_SPACE: `We organize ${['networking events', 'skill-sharing workshops', 'professional development', 'pitch sessions', 'community gatherings'][Math.floor(Math.random() * 5)]} for our members.`,
      default: `Check our calendar for ${['upcoming events', 'special activities', 'seasonal programming', 'community gatherings', 'featured happenings'][Math.floor(Math.random() * 5)]} throughout the year.`
    },
    HOURS: {
      CAFE: `Open ${['daily', 'Monday-Saturday', 'Tuesday-Sunday', 'weekdays', 'all week'][Math.floor(Math.random() * 5)]} from ${['6AM', '7AM', '8AM'][Math.floor(Math.random() * 3)]} to ${['6PM', '7PM', '8PM', '9PM'][Math.floor(Math.random() * 4)]}, with ${['extended hours', 'special brunch', 'early bird specials', 'happy hour', 'evening events'][Math.floor(Math.random() * 5)]} on weekends.`,
      RESTAURANT: `Serving ${['lunch and dinner', 'breakfast through dinner', 'dinner only', 'all meals', 'brunch and dinner'][Math.floor(Math.random() * 5)]} ${['Tuesday-Sunday', 'daily', 'Monday-Saturday', 'Wednesday-Sunday', 'Thursday-Monday'][Math.floor(Math.random() * 5)]}, from ${['11AM', '12PM', '5PM'][Math.floor(Math.random() * 3)]} to ${['9PM', '10PM', '11PM'][Math.floor(Math.random() * 3)]}.`,
      BAR: `Open ${['daily', 'Tuesday-Sunday', 'Wednesday-Monday', 'Thursday-Tuesday', 'Friday-Wednesday'][Math.floor(Math.random() * 5)]} from ${['4PM', '5PM', '6PM'][Math.floor(Math.random() * 3)]} to ${['12AM', '1AM', '2AM'][Math.floor(Math.random() * 3)]}, with ${['happy hour', 'early specials', 'late night menu', 'weekend events', 'industry nights'][Math.floor(Math.random() * 5)]}.`,
      PARK: `The park is open from ${['sunrise', '6AM', '7AM', '8AM'][Math.floor(Math.random() * 4)]} to ${['sunset', '8PM', '9PM', '10PM'][Math.floor(Math.random() * 4)]} ${['daily', 'year-round', 'seasonally', 'weather permitting', 'with extended summer hours'][Math.floor(Math.random() * 5)]}.`,
      LIBRARY: `Open ${['Monday-Saturday', 'Tuesday-Sunday', 'weekdays', 'daily', 'Monday-Friday with weekend hours'][Math.floor(Math.random() * 5)]} from ${['9AM', '10AM', '8AM'][Math.floor(Math.random() * 3)]} to ${['6PM', '7PM', '8PM', '9PM'][Math.floor(Math.random() * 4)]}, with ${['extended evening hours', 'special weekend hours', 'research appointments', 'study hall nights', 'holiday closures'][Math.floor(Math.random() * 5)]}.`,
      MUSEUM: `Visit us ${['Tuesday-Sunday', 'daily', 'Wednesday-Monday', 'Thursday-Tuesday', 'closed Mondays'][Math.floor(Math.random() * 5)]} from ${['9AM', '10AM', '11AM'][Math.floor(Math.random() * 3)]} to ${['5PM', '6PM', '7PM'][Math.floor(Math.random() * 3)]}, with ${['late nights', 'special viewings', 'member hours', 'curator tours', 'free admission days'][Math.floor(Math.random() * 5)]}.`,
      default: `We are open ${['daily', 'Monday-Saturday', 'Tuesday-Sunday', 'weekdays', 'all week'][Math.floor(Math.random() * 5)]} from ${['9AM', '10AM', '8AM'][Math.floor(Math.random() * 3)]} to ${['5PM', '6PM', '7PM'][Math.floor(Math.random() * 3)]}, please check for ${['holiday hours', 'seasonal changes', 'special events', 'closures', 'extended times'][Math.floor(Math.random() * 5)]}.`
    },
    REVIEWS: {
      default: `Our visitors say: "${['Amazing experience!', 'Highly recommended!', 'Will definitely return!', 'A hidden gem!', 'Exceeded expectations!'][Math.floor(Math.random() * 5)]}" and "${['The staff was exceptional', 'Perfect for our needs', 'A must-visit destination', 'Wonderful atmosphere', 'Consistently excellent'][Math.floor(Math.random() * 5)]}." ${['4.5', '4.7', '4.8', '4.9', '5.0'][Math.floor(Math.random() * 5)]} stars from ${(Math.floor(Math.random() * 9) + 1) * 100}+ reviews.`
    },
    PHOTOS: {
      default: `Explore our ${['space', 'venue', 'location', 'facilities', 'environment'][Math.floor(Math.random() * 5)]} through our photo gallery, featuring ${['interior views', 'special features', 'recent events', 'seasonal highlights', 'visitor experiences'][Math.floor(Math.random() * 5)]} to give you a preview of what to expect.`
    }
  };
  
  // Get specific content or default to the general template
  const content = (contentTemplates[contentType]?.[locationType] || contentTemplates[contentType]?.default || `Information about ${locationName} and our offerings.`);
  
  // Pick title
  const title = titles[contentType][Math.floor(Math.random() * titles[contentType].length)];
  
  return {
    entityId,
    contentType,
    title,
    content,
    // Randomize dates within the last six months
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000))
  };
}

// Create location entities in the database
async function createLocationEntities(previewMode = false) {
  try {
    // Determine how many entities to create
    const entityCount = previewMode ? 5 : 50; // Lower count in preview mode
    console.log(`🏙️ Creating ${entityCount} location entities...`);
    
    const createdEntities = [];
    
    for (let i = 0; i < entityCount; i++) {
      // Select a random category
      const locationType = LOCATION_CATEGORIES[Math.floor(Math.random() * LOCATION_CATEGORIES.length)];
      
      // Generate entity name and details
      const locationName = generateLocationName(locationType);
      const description = generateLocationDescription(locationName, locationType);
      const coordinates = generateRandomCoordinates();
      
      // Create entity object
      const entity = {
        name: locationName,
        category: locationType,
        description,
        location: {
          coordinates: coordinates,
          address: '123 Location St', // Placeholder address
          city: 'Anytown', // Placeholder city
          country: 'US' // Placeholder country
        },
        type: 'PHYSICAL', // All location entities are physical
        isSynthetic: true // Mark as synthetic data
      };
      
      // Log in preview mode or insert into DB
      if (previewMode) {
        console.log('\n-----------------------------------');
        console.log(`Location Entity ${i+1}:`, entity.name);
        console.log('Category:', entity.category);
        console.log('Type:', entity.type);
        console.log('Description:', entity.description);
        
        // Generate sample content for preview
        const sampleContent = generateLocationContent(-1, entity.name, entity.category);
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
          const contentItems = generateLocationContent(entityId, entity.name, entity.category);
          
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
            console.log(`Created ${createdEntities.length} location entities so far...`);
          }
        } catch (error) {
          console.error(`Error creating location entity ${entity.name}:`, error.message);
        }
      }
    }
    
    if (!previewMode) {
      console.log('\n✅ Location entity generation complete!');
      console.log(`Created ${createdEntities.length} location entities with content`);
      
      // Show sample of created entities
      console.log('\nSample of created location entities:');
      createdEntities.slice(0, 5).forEach(entity => {
        console.log(`- ${entity.name} (${entity.category}): ${entity.contentCount} content items`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating location entities:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

// Main function to run the script
async function main() {
  const isPreviewMode = process.argv.includes('--preview');
  
  try {
    await createLocationEntities(isPreviewMode);
    
    // Process exit in script mode (not in preview mode)
    if (!isPreviewMode) {
      console.log('✅ Location entity generation completed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Location entity generation failed:', error);
    process.exit(1);
  }
}

// Run main function
main();