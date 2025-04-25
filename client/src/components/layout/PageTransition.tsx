import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWindowSize } from 'react-use';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  transitionType?: 'fade' | 'slide' | 'scale' | 'combined';
}

export default function PageTransition({ 
  children, 
  className = '',
  transitionType = 'combined' 
}: PageTransitionProps) {
  const [location] = useLocation();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  
  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location]);

  // Type for variants to ensure consistency
  type TransitionVariant = {
    initial: any;
    animate: any;
    exit: any;
  };

  // Define different transition variants
  const fadeVariants: TransitionVariant = {
    initial: { opacity: 0, y: 0, scale: 1 },
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
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const slideVariants: TransitionVariant = {
    initial: { opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0, scale: 1 },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
    exit: {
      opacity: 0,
      x: isMobile ? 0 : -20,
      y: isMobile ? -20 : 0,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const scaleVariants: TransitionVariant = {
    initial: { opacity: 0, scale: 0.98, y: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const combinedVariants: TransitionVariant = {
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
        ease: [0.25, 0.1, 0.25, 1.0],
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

  // Choose the right variant based on transitionType
  let variants = combinedVariants;
  switch(transitionType) {
    case 'fade':
      variants = fadeVariants;
      break;
    case 'slide':
      variants = slideVariants;
      break;
    case 'scale':
      variants = scaleVariants;
      break;
    case 'combined':
    default:
      variants = combinedVariants;
  }

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