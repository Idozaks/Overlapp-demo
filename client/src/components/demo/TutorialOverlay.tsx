import React, { useEffect, useState } from 'react';
import { useDemo } from '@/hooks/use-demo';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight, Pause, Play, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface TutorialHighlightProps {
  targetElementId?: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  title: string;
  onComplete?: () => void;
}

const calculatePosition = (
  targetElement: HTMLElement | null,
  position: 'top' | 'bottom' | 'left' | 'right'
): { top: number; left: number } => {
  if (!targetElement) {
    // Default position in the center if no target element
    return {
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
    };
  }

  const rect = targetElement.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  switch (position) {
    case 'top':
      return {
        top: rect.top + scrollTop - 130, // Position above the element
        left: rect.left + scrollLeft + rect.width / 2 - 150, // Centered horizontally
      };
    case 'bottom':
      return {
        top: rect.bottom + scrollTop + 20, // Position below the element
        left: rect.left + scrollLeft + rect.width / 2 - 150, // Centered horizontally
      };
    case 'left':
      return {
        top: rect.top + scrollTop + rect.height / 2 - 75, // Centered vertically
        left: rect.left + scrollLeft - 320, // Position to the left
      };
    case 'right':
      return {
        top: rect.top + scrollTop + rect.height / 2 - 75, // Centered vertically
        left: rect.right + scrollLeft + 20, // Position to the right
      };
    default:
      return {
        top: rect.bottom + scrollTop + 20,
        left: rect.left + scrollLeft + rect.width / 2 - 150,
      };
  }
};

export const TutorialHighlight: React.FC<TutorialHighlightProps> = ({
  targetElementId,
  message,
  position,
  title,
  onComplete,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
  });

  useEffect(() => {
    // Function to find the target element and calculate position
    const positionTooltip = () => {
      const targetElement = targetElementId
        ? document.getElementById(targetElementId)
        : null;
      
      setTooltipPosition(calculatePosition(targetElement, position));
      
      // If there's a target element, scroll it into view
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    // Position the tooltip initially
    positionTooltip();

    // Reposition on window resize
    window.addEventListener('resize', positionTooltip);

    // Create a highlight effect around the target element if it exists
    const targetElement = targetElementId
      ? document.getElementById(targetElementId)
      : null;
    
    if (targetElement) {
      targetElement.classList.add('demo-highlight-target');
      
      // Add a pulsing animation
      targetElement.style.animation = 'pulse 2s infinite';
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', positionTooltip);
      if (targetElement) {
        targetElement.classList.remove('demo-highlight-target');
        targetElement.style.animation = '';
      }
    };
  }, [targetElementId, position]);

  return (
    <motion.div
      className="fixed z-50 w-300 max-w-[90vw] bg-white/90 dark:bg-black/90 rounded-xl shadow-lg border border-primary p-4"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        width: '300px',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm mb-4">{message}</p>
      {onComplete && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onComplete}>
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export const TutorialOverlay: React.FC = () => {
  const {
    isDemoMode,
    toggleDemoMode,
    currentJourney,
    currentStep,
    totalSteps,
    journeyProgress,
    currentStepData,
    advanceToNextStep,
    goToPreviousStep,
    pauseJourney,
    resumeJourney,
    endJourney,
    isJourneyPaused,
  } = useDemo();
  
  const [, navigate] = useLocation();

  // Only render if demo mode is active
  if (!isDemoMode || !currentJourney || !currentStepData) {
    return null;
  }

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/5 pointer-events-none z-40" />

      {/* Tutorial highlight */}
      <AnimatePresence>
        <TutorialHighlight
          key={`${currentJourney}-${currentStep}`}
          targetElementId={currentStepData.targetElementId}
          message={currentStepData.description}
          position={currentStepData.highlightPosition || 'bottom'}
          title={currentStepData.title}
          onComplete={currentStepData.waitForUserAction ? undefined : advanceToNextStep}
        />
      </AnimatePresence>

      {/* Controls panel */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-card shadow-lg rounded-lg p-4 border border-primary flex flex-col">
        <div className="flex items-center justify-between mb-2 space-x-2">
          <Button variant="outline" size="icon" onClick={endJourney} title="Exit Demo">
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 mx-4">
            <h3 className="text-sm font-medium mb-1">
              {`${currentJourney.charAt(0).toUpperCase() + currentJourney.slice(1)} Journey`}
            </h3>
            <Progress value={journeyProgress} className="h-2" />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{journeyProgress}% Complete</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={isJourneyPaused ? resumeJourney : pauseJourney}
            title={isJourneyPaused ? "Resume Demo" : "Pause Demo"}
          >
            {isJourneyPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className="px-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/demo')}
            className="px-2"
          >
            <Home className="h-4 w-4 mr-1" /> Demo Home
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={advanceToNextStep}
            disabled={currentStep === totalSteps - 1}
            className="px-2"
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay;