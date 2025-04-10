import React from 'react';
import { useDemo } from '@/hooks/use-demo';
import TutorialOverlay from './TutorialOverlay';
import SyntheticActivityFeed from './SyntheticActivityFeed';
import { Button } from '@/components/ui/button';
import { Play, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationControllerProps {
  showActivityFeed?: boolean;
}

/**
 * The SimulationController manages the overall demo experience.
 * It renders the tutorial overlay and synthetic activity feed when in demo mode.
 */
export const SimulationController: React.FC<SimulationControllerProps> = ({
  showActivityFeed = true,
}) => {
  const { 
    isDemoMode, 
    toggleDemoMode,
    currentJourney,
    endJourney
  } = useDemo();

  // Render the demo mode toggle button when not in demo mode
  if (!isDemoMode) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Button 
            onClick={toggleDemoMode}
            className="shadow-lg"
            size="sm"
          >
            <Play className="mr-2 h-4 w-4" />
            Enter Demo Mode
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // When in demo mode, render the tutorial overlay and optionally the activity feed
  return (
    <>
      {/* Tutorial overlay for guided navigation */}
      <TutorialOverlay />
      
      {/* Synthetic activity feed to show background activities */}
      {showActivityFeed && (
        <div className="fixed top-20 right-4 z-30 w-72 max-w-[90vw]">
          <SyntheticActivityFeed maxItems={3} />
        </div>
      )}
      
      {/* Quick exit button when in a journey */}
      {currentJourney && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-4 right-4 z-50"
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={endJourney}
            className="bg-card/80 backdrop-blur-sm shadow-md"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Exit Demo
          </Button>
        </motion.div>
      )}
    </>
  );
};

export default SimulationController;