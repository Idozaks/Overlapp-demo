import React, { useEffect, useState } from 'react';
import { useDemo } from '@/hooks/use-demo';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minimize, Maximize, InfoIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SimulationController() {
  const { 
    isDemoMode, 
    isJourneyPaused, 
    currentJourneyType, 
    demoState, 
    setDemoState 
  } = useDemo();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only run simulation if in demo mode and not paused
    if (isDemoMode && !isJourneyPaused) {
      // Reset when journey changes
      if (demoState.journeyType !== currentJourneyType) {
        setDemoState({
          journeyType: currentJourneyType,
          currentStep: 0,
          progress: 0
        });
        setCurrentStep(0);
        setProgress(0);
      }

      // Simulation logic
      const timer = setInterval(() => {
        const nextProgress = Math.min(progress + 1, 100);
        setProgress(nextProgress);
        
        // Update step based on progress
        if (nextProgress === 25) {
          setCurrentStep(1);
          setDemoState({ currentStep: 1, progress: nextProgress });
        } else if (nextProgress === 50) {
          setCurrentStep(2);
          setDemoState({ currentStep: 2, progress: nextProgress });
        } else if (nextProgress === 75) {
          setCurrentStep(3);
          setDemoState({ currentStep: 3, progress: nextProgress });
        } else if (nextProgress === 100) {
          setCurrentStep(4);
          setDemoState({ currentStep: 4, progress: nextProgress });
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isDemoMode, isJourneyPaused, progress, currentJourneyType, demoState.journeyType]);

  // Effects for loading saved state
  useEffect(() => {
    if (demoState.currentStep !== undefined) {
      setCurrentStep(demoState.currentStep);
    }
    if (demoState.progress !== undefined) {
      setProgress(demoState.progress);
    }
  }, []);

  if (!isDemoMode) return null;

  const journeyTitles = {
    socialDiscovery: 'Social Discovery',
    physicalIntegration: 'Physical Integration',
    identityManagement: 'Identity Management',
    marketplace: 'Marketplace',
    default: 'Default Journey'
  };

  // Demo steps for different journeys
  const steps = {
    socialDiscovery: [
      'Finding users with similar interests',
      'Analyzing social connection possibilities',
      'Calculating compatibility scores',
      'Generating conversation starters',
      'Social discovery complete!'
    ],
    physicalIntegration: [
      'Mapping physical touchpoints',
      'Calculating proximity scores',
      'Generating location-based recommendations',
      'Creating customized engagement paths',
      'Physical integration complete!'
    ],
    identityManagement: [
      'Analyzing identity attributes',
      'Computing identity completeness score',
      'Generating privacy recommendations',
      'Creating personalized DIU portfolio',
      'Identity analysis complete!'
    ],
    marketplace: [
      'Scanning marketplace entities',
      'Computing interest-entity matches',
      'Ranking entity recommendations',
      'Generating personalized offers',
      'Marketplace analysis complete!'
    ],
    default: [
      'Initializing demo',
      'Analyzing user preferences',
      'Generating recommendations',
      'Computing final results',
      'Demo complete!'
    ]
  };

  const currentSteps = steps[currentJourneyType] || steps.default;
  const title = journeyTitles[currentJourneyType] || 'Demo';

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-auto shadow-md">
          <CardContent className="p-3 flex items-center gap-2">
            <Badge variant="outline">{title}</Badge>
            <Progress value={progress} className="w-24 h-2" />
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(false)}>
              <Maximize className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              {title} Demo
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
                <Minimize className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Step {currentStep + 1} of {currentSteps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <Progress value={progress} className="mb-2" />
          <div className="text-sm font-medium">{currentSteps[currentStep]}</div>
          
          <div className="mt-3 space-y-1">
            {currentSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {index < currentStep ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : index === currentStep ? (
                  <AlertCircle className="h-3 w-3 text-amber-500 animate-pulse" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                )}
                <span className={index <= currentStep ? "" : "text-muted-foreground/50"}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2 gap-2 justify-end">
          <div className="text-xs text-muted-foreground">
            {isJourneyPaused ? "Demo paused" : "Demo running"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SimulationController;