# Synthetic Data Relationships

```mermaid
graph TD
    A[Enhanced User Profiles] -->|has many| B[Interests]
    A -->|creates| C[Location Posts]
    A -->|has| D[Identity Preferences]
    A -->|has| E[Retail Preferences]
    
    F[Entities] -->|categorized as| G[RETAIL]
    F -->|categorized as| H[ONLINE]
    F -->|categorized as| I[EDUCATION]
    F -->|categorized as| J[ENTERTAINMENT]
    F -->|categorized as| K[HEALTHCARE]
    
    F -->|contains| L[Entity Content]
    
    M[Retail Places] -->|has| N[Products]
    M -->|connects to| E
    
    C -->|has| O[Geographic Location]
    
    P[generate-all-data.js] -->|runs| Q[enhanced-generate-users.js]
    P -->|runs| R[entities.js]
    P -->|runs| S[locations.js]
    P -->|runs| T[retail-places.js]
    
    U[Database] <-->|fetch interests| A
    U <-----|preview mode| P
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
    style M fill:#bfb,stroke:#333,stroke-width:2px
    style C fill:#fbb,stroke:#333,stroke-width:2px
    style P fill:#ff9,stroke:#333,stroke-width:2px
```

## Data Type Attributes

### Enhanced User Profile
- Username
- Display Name
- Avatar
- Bio
- Age
- Occupation
- Location
- Gender
- Country of Origin
- Languages Spoken
- Cultural Background
- Education
- Professional Field
- Collaboration Style
- Personal Values
- Digital Identity
- Physical Activity Level
- Cultural Experiences
- Learning Style
- Identity Preferences
  - Attribute Importance

### Entity
- Name
- Category
- Description
- Icon URL
- Website URL
- Is AI Generated
- Content Items
  - Title
  - Description
  - URL
  - Thumbnail URL
  - Content Type

### Location Post
- User ID
- Content
- Location
  - Place Name
  - Latitude
  - Longitude
  - Location Type

### Retail Place
- Name
- Category
- Description
- Type (PHYSICAL/ONLINE)
- Products
- Location (if PHYSICAL)
- Website URL (if ONLINE)

## Generated Files

1. **enhanced-synthetic-users.json** - Contains all generated user profiles
2. **create-enhanced-users.js** - Script to import users to database
3. **retail-data.json** - Contains all retail places and products
4. **synthetic-entities.json** - Contains all digital and physical entities