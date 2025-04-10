import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface PhysicalDigitalOverlapProps {
  className?: string;
}

const PhysicalDigitalOverlap: React.FC<PhysicalDigitalOverlapProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<p5 | null>(null);
  
  useEffect(() => {
    // Initialize p5 sketch
    const sketch = (p: p5) => {
      // Animation variables
      let scrollProgress = 0;
      let digitalProfileRadius = 120;
      let physicalWorldRadius = 120;
      let userX: number;
      let userY: number;
      const particles: Particle[] = [];
      const particleCount = 100;
      const interests = [
        'Coffee', 'Books', 'Music', 'Art', 'Tech', 
        'Fitness', 'Travel', 'Food', 'Fashion', 'Movies'
      ];
      const locations = [
        'Café', 'Bookstore', 'Concert Venue', 'Gallery', 
        'Tech Shop', 'Gym', 'Travel Agency', 'Restaurant', 'Boutique', 'Cinema'
      ];
      
      class Particle {
        x: number;
        y: number;
        targetX: number;
        targetY: number;
        size: number;
        color: p.Color;
        text: string;
        type: 'interest' | 'location';
        speed: number;
        highlighted: boolean;
        
        constructor(text: string, type: 'interest' | 'location') {
          this.text = text;
          this.type = type;
          this.size = p.random(5, 12);
          this.highlighted = Math.random() > 0.7; // Some particles will be highlighted
          
          // Set color based on type and highlight status
          if (type === 'interest') {
            this.color = this.highlighted 
              ? p.color(64, 224, 208, 200) // Highlighted interests are teal
              : p.color(100, 180, 240, 150); // Regular interests are light blue
          } else {
            this.color = this.highlighted 
              ? p.color(240, 150, 80, 200) // Highlighted locations are orange
              : p.color(150, 150, 150, 150); // Regular locations are gray
          }
          
          // Initialize positions
          const angle = p.random(p.TWO_PI);
          const radius = type === 'interest' ? digitalProfileRadius : physicalWorldRadius;
          this.x = p.width/2 + p.cos(angle) * radius * p.random(0.7, 1.0);
          this.y = p.height/2 + p.sin(angle) * radius * p.random(0.7, 1.0);
          
          // Target positions (for animation)
          this.targetX = this.x;
          this.targetY = this.y;
          
          this.speed = p.random(0.01, 0.05);
        }
        
        update(scrollProgress: number) {
          // Update target position based on scroll progress
          const angle = p.random(p.TWO_PI);
          const radius = this.type === 'interest' ? digitalProfileRadius : physicalWorldRadius;
          
          if (scrollProgress > 0.7) {
            // When scrolled far enough, highlighted particles move toward center for "overlap"
            if (this.highlighted) {
              this.targetX = p.lerp(this.targetX, p.width/2, 0.01);
              this.targetY = p.lerp(this.targetY, p.height/2, 0.01);
            }
          } else {
            // Normal orbital movement
            const orbitSpeed = this.type === 'interest' ? 0.001 : 0.0005;
            const t = p.frameCount * orbitSpeed;
            const noise = p.noise(this.x * 0.01, this.y * 0.01, t) * 30;
            
            this.targetX = p.width/2 + p.cos(angle + t) * (radius + noise) * p.random(0.95, 1.05);
            this.targetY = p.height/2 + p.sin(angle + t) * (radius + noise) * p.random(0.95, 1.05);
          }
          
          // Move toward target
          this.x = p.lerp(this.x, this.targetX, this.speed);
          this.y = p.lerp(this.y, this.targetY, this.speed);
        }
        
        draw() {
          p.noStroke();
          p.fill(this.color);
          p.ellipse(this.x, this.y, this.size);
          
          // Draw text for highlighted particles
          if (this.highlighted && this.size > 8) {
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(10);
            p.text(this.text, this.x, this.y + 12);
          }
          
          // Draw connections between matching highlighted particles
          if (this.highlighted) {
            particles.forEach(other => {
              if (other !== this && other.highlighted && 
                  ((this.type === 'interest' && other.type === 'location') || 
                   (this.type === 'location' && other.type === 'interest'))) {
                
                // Check if interest and location match (coffee -> café, etc.)
                const matchIndex = interests.indexOf(this.type === 'interest' ? this.text : other.text);
                if (matchIndex >= 0 && 
                    (this.type === 'location' ? this.text : other.text) === locations[matchIndex]) {
                  
                  // Draw connection line for matches
                  p.stroke(255, 255, 255, 100);
                  p.strokeWeight(1);
                  p.line(this.x, this.y, other.x, other.y);
                  
                  // Draw overlap indicator
                  const midX = (this.x + other.x) / 2;
                  const midY = (this.y + other.y) / 2;
                  p.noStroke();
                  p.fill(220, 100, 150, 150);
                  p.ellipse(midX, midY, 8);
                }
              }
            });
          }
        }
      }
      
      p.setup = () => {
        // Create responsive canvas
        const canvas = p.createCanvas(
          containerRef.current?.offsetWidth || window.innerWidth,
          500
        );
        canvas.parent(containerRef.current!);
        
        // Initialize user position
        userX = p.width / 2;
        userY = p.height / 2;
        
        // Create particles
        for (let i = 0; i < particleCount/2; i++) {
          // Add interest particles
          particles.push(new Particle(
            interests[Math.floor(p.random(interests.length))],
            'interest'
          ));
          
          // Add location particles
          particles.push(new Particle(
            locations[Math.floor(p.random(locations.length))],
            'location'
          ));
        }
        
        // Listen for scroll events
        window.addEventListener('scroll', handleScroll);
      };
      
      p.draw = () => {
        p.clear();
        
        // Draw background circles
        p.noFill();
        p.strokeWeight(1);
        
        // Digital profile circle
        p.stroke(64, 224, 208, 100);
        p.ellipse(p.width/2, p.height/2, digitalProfileRadius * 2);
        
        // Physical world circle
        p.stroke(240, 150, 80, 100);
        p.ellipse(p.width/2, p.height/2, physicalWorldRadius * 2);
        
        // Center user
        p.noStroke();
        p.fill(255, 255, 255, 200);
        p.ellipse(userX, userY, 15);
        
        // Update particles
        particles.forEach(particle => {
          particle.update(scrollProgress);
          particle.draw();
        });
        
        // Draw labels
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(14);
        p.text("Digital Identity", p.width/2, p.height/2 - digitalProfileRadius - 20);
        p.text("Physical World", p.width/2, p.height/2 + physicalWorldRadius + 20);
        
        // Draw overlap visualization based on scroll
        if (scrollProgress > 0.5) {
          const overlapText = "Finding Overlaps";
          p.textSize(18);
          p.fill(255, 255, 255, p.map(scrollProgress, 0.5, 0.8, 0, 255));
          p.text(overlapText, p.width/2, 30);
        }
        
        // When scrolled far, show connection message
        if (scrollProgress > 0.8) {
          const connectionText = "Connecting Digital Identity with Physical World";
          p.textSize(16);
          p.fill(255, 255, 255, p.map(scrollProgress, 0.8, 1.0, 0, 255));
          p.text(connectionText, p.width/2, p.height - 30);
          
          // Draw central overlap zone
          p.noFill();
          p.stroke(255, 255, 255, p.map(scrollProgress, 0.8, 1.0, 0, 100));
          p.ellipse(p.width/2, p.height/2, 80);
        }
      };
      
      p.windowResized = () => {
        p.resizeCanvas(
          containerRef.current?.offsetWidth || window.innerWidth,
          500
        );
        // Recenter
        userX = p.width / 2;
        userY = p.height / 2;
      };
      
      const handleScroll = () => {
        // Calculate scroll progress (0 to 1)
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
        
        // Update radii based on scroll - they converge as the user scrolls
        const minRadius = 100;
        const maxRadius = 180;
        const convergence = p.map(scrollProgress, 0, 1, 0, 0.7);
        
        digitalProfileRadius = p.lerp(maxRadius, minRadius, convergence);
        physicalWorldRadius = p.lerp(maxRadius, minRadius, convergence);
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
      className={`relative w-full h-[500px] ${className}`}
      aria-hidden="true" // Animation is decorative
    >
      <div className="absolute top-2 left-2 bg-black/30 text-white text-xs px-2 py-1 rounded">
        Scroll to see the overlap animation
      </div>
    </div>
  );
};

export default PhysicalDigitalOverlap;