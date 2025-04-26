import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Stars } from "lucide-react";
import { cn } from "@/lib/utils";

const THINKING_STEPS = [
  "Analyzing user profiles...",
  "Comparing shared interests and preferences...",
  "Evaluating communication styles...",
  "Examining cultural backgrounds...",
  "Identifying common values...",
  "Calculating compatibility score...",
  "Generating personalized recommendations...",
  "Finalizing analysis..."
];

interface ThoughtStreamProps {
  targetText: string;
  isLoading?: boolean;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function ThoughtStream({
  targetText,
  isLoading = false,
  speed = 100,
  className,
  onComplete
}: ThoughtStreamProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset component when targetText changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentStep(0);
    setIsTyping(false);
    setIsComplete(false);
    
    if (!isLoading && targetText) {
      startThinking();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetText, isLoading]);
  
  // Simulate thinking process with steps
  const startThinking = () => {
    setIsTyping(true);
    showNextThinkingStep();
  };
  
  const showNextThinkingStep = () => {
    if (currentStep < THINKING_STEPS.length) {
      setDisplayedText(THINKING_STEPS[currentStep]);
      setCurrentStep(prev => prev + 1);
      
      // Schedule next thinking step
      timeoutRef.current = setTimeout(() => {
        showNextThinkingStep();
      }, speed * 10);
    } else {
      // Start typing the actual target text
      typeTargetText(0);
    }
  };
  
  // Type out the actual target text character by character
  const typeTargetText = (index: number) => {
    if (index <= targetText.length) {
      setDisplayedText(targetText.substring(0, index));
      
      if (index < targetText.length) {
        // Schedule next character
        timeoutRef.current = setTimeout(() => {
          typeTargetText(index + 1);
        }, speed / 10);
      } else {
        // Typing complete
        setIsTyping(false);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-primary/5 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          AI Thinking Process
          {isTyping && (
            <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
              Processing...
            </Badge>
          )}
          {isComplete && (
            <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500">
              <Stars className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isTyping ? "Analyzing data and generating insights..." : "Analysis complete"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          </div>
        ) : (
          <div className="relative prose max-w-none dark:prose-invert prose-p:leading-relaxed">
            {displayedText.split("\n").map((paragraph, idx) => (
              paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
            ))}
            {isTyping && (
              <span className="inline-block h-4 w-2 ml-1 bg-primary animate-pulse" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}