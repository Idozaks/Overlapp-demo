import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Brain, Pause, Play, Clock, Sparkles, RefreshCw, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ThoughtStreamProps {
  targetText: string;
  typingSpeed?: number;
  isLoading?: boolean;
  className?: string;
  maxHeight?: string;
  initialDelay?: number;
  showTimestamp?: boolean;
}

// Keyframes effect styles to highlight specific insights
const HIGHLIGHT_KEYWORDS = [
  'important', 'note', 'key insight', 'conclusion', 'summary', 'findings', 
  'analysis', 'recommend', 'prediction', 'pattern', 'interesting', 'significant'
];

/**
 * Enhanced ThoughtStream component for displaying AI thought processes with a realistic typing animation
 * This creates a terminal-like animated display of an AI's reasoning process with visual flourishes
 */
export function ThoughtStream({
  targetText,
  typingSpeed = 15, // Faster default typing speed
  isLoading = false,
  className,
  maxHeight = '300px',
  initialDelay = 300,
  showTimestamp = true
}: ThoughtStreamProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [typingStartTime, setTypingStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [typingVariance, setTypingVariance] = useState<number[]>([]);
  const [fadeInSections, setFadeInSections] = useState<number[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate random typing variance when the component mounts
  useEffect(() => {
    // Create an array of typing speed variances to make typing look more natural
    // Values < 1 make typing faster, values > 1 make it slower
    if (targetText) {
      const variances = Array.from({ length: targetText.length }, () => {
        // Occasionally introduce a longer pause (e.g., at punctuation)
        const isPunctuation = Math.random() < 0.1;
        return isPunctuation ? 3 + Math.random() * 2 : 0.8 + Math.random() * 0.4;
      });
      setTypingVariance(variances);
      
      // Generate positions where we'll create section breaks (with fade-in effects)
      const textLength = targetText.length;
      // Add fade-in breaks approximately every 100-200 characters
      const numSections = Math.max(1, Math.floor(textLength / 150));
      const sectionPositions = Array.from({ length: numSections }, (_, i) => {
        // Find nearby paragraph breaks if possible
        const targetPos = Math.floor((i + 1) * (textLength / (numSections + 1)));
        const range = 50; // Look 50 chars in either direction for a paragraph break
        
        // Search for paragraph breaks around the target position
        for (let j = 0; j < range; j++) {
          const forwardPos = Math.min(targetPos + j, textLength - 1);
          const backwardPos = Math.max(targetPos - j, 0);
          
          // Check if we found a paragraph break
          if (targetText[forwardPos] === '\n' && targetText[forwardPos + 1] === '\n') {
            return forwardPos + 2;
          }
          if (targetText[backwardPos] === '\n' && targetText[backwardPos + 1] === '\n') {
            return backwardPos + 2;
          }
        }
        
        // If no paragraph break was found, just use the target position
        return targetPos;
      });
      
      setFadeInSections(sectionPositions);
    }
  }, [targetText]);
  
  // Effect to handle the typing animation with natural-feeling speed variance
  useEffect(() => {
    if (!targetText || currentIndex >= targetText.length || isPaused) {
      return;
    }
    
    // Start the timer when typing begins
    if (currentIndex === 0 && !typingStartTime) {
      setTypingStartTime(new Date());
    }
    
    // Apply initial delay before starting to type
    if (currentIndex === 0) {
      const initialDelayTimeout = setTimeout(() => {
        startTypingInterval();
      }, initialDelay);
      
      return () => clearTimeout(initialDelayTimeout);
    } else {
      startTypingInterval();
    }
    
    function startTypingInterval() {
      // Get current character and its "typing difficulty"
      const currentChar = targetText.charAt(currentIndex);
      // Slow down at punctuation to simulate thinking
      const isPunctuation = ['.', ',', '!', '?', ';', ':', '-'].includes(currentChar);
      // Slow down at the end of paragraphs
      const isEndOfParagraph = currentChar === '\n' && targetText.charAt(currentIndex + 1) === '\n';
      
      // Calculate adjusted typing speed with variance
      let adjustedSpeed = typingSpeed * (typingVariance[currentIndex] || 1);
      
      // Add additional pauses for punctuation and paragraph breaks
      if (isPunctuation) adjustedSpeed *= 2;
      if (isEndOfParagraph) adjustedSpeed *= 5;
      
      // Set up the typing interval with variable speed
      const typingTimeout = setTimeout(() => {
        if (currentIndex < targetText.length) {
          setDisplayedText(prev => prev + currentChar);
          setCurrentIndex(prev => prev + 1);
          
          // Auto-scroll to the bottom as new text appears
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }
      }, adjustedSpeed);
      
      // Clean up the timeout
      return () => clearTimeout(typingTimeout);
    }
  }, [targetText, currentIndex, isPaused, typingSpeed, typingVariance, initialDelay, typingStartTime]);
  
  // Timer for elapsed time
  useEffect(() => {
    if (typingStartTime && !isPaused && currentIndex < targetText?.length) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - typingStartTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [typingStartTime, isPaused, currentIndex, targetText]);
  
  // Reset when target text changes completely
  useEffect(() => {
    if (targetText && targetText !== displayedText && displayedText !== targetText.substring(0, displayedText.length)) {
      setDisplayedText('');
      setCurrentIndex(0);
      setTypingStartTime(null);
      setElapsedSeconds(0);
    }
  }, [targetText, displayedText]);
  
  // Format elapsed time as mm:ss
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate typing completion percentage
  const completionPercentage = targetText ? Math.round((currentIndex / targetText.length) * 100) : 0;
  
  // Reset the typing animation
  const resetAnimation = () => {
    setDisplayedText('');
    setCurrentIndex(0);
    setTypingStartTime(new Date());
    setElapsedSeconds(0);
    setIsPaused(false);
  };
  
  // Skip to the end of the animation
  const skipToEnd = () => {
    if (targetText) {
      setDisplayedText(targetText);
      setCurrentIndex(targetText.length);
      setIsPaused(true);
    }
  };
  
  // Function to render text with highlighted keywords
  const renderHighlightedText = () => {
    if (!displayedText) return null;
    
    // Process the text to find and highlight keywords
    const parts = [];
    let currentSegment = '';
    let lastProcessedIndex = 0;
    
    // Split by lines to preserve newlines in the rendering
    const lines = displayedText.split('\n');
    
    return (
      <>
        {lines.map((line, lineIndex) => {
          // Check if this line starts with any of our highlight patterns
          const isHighlighted = HIGHLIGHT_KEYWORDS.some(keyword => 
            line.toLowerCase().includes(keyword.toLowerCase())
          );
          
          // Check if this line should fade in (if it's at one of our fade points)
          const isFadeInSection = fadeInSections.some(pos => 
            // Calculate approximate position in the text
            displayedText.substring(0, pos).split('\n').length - 1 === lineIndex
          );
          
          return (
            <React.Fragment key={lineIndex}>
              <div 
                className={cn(
                  "transition-all", 
                  isHighlighted && "text-primary font-medium bg-primary/5 px-1 rounded", 
                  isFadeInSection && "animate-fade-in pt-3 border-t border-dotted border-primary/20"
                )}
              >
                {line || ' '}
              </div>
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          );
        })}
      </>
    );
  };
  
  return (
    <div 
      className={cn(
        "relative font-mono text-xs border rounded-lg bg-card shadow-sm",
        className
      )}
    >
      {/* Terminal-like header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">AI Reasoning Process</span>
        </div>
        
        {showTimestamp && (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>
        )}
      </div>
      
      {/* Progress indicator */}
      <Progress value={completionPercentage} className="h-0.5 rounded-none" />
      
      {/* Content area */}
      <div className="p-3 pb-1">
        <div 
          ref={containerRef}
          className="overflow-auto whitespace-pre-wrap leading-relaxed"
          style={{ maxHeight }}
        >
          {/* Display text with enhanced formatting */}
          {displayedText ? (
            renderHighlightedText()
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse py-6 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">AI thinking...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <Sparkles className="h-6 w-6 text-primary/60 mb-1" />
              <span className="text-muted-foreground">Start streaming to see the AI's thought process</span>
              <span className="text-xs text-muted-foreground opacity-70">Watch in real-time as the AI reasons through your request</span>
            </div>
          )}
          
          {/* Cursor when typing */}
          {displayedText && currentIndex < (targetText?.length || 0) && !isPaused && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
      
      {/* Footer controls */}
      {targetText && displayedText && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20 gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="h-6 text-xs gap-1"
              disabled={currentIndex >= targetText?.length}
            >
              {isPaused ? (
                <>
                  <Play className="h-3 w-3" /> Resume
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3" /> Pause
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAnimation}
              className="h-6 text-xs gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Restart
            </Button>
            
            {currentIndex < targetText?.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={skipToEnd}
                className="h-6 text-xs gap-1"
              >
                <FastForward className="h-3 w-3" /> Skip
              </Button>
            )}
          </div>
          
          <Badge variant="outline" className="text-xs bg-background">
            {completionPercentage}% complete
          </Badge>
        </div>
      )}
    </div>
  );
}