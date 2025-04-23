import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type JourneyType = 'socialDiscovery' | 'physicalIntegration' | 'identityManagement' | 'marketplace' | 'default';

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  isJourneyPaused: boolean;
  pauseJourney: () => void;
  resumeJourney: () => void;
  currentJourneyType: JourneyType;
  startJourney: (journeyType: JourneyType) => void;
  allJourneyTypes: JourneyType[];
  demoState: Record<string, any>;
  setDemoState: (newState: Record<string, any>) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isJourneyPaused, setIsJourneyPaused] = useState<boolean>(false);
  const [currentJourneyType, setCurrentJourneyType] = useState<JourneyType>('default');
  const [demoState, setDemoStateInternal] = useState<Record<string, any>>({});

  const allJourneyTypes: JourneyType[] = [
    'socialDiscovery',
    'physicalIntegration',
    'identityManagement',
    'marketplace'
  ];

  // Persist demo mode state
  useEffect(() => {
    // Load demo state from localStorage
    const savedDemoMode = localStorage.getItem('overlapp_demo_mode');
    const savedJourneyType = localStorage.getItem('overlapp_journey_type') as JourneyType;
    const savedJourneyPaused = localStorage.getItem('overlapp_journey_paused');
    const savedDemoState = localStorage.getItem('overlapp_demo_state');

    if (savedDemoMode) {
      setIsDemoMode(savedDemoMode === 'true');
    }
    
    if (savedJourneyType && allJourneyTypes.includes(savedJourneyType)) {
      setCurrentJourneyType(savedJourneyType);
    }
    
    if (savedJourneyPaused) {
      setIsJourneyPaused(savedJourneyPaused === 'true');
    }
    
    if (savedDemoState) {
      try {
        setDemoStateInternal(JSON.parse(savedDemoState));
      } catch (e) {
        console.error('Failed to parse saved demo state', e);
      }
    }
  }, []);

  // Save demo state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('overlapp_demo_mode', isDemoMode.toString());
    localStorage.setItem('overlapp_journey_type', currentJourneyType);
    localStorage.setItem('overlapp_journey_paused', isJourneyPaused.toString());
    localStorage.setItem('overlapp_demo_state', JSON.stringify(demoState));
  }, [isDemoMode, currentJourneyType, isJourneyPaused, demoState]);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
    if (!isDemoMode) {
      // Starting demo mode - use default journey if none is selected
      if (currentJourneyType === 'default') {
        setCurrentJourneyType('socialDiscovery');
      }
      setIsJourneyPaused(false);
    }
  };

  const pauseJourney = () => {
    setIsJourneyPaused(true);
  };

  const resumeJourney = () => {
    setIsJourneyPaused(false);
  };

  const startJourney = (journeyType: JourneyType) => {
    setCurrentJourneyType(journeyType);
    setIsDemoMode(true);
    setIsJourneyPaused(false);
    
    // Reset any journey-specific state
    setDemoStateInternal(currentState => {
      const newState = { ...currentState };
      newState.currentStep = 0;
      newState.journeyProgress = 0;
      return newState;
    });
  };

  const setDemoState = (newState: Record<string, any>) => {
    setDemoStateInternal(currentState => ({
      ...currentState,
      ...newState
    }));
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        isJourneyPaused,
        pauseJourney,
        resumeJourney,
        currentJourneyType,
        startJourney,
        allJourneyTypes,
        demoState,
        setDemoState
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

export default useDemo;