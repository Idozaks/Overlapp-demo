import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

// Define types for different journey types
export type JourneyType = 'socialDiscovery' | 'physicalIntegration' | 'identityManagement' | 'marketplace';

// Define the interaction type interface
export interface InteractionType {
  sourceUserId: number;
  targetUserId: number;
  type: 'follow' | 'like' | 'comment' | 'overlap_detected' | 'message';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Step interface for journey steps
interface JourneyStep {
  id: string;
  title: string;
  description: string;
  targetPath: string;
  targetElementId?: string;
  highlightPosition?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  waitForUserAction?: boolean;
  syntheticActivity?: InteractionType[];
}

// Create journey steps for each type
const journeySteps: Record<JourneyType, JourneyStep[]> = {
  socialDiscovery: [
    {
      id: 'social-intro',
      title: 'Social Discovery',
      description: 'Welcome to the social discovery journey! We'll guide you through finding and connecting with like-minded people.',
      targetPath: '/social',
      highlightPosition: 'bottom',
    },
    {
      id: 'profile-exploration',
      title: 'Profile Exploration',
      description: 'Browse through user profiles to discover potential connections based on shared interests and values.',
      targetPath: '/social/explore',
      targetElementId: 'user-profiles-list',
      highlightPosition: 'left',
    },
    {
      id: 'interest-matching',
      title: 'Interest Matching',
      description: 'Overlapp analyzes profiles to find users with similar interests and values as you.',
      targetPath: '/social/matches',
      targetElementId: 'matches-container',
      highlightPosition: 'top',
    },
    {
      id: 'overlap-analysis',
      title: 'Overlap Analysis',
      description: 'See a detailed breakdown of how your interests and values overlap with other users.',
      targetPath: '/social/overlap',
      targetElementId: 'overlap-visualization',
      highlightPosition: 'right',
    },
    {
      id: 'connection-initiation',
      title: 'Connection Initiation',
      description: 'Initiate a connection with users who share your interests and values.',
      targetPath: '/social/overlap',
      targetElementId: 'connect-button',
      highlightPosition: 'bottom',
      waitForUserAction: true,
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Start a conversation and engage with your new connections.',
      targetPath: '/chat',
      targetElementId: 'new-message',
      highlightPosition: 'bottom',
    }
  ],
  physicalIntegration: [
    {
      id: 'physical-intro',
      title: 'Digital-Physical Integration',
      description: 'This journey shows how Overlapp connects your digital identity with physical world experiences.',
      targetPath: '/marketplace',
      highlightPosition: 'bottom',
    },
    {
      id: 'location-checkin',
      title: 'Location Check-in',
      description: 'Discover how Overlapp lets you check in at physical locations and share your experiences.',
      targetPath: '/marketplace',
      targetElementId: 'location-checkin',
      highlightPosition: 'top',
    },
    {
      id: 'entity-discovery',
      title: 'Entity Discovery',
      description: 'Explore businesses, venues, and other entities in the physical world that match your interests.',
      targetPath: '/marketplace',
      targetElementId: 'entity-list',
      highlightPosition: 'left',
    },
    {
      id: 'retail-interaction',
      title: 'Retail Interaction',
      description: 'See how your digital identity can enhance your shopping and retail experiences.',
      targetPath: '/marketplace/entity/1',
      targetElementId: 'entity-details',
      highlightPosition: 'right',
    },
    {
      id: 'real-world-overlap',
      title: 'Real-world Overlap Detection',
      description: 'Overlapp identifies patterns where your interests align with physical locations and businesses.',
      targetPath: '/marketplace/entity/1/overlap',
      targetElementId: 'entity-overlap-visualization',
      highlightPosition: 'top',
    },
    {
      id: 'post-visit',
      title: 'Post-visit Engagement',
      description: 'After visiting a location, Overlapp helps you maintain a relationship with entities that match your interests.',
      targetPath: '/marketplace',
      targetElementId: 'recommended-entities',
      highlightPosition: 'bottom',
    }
  ],
  identityManagement: [
    {
      id: 'identity-intro',
      title: 'Identity Management',
      description: 'Learn how to manage and customize your digital identity with Overlapp.',
      targetPath: '/profile/1/edit',
      highlightPosition: 'bottom',
    },
    {
      id: 'preferences-config',
      title: 'Identity Preferences Configuration',
      description: 'Configure your identity attributes and preferences to control how Overlapp represents you.',
      targetPath: '/profile/1/edit',
      targetElementId: 'identity-preferences',
      highlightPosition: 'right',
    },
    {
      id: 'digital-identity-export',
      title: 'Digital Identity Export',
      description: 'Export your digital identity to use across platforms and services.',
      targetPath: '/social/export',
      targetElementId: 'export-controls',
      highlightPosition: 'top',
    },
    {
      id: 'interest-curation',
      title: 'Interest Curation',
      description: 'Manage and curate your interests to better represent your identity.',
      targetPath: '/profile/1/interests/suggestions',
      targetElementId: 'interest-suggestions',
      highlightPosition: 'left',
    },
    {
      id: 'algorithm-personalization',
      title: 'Algorithm Personalization',
      description: 'Customize how Overlapp's algorithms interpret your identity and make recommendations.',
      targetPath: '/profile/1/edit',
      targetElementId: 'algorithm-settings',
      highlightPosition: 'bottom',
    },
    {
      id: 'privacy-controls',
      title: 'Privacy Controls',
      description: 'Control who can see your information and how it's used in the Overlapp ecosystem.',
      targetPath: '/profile/1/edit',
      targetElementId: 'privacy-settings',
      highlightPosition: 'right',
    }
  ],
  marketplace: [
    {
      id: 'marketplace-intro',
      title: 'Marketplace Engagement',
      description: 'Discover how Overlapp connects you with businesses, products, and services that match your identity.',
      targetPath: '/marketplace',
      highlightPosition: 'bottom',
    },
    {
      id: 'entity-discovery-m',
      title: 'Entity Discovery',
      description: 'Browse through the marketplace to find entities that align with your interests and values.',
      targetPath: '/marketplace',
      targetElementId: 'entity-grid',
      highlightPosition: 'left',
    },
    {
      id: 'product-exploration',
      title: 'Product Exploration',
      description: 'Explore products and services offered by entities in the marketplace.',
      targetPath: '/marketplace/entity/1',
      targetElementId: 'entity-products',
      highlightPosition: 'top',
    },
    {
      id: 'compatibility-analysis',
      title: 'Compatibility Analysis',
      description: 'See how well a product or service matches with your identity and preferences.',
      targetPath: '/marketplace/entity/1/overlap',
      targetElementId: 'compatibility-score',
      highlightPosition: 'right',
    },
    {
      id: 'transaction-simulation',
      title: 'Transaction Simulation',
      description: 'Experience a simulated transaction process with an entity in the marketplace.',
      targetPath: '/marketplace/entity/1',
      targetElementId: 'purchase-button',
      highlightPosition: 'bottom',
      waitForUserAction: true,
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      description: 'Receive personalized recommendations based on your identity and transaction history.',
      targetPath: '/marketplace',
      targetElementId: 'recommendations-section',
      highlightPosition: 'bottom',
    }
  ]
};

// Define the context interface
interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  currentJourney: JourneyType | null;
  currentStep: number;
  startJourney: (journeyType: JourneyType) => void;
  endJourney: () => void;
  pauseJourney: () => void;
  resumeJourney: () => void;
  advanceToNextStep: () => void;
  goToPreviousStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  totalSteps: number;
  journeyProgress: number;
  currentStepData: JourneyStep | null;
  recentActivities: InteractionType[];
  isJourneyPaused: boolean;
  getJourneySteps: (journeyType: JourneyType) => JourneyStep[];
  allJourneyTypes: JourneyType[];
}

// Create the context with default values
const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  toggleDemoMode: () => {},
  currentJourney: null,
  currentStep: 0,
  startJourney: () => {},
  endJourney: () => {},
  pauseJourney: () => {},
  resumeJourney: () => {},
  advanceToNextStep: () => {},
  goToPreviousStep: () => {},
  jumpToStep: () => {},
  totalSteps: 0,
  journeyProgress: 0,
  currentStepData: null,
  recentActivities: [],
  isJourneyPaused: false,
  getJourneySteps: () => [],
  allJourneyTypes: ['socialDiscovery', 'physicalIntegration', 'identityManagement', 'marketplace'],
});

// Demo context provider component
export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentJourney, setCurrentJourney] = useState<JourneyType | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isJourneyPaused, setIsJourneyPaused] = useState<boolean>(false);
  const [recentActivities, setRecentActivities] = useState<InteractionType[]>([]);
  const [, navigate] = useLocation();

  // Get the current step data based on journey and step index
  const currentStepData = currentJourney && currentStep < journeySteps[currentJourney].length
    ? journeySteps[currentJourney][currentStep]
    : null;

  // Calculate total steps and progress
  const totalSteps = currentJourney ? journeySteps[currentJourney].length : 0;
  const journeyProgress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  // Effect to navigate to the correct path when step changes
  useEffect(() => {
    if (isDemoMode && currentStepData && !isJourneyPaused) {
      navigate(currentStepData.targetPath);
      
      // Generate synthetic activity if specified
      if (currentStepData.syntheticActivity) {
        setRecentActivities(prev => [
          ...currentStepData.syntheticActivity!,
          ...prev
        ].slice(0, 10)); // Keep only the 10 most recent activities
      }
    }
  }, [currentStep, currentJourney, isDemoMode, isJourneyPaused]);

  // Load demo state from localStorage
  useEffect(() => {
    const savedDemoState = localStorage.getItem('overlappDemoState');
    if (savedDemoState) {
      try {
        const { isDemoMode: savedMode, currentJourney: savedJourney, currentStep: savedStep } = JSON.parse(savedDemoState);
        setIsDemoMode(savedMode);
        setCurrentJourney(savedJourney);
        setCurrentStep(savedStep);
      } catch (error) {
        console.error('Error loading demo state:', error);
      }
    }
  }, []);

  // Save demo state to localStorage when state changes
  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem('overlappDemoState', JSON.stringify({
        isDemoMode,
        currentJourney,
        currentStep
      }));
    } else {
      localStorage.removeItem('overlappDemoState');
    }
  }, [isDemoMode, currentJourney, currentStep]);

  // Generate random synthetic activities periodically when in demo mode
  useEffect(() => {
    if (isDemoMode && !isJourneyPaused) {
      const interval = setInterval(() => {
        const newActivity = generateSyntheticInteraction();
        setRecentActivities(prev => [newActivity, ...prev].slice(0, 10));
      }, 15000); // Every 15 seconds
      
      return () => clearInterval(interval);
    }
  }, [isDemoMode, isJourneyPaused]);

  // Function to toggle demo mode
  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
    if (isDemoMode) {
      // If turning off demo mode, reset state
      setCurrentJourney(null);
      setCurrentStep(0);
      setIsJourneyPaused(false);
    }
  };

  // Function to start a journey
  const startJourney = (journeyType: JourneyType) => {
    setCurrentJourney(journeyType);
    setCurrentStep(0);
    setIsJourneyPaused(false);
    setIsDemoMode(true);
  };

  // Function to end journey
  const endJourney = () => {
    setCurrentJourney(null);
    setCurrentStep(0);
    setIsJourneyPaused(false);
  };

  // Function to pause journey
  const pauseJourney = () => {
    setIsJourneyPaused(true);
  };

  // Function to resume journey
  const resumeJourney = () => {
    setIsJourneyPaused(false);
  };

  // Function to advance to next step
  const advanceToNextStep = () => {
    if (currentJourney && currentStep < journeySteps[currentJourney].length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (currentJourney) {
      // End of journey
      endJourney();
    }
  };

  // Function to go to previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Function to jump to a specific step
  const jumpToStep = (stepIndex: number) => {
    if (currentJourney && stepIndex >= 0 && stepIndex < journeySteps[currentJourney].length) {
      setCurrentStep(stepIndex);
    }
  };

  // Function to get journey steps
  const getJourneySteps = (journeyType: JourneyType) => {
    return journeySteps[journeyType] || [];
  };

  // Function to generate random synthetic interaction
  const generateSyntheticInteraction = (): InteractionType => {
    const types: Array<'follow' | 'like' | 'comment' | 'overlap_detected' | 'message'> = [
      'follow', 'like', 'comment', 'overlap_detected', 'message'
    ];
    
    return {
      sourceUserId: Math.floor(Math.random() * 20) + 1, // Random user ID between 1-20
      targetUserId: Math.floor(Math.random() * 20) + 1, // Random user ID between 1-20
      type: types[Math.floor(Math.random() * types.length)],
      timestamp: new Date(),
      metadata: {
        content: type === 'comment' ? 'Great post!' : undefined,
        matchScore: type === 'overlap_detected' ? Math.floor(Math.random() * 100) : undefined
      }
    };
  };

  // All available journey types
  const allJourneyTypes: JourneyType[] = ['socialDiscovery', 'physicalIntegration', 'identityManagement', 'marketplace'];

  // Provide the context
  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        currentJourney,
        currentStep,
        startJourney,
        endJourney,
        pauseJourney,
        resumeJourney,
        advanceToNextStep,
        goToPreviousStep,
        jumpToStep,
        totalSteps,
        journeyProgress,
        currentStepData,
        recentActivities,
        isJourneyPaused,
        getJourneySteps,
        allJourneyTypes
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

// Custom hook to use the demo context
export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};