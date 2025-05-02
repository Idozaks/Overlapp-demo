# Overlapp - Intelligent Social Connection Discovery

Overlapp is a cutting-edge mobile-first React application for intelligent social connection discovery, leveraging advanced AI-powered connection mapping with an intuitive user experience.

![Demo Animation](./client/public/demo.gif)

## Features

- **Simple Onboarding**: Set up your profile with just a few taps – pick an avatar, add your name, and select your interests
- **Card-Based Interface**: Clean, intuitive card-based layout showing your connections to people, places, and interests
- **Location Mapping**: Visual representation of physical locations where you have connections
- **Smart Matching**: Intelligent algorithm to find meaningful connections based on shared interests and locations
- **Privacy Control**: Built-in privacy panel allowing users to view and revoke their data
- **Admin Dashboard**: Debug panel (accessed via `?debug=true` query parameter) showing synthetic user data

## Technology Stack

- React with TypeScript for type safety
- Mobile-responsive design with Tailwind CSS
- Shadcn/ui component library for beautiful, accessible UI
- OpenAI GPT-4o for intelligent connection analysis
- Drizzle ORM for database interactions
- P5.js for interactive constellation visualization
- Dark mode with neon accents for modern aesthetic

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser at `http://localhost:5000`

## Project Structure

- `/client/src/pages`: Main application pages
  - `/onboarding`: User onboarding flow components
  - `/home`: Homepage with constellation visualization (legacy)
  - `/hybrid`: New card-based + map visualization page
  - `/admin`: Admin dashboard for synthetic user data
- `/client/src/components`: Reusable UI components
  - `/ui`: Base UI components from shadcn/ui
- `/server`: Express server for API endpoints
- `/shared`: Shared types and utilities
- `/public`: Static assets and demo animations

## UX Flow

1. **Onboarding (`/`)**  
   - Step 1: Pick avatar + name (optional)
   - Step 2: Multi-select interests (chips)
   - Step 3: Tap "Spark it!" → store DIU, navigate to `/hybrid`

2. **Hybrid View (`/hybrid`)**  
   - Left: Card-based list of connections (people, places, interests)
   - Right: Map visualization of physical locations
   - Searchable, filterable interface with location display
   - FAB link to Privacy Panel modal

3. **Privacy Panel**  
   - Shows JSON preview (readonly) + "Revoke" (clears localStorage → shows toast → greys overlay)

4. **Admin (`/admin?debug=true`)**  
   - Table of synthetic users, overlap counts, toggle to regenerate synthetic dataset

## What's Next

Future enhancements could include:

1. **Real Authentication**: Replace DIU storage with proper authentication using Firebase or Auth0
2. **Persistent Database**: Migrate to Supabase or a similar solution for persistent storage
3. **Real-time Updates**: Add WebSocket connections for real-time data synchronization
4. **Advanced Visualizations**: Enhance the constellation with 3D effects and more interactive elements
5. **AI-powered Recommendations**: Leverage GPT-4o for personalized connection recommendations
6. **Production Deployment**: Deploy to Vercel for fast, global distribution

## License

MIT

## Credits

- Shadcn/ui for the beautiful UI components
- React team for the amazing framework
- OpenAI for GPT models that power intelligent matching