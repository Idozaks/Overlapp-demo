import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef, useState, useEffect } from 'react';
import { useWindowSize } from 'react-use';
import PageTransition from './PageTransition';

interface ParallaxElementProps {
  color: string;
  size: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  delay?: number;
  translateFactor?: number;
}

interface ParallaxLayoutProps {
  children: ReactNode;
  withParallax?: boolean;
  transitionType?: 'fade' | 'slide' | 'scale' | 'combined';
  backgroundElements?: ParallaxElementProps[];
}

// Default background elements
const defaultBackgroundElements: ParallaxElementProps[] = [
  {
    color: 'primary/20',
    size: 'w-40 h-40',
    position: { top: '10%', left: '5%' },
    delay: 0.1,
    translateFactor: 1.2
  },
  {
    color: 'secondary/20',
    size: 'w-60 h-60',
    position: { top: '30%', right: '10%' },
    delay: 0.2,
    translateFactor: 0.8
  },
  {
    color: 'accent/20',
    size: 'w-80 h-80',
    position: { bottom: '10%', left: '30%' },
    delay: 0.3,
    translateFactor: 1.5
  },
  {
    color: 'primary/10',
    size: 'w-52 h-52',
    position: { top: '60%', right: '5%' },
    delay: 0.4,
    translateFactor: 1.0
  }
];

export default function ParallaxLayout({ 
  children, 
  withParallax = true,
  transitionType = 'combined',
  backgroundElements = defaultBackgroundElements
}: ParallaxLayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Parallax transformations for different elements
  const backgroundY = useTransform(scrollY, [0, 500], [0, -50]);
  const contentY = useTransform(scrollY, [0, 500], [0, isMobile ? 50 : 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.9]);
  
  // Detect if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !hasScrolled) {
        setHasScrolled(true);
      } else if (window.scrollY === 0 && hasScrolled) {
        setHasScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);
  
  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Background elements with parallax effect */}
      {withParallax && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0 opacity-20"
          style={{ y: backgroundY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2, transition: { duration: 0.8, delay: 0.2 } }}
        >
          {backgroundElements.map((element, index) => {
            // Create a unique y transform for each element based on their translate factor
            const elementY = useTransform(
              scrollY, 
              [0, 500], 
              [0, -50 * (element.translateFactor || 1)]
            );
            
            return (
              <motion.div 
                key={index}
                className={`absolute ${element.size} rounded-full bg-${element.color} blur-3xl`}
                style={{
                  ...element.position,
                  y: elementY,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    duration: 0.8, 
                    delay: element.delay || 0.1 * index,
                    ease: [0.25, 0.1, 0.25, 1.0]
                  } 
                }}
              />
            );
          })}
        </motion.div>
      )}
      
      {/* Main content with subtle parallax effect */}
      <PageTransition transitionType={transitionType}>
        <motion.div 
          className="relative z-10"
          style={withParallax ? { y: contentY, opacity } : {}}
        >
          {children}
        </motion.div>
      </PageTransition>
      
      {/* Subtle floating foreground elements for depth */}
      {withParallax && !isMobile && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{ y: useTransform(scrollY, [0, 500], [0, 30]) }}
        >
          <motion.div 
            className="absolute top-1/2 right-10 w-20 h-20 rounded-full border border-primary/10 opacity-40"
            animate={{ 
              y: [0, 10, 0], 
              transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } 
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-10 w-12 h-12 rounded-full border border-accent/10 opacity-40"
            animate={{ 
              y: [0, -15, 0], 
              transition: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 } 
            }}
          />
        </motion.div>
      )}
    </div>
  );
}