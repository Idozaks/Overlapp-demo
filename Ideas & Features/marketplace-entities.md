
# Marketplace Entities

## Overview
This document outlines the implementation plan for a comprehensive marketplace system within Overlapp, creating a platform for discovering and interacting with businesses, events, and other entities.

## Key Components

1. **Entity Types**
   - Businesses and retail establishments
   - Event venues and temporary happenings
   - Service providers and professionals
   - Digital content creators and communities
   
2. **Entity Profiles**
   - Comprehensive identity information
   - Interest and attribute tagging
   - Media galleries and promotional content
   - Verification and trust indicators
   
3. **Discovery System**
   - Category-based navigation
   - Location-aware recommendations
   - Interest-matched suggestions
   - Social graph filtering
   
4. **Interaction Framework**
   - Follow/subscribe functionality
   - Engagement tracking
   - Rating and feedback collection
   - Direct messaging capabilities

## Technical Implementation

1. **Database Structure**
   ```sql
   CREATE TABLE entities (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     type VARCHAR(100) NOT NULL,
     description TEXT,
     logo_url VARCHAR(255),
     website_url VARCHAR(255),
     contact_info JSONB,
     physical_location JSONB,
     attributes JSONB,
     verification_level VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE entity_interests (
     entity_id INTEGER REFERENCES entities(id),
     interest_id INTEGER REFERENCES interests(id),
     PRIMARY KEY (entity_id, interest_id)
   );
   
   CREATE TABLE entity_media (
     id SERIAL PRIMARY KEY,
     entity_id INTEGER REFERENCES entities(id),
     media_type VARCHAR(50),
     url VARCHAR(255),
     title VARCHAR(255),
     description TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE user_entity_interactions (
     user_id INTEGER REFERENCES users(id),
     entity_id INTEGER REFERENCES entities(id),
     interaction_type VARCHAR(50),
     interaction_data JSONB,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (user_id, entity_id, interaction_type)
   );
   ```

2. **API Endpoints**
   - `/entities` - CRUD operations for entities
   - `/entities/nearby` - Location-based discovery
   - `/entities/recommended` - Personalized recommendations
   - `/entities/:id/media` - Entity media management
   - `/entities/:id/interact` - Track interactions

3. **UI Components**
   - Entity browse and search interface
   - Category navigation system
   - Entity detail views
   - Media galleries
   - Interaction widgets

## User Experience Flows

1. **Entity Discovery**
   - Browse by category or search
   - View personalized recommendations
   - Filter by location or attributes
   - Save favorites and create collections

2. **Entity Interaction**
   - View detailed entity profiles
   - Follow entities for updates
   - Engage with entity content
   - Rate and review experiences

3. **Entity Overlap**
   - View compatibility with entities
   - See mutual interests and connections
   - Receive personalized entity content
   - Track history of interactions

## Integration with Core Features

1. **Overlap Analysis**
   - Calculate user-entity overlap scores
   - Suggest entities based on identity
   - Show mutual connections with entities

2. **Digital-Physical Integration**
   - Check-in at physical entity locations
   - Scan entity QR codes for enhanced experiences
   - Record visits and interactions for future context

3. **AI Companions**
   - Get entity recommendations from AI
   - Ask questions about specific entities
   - Receive context-aware insights about entities

## Implementation Phases

1. **Phase 1: Foundational System**
   - Basic entity database and profiles
   - Simple category-based browsing
   - Initial recommendation algorithms

2. **Phase 2: Enhanced Discovery**
   - Advanced filtering and search
   - Location-based recommendations
   - User-entity overlap calculation

3. **Phase 3: Rich Interaction**
   - Comprehensive engagement tracking
   - Rating and review system
   - Direct messaging with entities
