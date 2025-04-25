import { AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ParallaxLayout from './ParallaxLayout';

interface AnimatedRoutesProps {
  children: ReactNode;
}

export default function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const [location] = useLocation();
  const [isReady, setIsReady] = useState(false);

  // This prevents animation on initial load
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Determine which pages should have parallax effects
  // For example, we might want to disable it on certain pages like the auth page
  const shouldHaveParallax = !location.includes('/auth');

  if (!isReady) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <ParallaxLayout key={location} withParallax={shouldHaveParallax}>
        {children}
      </ParallaxLayout>
    </AnimatePresence>
  );
}