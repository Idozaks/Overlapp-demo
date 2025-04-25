import { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

// Common animation variants
export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      ease: 'easeInOut'
    } 
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeInOut'
    } 
  }
};

export const slideInVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0] 
    } 
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0]
    } 
  }
};

export const scaleInVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0] 
    } 
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0]
    } 
  }
};

// Animation wrapper components
interface AnimatedElementProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const FadeIn = ({ children, className = '', delay = 0, ...props }: AnimatedElementProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInVariants}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideIn = ({ children, className = '', delay = 0, ...props }: AnimatedElementProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={slideInVariants}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, className = '', delay = 0, ...props }: AnimatedElementProps) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={scaleInVariants}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
);

// Staggered children animation
export const StaggerContainer = ({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  ...props 
}: AnimatedElementProps & { staggerDelay?: number }) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={{
      animate: {
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    {...props}
  >
    {children}
  </motion.div>
);