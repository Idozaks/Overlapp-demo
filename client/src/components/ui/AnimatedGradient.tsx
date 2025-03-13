import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function AnimatedGradient() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [lines, setLines] = useState<JSX.Element[]>([]);
  const [gridPoints, setGridPoints] = useState<{ x: number; y: number }[]>([]);

  // Generate grid points
  useEffect(() => {
    if (svgRef.current) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const spacing = 80; // Grid spacing
      const points = [];
      
      // Create grid points with some randomization
      for (let x = 40; x < width; x += spacing) {
        for (let y = 40; y < height; y += spacing) {
          // Add some randomness to position
          const randomX = x + (Math.random() - 0.5) * 20;
          const randomY = y + (Math.random() - 0.5) * 20;
          points.push({ x: randomX, y: randomY });
        }
      }
      
      setGridPoints(points);
    }
  }, []);

  // Generate connecting lines between points
  useEffect(() => {
    if (gridPoints.length > 0) {
      const newLines: JSX.Element[] = [];
      
      // Connect some random points
      for (let i = 0; i < gridPoints.length; i++) {
        // Only connect to some nearby points
        if (Math.random() > 0.7) {
          // Find closest points
          for (let j = 0; j < gridPoints.length; j++) {
            if (i !== j) {
              const distance = Math.sqrt(
                Math.pow(gridPoints[i].x - gridPoints[j].x, 2) +
                Math.pow(gridPoints[i].y - gridPoints[j].y, 2)
              );
              
              // Only connect if points are close enough
              if (distance < 150 && Math.random() > 0.85) {
                const lineId = `line-${i}-${j}`;
                const animationDelay = Math.random() * 5;
                const animationDuration = 3 + Math.random() * 5;
                
                newLines.push(
                  <motion.line
                    key={lineId}
                    x1={gridPoints[i].x}
                    y1={gridPoints[i].y}
                    x2={gridPoints[j].x}
                    y2={gridPoints[j].y}
                    stroke="rgba(var(--color-primary-rgb), 0.2)"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: [0, 1, 1, 0], 
                      opacity: [0, 0.5, 0.5, 0] 
                    }}
                    transition={{ 
                      duration: animationDuration,
                      ease: "easeInOut", 
                      repeat: Infinity, 
                      delay: animationDelay,
                      repeatDelay: Math.random() * 3
                    }}
                  />
                );
              }
            }
          }
        }
      }
      
      setLines(newLines);
    }
  }, [gridPoints]);

  return (
    <motion.div 
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950" />
      
      {/* Grid background */}
      <div className="absolute inset-0 opacity-50">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="0.5"
                className="dark:stroke-white/5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Animated connecting lines */}
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        className="absolute inset-0 z-10"
      >
        {lines}
        {gridPoints.map((point, index) => (
          <motion.circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="rgba(var(--color-primary-rgb), 0.5)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 1.5, 1],
              opacity: [0, 0.7, 0.7, 0]
            }}
            transition={{ 
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: Math.random() * 5,
              repeatDelay: Math.random() * 3
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}
