import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface OverlappAnimationProps {
  className?: string;
}

const OverlappAnimation: React.FC<OverlappAnimationProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<p5 | null>(null);
  
  useEffect(() => {
    // Initialize p5 sketch
    const sketch = (p: p5) => {
      // Sketch variables
      const nodes: Node[] = [];
      const connections: Connection[] = [];
      const nodeCount = 30;  // Number of nodes
      const maxConnections = 20;  // Maximum number of connections
      let scrollY = 0;
      let lastScrollY = 0;
      let scrollVelocity = 0;
      
      // Classes for nodes and connections
      class Node {
        id: number;
        x: number;
        y: number;
        size: number;
        color: p.Color;
        type: 'user' | 'business';
        velocityX: number;
        velocityY: number;
        
        constructor(id: number) {
          this.id = id;
          this.x = p.random(p.width);
          this.y = p.random(p.height);
          this.size = p.random(5, 15);
          this.type = p.random() > 0.7 ? 'business' : 'user';
          this.color = this.type === 'business' 
            ? p.color(77, 127, 232, 200)  // Blue for businesses
            : p.color(64, 224, 208, 200); // Teal for users
          this.velocityX = p.random(-0.2, 0.2);
          this.velocityY = p.random(-0.2, 0.2);
        }
        
        update() {
          // Move nodes slowly
          this.x += this.velocityX;
          this.y += this.velocityY;
          
          // Respond to scroll velocity
          this.y += scrollVelocity * 0.1;
          
          // Wrap around edges
          if (this.x < 0) this.x = p.width;
          if (this.x > p.width) this.x = 0;
          if (this.y < 0) this.y = p.height;
          if (this.y > p.height) this.y = 0;
        }
        
        draw() {
          p.noStroke();
          p.fill(this.color);
          if (this.type === 'business') {
            // Businesses are squares
            p.rectMode(p.CENTER);
            p.rect(this.x, this.y, this.size, this.size, 2);
          } else {
            // Users are circles
            p.ellipse(this.x, this.y, this.size);
          }
        }
      }
      
      class Connection {
        source: Node;
        target: Node;
        strength: number;
        overlap: number;
        alpha: number;
        
        constructor(source: Node, target: Node) {
          this.source = source;
          this.target = target;
          this.strength = p.random(0.3, 1);
          this.overlap = p.random(0.2, 0.8);  // Overlap percentage
          this.alpha = 100;
        }
        
        update() {
          // Make connections more prominent when scrolling
          const targetAlpha = 100 + Math.min(Math.abs(scrollVelocity * 5), 155);
          this.alpha = p.lerp(this.alpha, targetAlpha, 0.1);
        }
        
        draw() {
          const d = p.dist(this.source.x, this.source.y, this.target.x, this.target.y);
          if (d < 200) {  // Only draw connections that are close enough
            // Calculate the position of the overlap indicator
            const midX = p.lerp(this.source.x, this.target.x, 0.5);
            const midY = p.lerp(this.source.y, this.target.y, 0.5);
            
            // Draw the connection line with gradient
            p.push();
            p.strokeWeight(this.strength * 2);
            const mainColor = p.color(255, 255, 255, this.alpha);
            p.stroke(mainColor);
            p.line(this.source.x, this.source.y, this.target.x, this.target.y);
            
            // Draw overlap indicator
            const overlapSize = this.overlap * 10 + 5;
            p.noStroke();
            p.fill(255, 255, 255, this.alpha + 50);
            p.ellipse(midX, midY, overlapSize);
            
            // Indicate overlap percentage with an inner circle color
            if (this.overlap > 0.6) {
              // High overlap - green
              p.fill(100, 200, 100, this.alpha + 100);
            } else if (this.overlap > 0.3) {
              // Medium overlap - yellow
              p.fill(240, 200, 80, this.alpha + 100);
            } else {
              // Low overlap - orange
              p.fill(240, 150, 80, this.alpha + 100);
            }
            p.ellipse(midX, midY, overlapSize * 0.6);
            p.pop();
          }
        }
      }
      
      p.setup = () => {
        // Create responsive canvas
        const canvas = p.createCanvas(
          containerRef.current?.offsetWidth || window.innerWidth,
          400
        );
        canvas.parent(containerRef.current!);
        
        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
          nodes.push(new Node(i));
        }
        
        // Create connections
        for (let i = 0; i < maxConnections; i++) {
          const sourceIndex = Math.floor(p.random(nodes.length));
          let targetIndex;
          do {
            targetIndex = Math.floor(p.random(nodes.length));
          } while (targetIndex === sourceIndex);
          
          connections.push(new Connection(nodes[sourceIndex], nodes[targetIndex]));
        }
        
        // Listen for scroll events
        window.addEventListener('scroll', handleScroll);
      };
      
      p.draw = () => {
        p.clear();
        
        // Update scroll velocity (ease to zero)
        scrollVelocity = scrollVelocity * 0.95;
        
        // Draw connections first (behind nodes)
        connections.forEach(connection => {
          connection.update();
          connection.draw();
        });
        
        // Draw and update nodes
        nodes.forEach(node => {
          node.update();
          node.draw();
        });
      };
      
      p.windowResized = () => {
        p.resizeCanvas(
          containerRef.current?.offsetWidth || window.innerWidth,
          400
        );
      };
      
      const handleScroll = () => {
        // Calculate scroll velocity
        scrollY = window.scrollY;
        scrollVelocity = scrollY - lastScrollY;
        lastScrollY = scrollY;
      };
      
      p.remove = () => {
        window.removeEventListener('scroll', handleScroll);
      };
    };
    
    // Initialize the p5 instance
    canvasRef.current = new p5(sketch, containerRef.current!);
    
    // Cleanup
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-[400px] ${className}`}
      aria-hidden="true" // Animation is decorative
    ></div>
  );
};

export default OverlappAnimation;