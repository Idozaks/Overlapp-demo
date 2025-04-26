import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

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
  speed = 25,
  className,
  onComplete
}: ThoughtStreamProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset streaming when target text changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [targetText]);
  
  // Stream the text gradually
  useEffect(() => {
    if (!targetText || currentIndex >= targetText.length) {
      if (currentIndex >= targetText.length && onComplete) {
        onComplete();
      }
      return;
    }
    
    // Add character one by one with a slight delay
    const timer = setTimeout(() => {
      setDisplayedText(prev => prev + targetText[currentIndex]);
      setCurrentIndex(prev => prev + 1);
      
      // Auto-scroll to bottom
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, speed);
    
    return () => clearTimeout(timer);
  }, [targetText, currentIndex, speed, onComplete]);
  
  return (
    <div 
      className={cn(
        "font-mono text-sm bg-muted/50 text-muted-foreground p-4 rounded-md overflow-y-auto max-h-80",
        isLoading && "animate-pulse",
        className
      )}
      ref={containerRef}
    >
      {isLoading && !displayedText ? (
        <div className="flex items-center gap-2">
          <span className="animate-blink">●</span>
          <span className="animate-pulse">Thinking...</span>
        </div>
      ) : (
        <>
          {displayedText}
          {currentIndex < targetText.length && (
            <span className="animate-blink">▎</span>
          )}
        </>
      )}
    </div>
  );
}