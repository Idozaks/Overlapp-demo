import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import PageTransition from './PageTransition';

interface ParallaxLayoutProps {
  children: ReactNode;
  withParallax?: boolean;
}

export default function ParallaxLayout({ 
  children, 
  withParallax = true 
}: ParallaxLayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax transformations for different elements
  const backgroundY = useTransform(scrollY, [0, 500], [0, -50]);
  const contentY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  
  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Background elements with parallax effect */}
      {withParallax && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0 opacity-20"
          style={{ y: backgroundY }}
        >
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-1/3 right-20 w-60 h-60 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
        </motion.div>
      )}
      
      {/* Main content with subtle parallax effect */}
      <PageTransition>
        <motion.div 
          className="relative z-10"
          style={withParallax ? { y: contentY, opacity } : {}}
        >
          {children}
        </motion.div>
      </PageTransition>
    </div>
  );
}