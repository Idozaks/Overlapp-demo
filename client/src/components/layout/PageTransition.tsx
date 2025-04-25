import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [location] = useLocation();
  
  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Animation variants for page transitions
  const variants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0], // Smooth cubic bezier
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className={`page-transition ${className}`}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      key={location}
    >
      {children}
    </motion.div>
  );
}