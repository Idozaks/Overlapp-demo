import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
  duration?: number;
  colors?: string[];
  ticks?: number;
  shapes?: ('square' | 'circle')[];
  origin?: {
    x?: number;
    y?: number;
  };
}

const defaultOptions: CelebrationOptions = {
  particleCount: 100,
  spread: 90,
  startVelocity: 30,
  decay: 0.9,
  scalar: 1,
  duration: 3000,
  colors: ['#4D7FE8', '#40E0D0', '#5D9EE5', '#45DDCD'],
  ticks: 60,
  shapes: ['square', 'circle'],
  origin: {
    x: 0.5,
    y: 0.5
  }
};

// Hack for TypeScript to make the types work better with the confetti library
type ConfettiFunction = (options?: CelebrationOptions) => Promise<void> | null;

export function useCelebration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<ConfettiFunction | null>(null);

  const initCanvas = useCallback((canvas?: HTMLCanvasElement) => {
    if (canvas) {
      canvasRef.current = canvas;
      confettiRef.current = confetti.create(canvas, {
        resize: true,
        useWorker: true
      }) as unknown as ConfettiFunction;
    } else if (typeof window !== 'undefined') {
      // If no canvas is provided, use the global instance
      confettiRef.current = confetti as unknown as ConfettiFunction;
    }
  }, []);

  const trigger = useCallback((options?: CelebrationOptions) => {
    if (!confettiRef.current) {
      // Fallback to global instance if not initialized
      confettiRef.current = confetti as unknown as ConfettiFunction;
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options
    };

    confettiRef.current?.(mergedOptions);
  }, []);

  const triggerFromElement = useCallback((element: HTMLElement, options?: CelebrationOptions) => {
    if (!confettiRef.current) {
      confettiRef.current = confetti as unknown as ConfettiFunction;
    }

    const rect = element.getBoundingClientRect();
    const elementWidth = rect.width;
    const elementHeight = rect.height;
    
    // Get the center position relative to the viewport
    const x = (rect.left + elementWidth / 2) / window.innerWidth;
    const y = (rect.top + elementHeight / 2) / window.innerHeight;

    trigger({
      ...options,
      origin: {
        x,
        y
      }
    });
  }, [trigger]);

  return {
    initCanvas,
    trigger,
    triggerFromElement
  };
}

export default useCelebration;