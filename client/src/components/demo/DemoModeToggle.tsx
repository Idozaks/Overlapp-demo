import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/hooks/use-demo';
import {
  Play,
  Pause,
  Monitor,
  MonitorOff,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode, isJourneyPaused, pauseJourney, resumeJourney, allJourneyTypes, startJourney } = useDemo();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={isDemoMode ? "border-primary text-primary" : ""}
              onClick={isDemoMode ? toggleDemoMode : () => setIsDialogOpen(true)}
            >
              {isDemoMode ? (
                <>
                  <MonitorOff className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Exit Demo</span>
                </>
              ) : (
                <>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Demo Mode</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isDemoMode ? "Exit Demo Mode" : "Enter Demo Mode"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isDemoMode && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={isJourneyPaused ? resumeJourney : pauseJourney}
              >
                {isJourneyPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isJourneyPaused ? "Resume Demo" : "Pause Demo"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Demo Mode</DialogTitle>
            <DialogDescription>
              Choose a demo journey to explore Overlapp's features
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col h-auto p-4 gap-2 items-center justify-center"
              onClick={() => {
                startJourney('socialDiscovery');
                setIsDialogOpen(false);
              }}
            >
              <Badge variant="outline" className="mb-2">Social</Badge>
              <h3 className="font-semibold">Social Discovery</h3>
              <p className="text-xs text-center text-muted-foreground">
                Explore how Overlapp connects people through shared interests
              </p>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col h-auto p-4 gap-2 items-center justify-center"
              onClick={() => {
                startJourney('physicalIntegration');
                setIsDialogOpen(false);
              }}
            >
              <Badge variant="outline" className="mb-2">Physical</Badge>
              <h3 className="font-semibold">Physical Integration</h3>
              <p className="text-xs text-center text-muted-foreground">
                See how Overlapp bridges digital and physical experiences
              </p>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col h-auto p-4 gap-2 items-center justify-center"
              onClick={() => {
                startJourney('identityManagement');
                setIsDialogOpen(false);
              }}
            >
              <Badge variant="outline" className="mb-2">Identity</Badge>
              <h3 className="font-semibold">Identity Management</h3>
              <p className="text-xs text-center text-muted-foreground">
                Learn how to manage your digital identity attributes
              </p>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col h-auto p-4 gap-2 items-center justify-center"
              onClick={() => {
                startJourney('marketplace');
                setIsDialogOpen(false);
              }}
            >
              <Badge variant="outline" className="mb-2">Market</Badge>
              <h3 className="font-semibold">Marketplace</h3>
              <p className="text-xs text-center text-muted-foreground">
                Discover entities and businesses that match your interests
              </p>
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toggleDemoMode();
              setIsDialogOpen(false);
            }}>
              Quick Start Demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DemoModeToggle;