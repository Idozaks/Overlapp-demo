import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ThoughtStreamProps {
  targetText: string;
  typingSpeed?: number;
  isLoading?: boolean;
  className?: string;
  maxHeight?: string;
}

/**
 * ThoughtStream component for displaying AI thought processes with a typing animation
 * This creates a terminal-like animated display of an AI's reasoning process
 */
export function ThoughtStream({
  targetText,
  typingSpeed = 25,
  isLoading = false,
  className,
  maxHeight = '200px'
}: ThoughtStreamProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Effect to handle the typing animation
  useEffect(() => {
    // Reset if target text changes
    if (targetText !== displayedText && currentIndex === displayedText.length) {
      setCurrentIndex(0);
      setDisplayedText('');
    }
    
    // No animation if there's no text or we're already at the end
    if (!targetText || currentIndex >= targetText.length || isPaused) {
      return;
    }
    
    // Set up the typing interval
    const typingInterval = setInterval(() => {
      if (currentIndex < targetText.length) {
        setDisplayedText(prev => prev + targetText.charAt(currentIndex));
        setCurrentIndex(prev => prev + 1);
        
        // Auto-scroll to the bottom as new text appears
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);
    
    // Clean up the interval
    return () => clearInterval(typingInterval);
  }, [targetText, currentIndex, displayedText, typingSpeed, isPaused]);
  
  // Reset when target text changes completely
  useEffect(() => {
    if (targetText && targetText !== displayedText && displayedText !== targetText.substring(0, displayedText.length)) {
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [targetText]);
  
  return (
    <div 
      className={cn(
        "relative font-mono text-xs border rounded-md bg-background p-3",
        className
      )}
    >
      <div 
        ref={containerRef}
        className="overflow-auto whitespace-pre-wrap"
        style={{ maxHeight }}
      >
        {displayedText || (isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>AI thinking...</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Start streaming to see AI's thought process...</span>
        ))}
        <span className={cn(
          "inline-block w-2 h-4 ml-1 bg-primary/70 animate-pulse",
          (currentIndex >= targetText?.length || isPaused) && "opacity-0"
        )} />
      </div>
      
      {targetText && displayedText && (
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="text-xs underline hover:text-primary transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <span>
            {Math.round((currentIndex / (targetText?.length || 1)) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}