import React, { useState, useEffect } from 'react';
import { useDemo } from '@/hooks/use-demo';
import TutorialOverlay from './TutorialOverlay';
import SyntheticActivityFeed from './SyntheticActivityFeed';
import { Button } from '@/components/ui/button';
import { Play, SkipForward, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

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
    endJourney,
    startJourney
  } = useDemo();
  
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Handle demo mode toggling with loading state
  const handleToggleDemoMode = () => {
    setIsLoading(true);
    try {
      toggleDemoMode();
      
      // If we're entering demo mode but no journey is started, start the first journey
      if (!isDemoMode) {
        // Use setTimeout to allow state to update
        setTimeout(() => {
          startJourney('socialDiscovery');
          toast({
            title: "Demo Mode Activated",
            description: "Welcome to demo mode! Navigate through the experience to learn about Overlapp."
          });
        }, 100);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error toggling demo mode:", error);
      toast({
        title: "Demo Mode Error",
        description: "There was an error starting demo mode. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Log demo state for debugging
    console.log("Demo state:", { isDemoMode, currentJourney });
  }, [isDemoMode, currentJourney]);

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
            onClick={handleToggleDemoMode}
            className="shadow-lg"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
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