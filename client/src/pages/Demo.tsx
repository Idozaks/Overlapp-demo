import { useEffect } from "react";
import { DemoJourneySelector } from "@/components/demo";
import { useDemo } from "@/hooks/use-demo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Demo() {
  const { isDemoMode, currentJourney, endJourney } = useDemo();
  const [, navigate] = useLocation();

  // If user is in the middle of a journey and navigates back to this page,
  // end the journey (similar to "return to journey select" functionality)
  useEffect(() => {
    if (isDemoMode && currentJourney) {
      endJourney();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="grid gap-8">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold mb-4">Interactive Demo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience Overlapp's features firsthand through guided interactive journeys. 
              Select a journey type below to get started.
            </p>
          </div>
          
          <DemoJourneySelector className="mt-6" />
          
          <div className="text-center max-w-3xl mx-auto mt-8 text-sm text-muted-foreground">
            <p>
              Each demo journey will guide you through a key aspect of the Overlapp 
              experience with interactive tooltips and simulated activity. You can exit
              the demo at any time by clicking the "Exit Demo" button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
