
# Prompt: Implement Interactive Demo Simulation for Overlapp

## Context
Overlapp needs an interactive demonstration system to guide users through predefined user journeys. This should showcase different use cases while simulating a live ecosystem with synthetic user interactions in the background.

## Requirements

Create a comprehensive interactive demo simulation that includes:

1. **Demo Mode System** with:
   - A toggle-able "Demo Mode" that activates guided tours
   - Overlay instructions highlighting UI elements
   - Auto-navigation through screens with pauses for explanation
   - Ability to exit the demo at any point

2. **Background Synthetic Activity Engine** that:
   - Simulates user interactions (follows, likes, comments, overlap detection, messages)
   - Stores these interactions in the database
   - Generates realistic activity patterns in real-time

3. **Four User Journey Types**:
   - **Social Discovery Journey**: Profile exploration → Interest matching → Overlap analysis → Connection initiation → Communication
   - **Digital-Physical Integration Journey**: Location check-in → Entity discovery → Retail interaction → Real-world overlap detection → Post-visit engagement
   - **Identity Management Journey**: Identity preferences configuration → Digital identity export → Interest curation → Algorithm personalization → Privacy controls
   - **Marketplace Engagement Journey**: Entity discovery → Product exploration → Compatibility analysis → Transaction simulation → Recommendations

4. **Tutorial Markers & Notifications**:
   - Highlighting interactive components with visual indicators
   - Providing context for features with tooltip-style popups
   - Displaying simulated notifications during the demo journey
   - Presenting "What's happening now" insights about background synthetic activities

## Technical Implementation Tasks

1. Create a **SimulationController** component that:
   - Manages the overall simulation state
   - Coordinates synthetic user activities timing
   - Triggers events at appropriate moments in the journey
   - Records interactions in the database for future replays

2. Develop a **TutorialOverlay** system that:
   - Renders instructional elements above the main UI
   - Guides user attention to specific features using highlights/arrows
   - Progresses through predefined steps with animations
   - Responds intelligently to user interactions during the demo

3. Implement a **SyntheticDataGenerator** that:
   - Creates realistic interaction patterns between users
   - Simulates diverse personas and behaviors
   - Generates contextually appropriate interactions
   - Presents compelling use cases through the data

4. Design a **DemoJourneySelector** interface that:
   - Allows users to choose which journey type to experience
   - Provides preview information about each journey
   - Saves progress for multi-session exploration
   - Recommends journeys based on user interests

## Implementation Guidelines

- Use React context for managing demo state across components
- Implement the synthetic activity engine as a background worker
- Store journey progress in local storage for continuity
- Use eye-catching but non-disruptive visual markers for tutorial elements
- Ensure all demo features can be toggled off for regular app use
- Include analytics to track which demo features users engage with most

## Code Examples

Start with this simulation controller interface:

```typescript
interface InteractionType {
  sourceUserId: number;
  targetUserId: number;
  type: 'follow' | 'like' | 'comment' | 'overlap_detected' | 'message';
  timestamp: Date;
  metadata?: Record<string, any>;
}

class SimulationController {
  isActive: boolean = false;
  currentJourney: string | null = null;
  currentStep: number = 0;
  journeySteps: Record<string, any[]> = {
    socialDiscovery: [...],
    physicalIntegration: [...],
    identityManagement: [...],
    marketplace: [...]
  };
  
  constructor() {
    // Initialize the controller
  }
  
  startSimulation(journeyType: string): void {
    // Start the selected journey
  }
  
  pauseSimulation(): void {
    // Pause the current simulation
  }
  
  resumeSimulation(): void {
    // Resume from pause
  }
  
  endSimulation(): void {
    // End the simulation and clean up
  }
  
  generateSyntheticInteraction(): InteractionType {
    // Generate a random interaction between synthetic users
  }
  
  advanceToNextStep(): void {
    // Move to the next step in the journey
  }
}
```

## UI Component Examples

For the tutorial overlay:

```tsx
const TutorialHighlight: React.FC<{
  targetElementId: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  onComplete?: () => void;
}> = ({ targetElementId, message, position, onComplete }) => {
  // Render a highlight around a target element with an informational message
};

const JourneyProgressIndicator: React.FC<{
  totalSteps: number;
  currentStep: number;
  labels: string[];
}> = ({ totalSteps, currentStep, labels }) => {
  // Show progress through the current journey
};

const SyntheticActivityFeed: React.FC<{
  recentActivities: InteractionType[];
  maxItems?: number;
}> = ({ recentActivities, maxItems = 5 }) => {
  // Display recent synthetic activities to make the platform feel alive
};
```

## Deliverables

1. Complete implementation of the Demo Mode toggle and controller
2. Tutorial overlay system with highlights and instructions
3. Four fully mapped user journeys with step-by-step guidance
4. Background synthetic activity generator
5. UI components for journey selection and progress tracking
6. Integration with the existing Overlapp codebase

## Success Criteria

- Users can easily navigate and understand the key value propositions
- The platform feels alive with synthetic activity even for new users
- Each journey highlights unique aspects of the Overlapp experience
- Users can exit and resume demo journeys at any time
- Background activity appears natural and contextually appropriate
