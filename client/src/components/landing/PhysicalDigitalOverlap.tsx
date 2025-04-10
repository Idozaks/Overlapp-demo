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
      let digitalProfileRadius = 140;
      let physicalWorldRadius = 140;
      let userX: number;
      let userY: number;
      const particles: Particle[] = [];
      const connections: Connection[] = [];
      const particleCount = 60; // Reduced for cleaner visualization
      
      // More meaningful labels for relationships
      const digitalIdentities = [
        'Coffee Preferences', 'Reading Habits', 'Music Taste', 'Art Interests', 
        'Tech Engagement', 'Fitness Goals', 'Travel History', 'Food Preferences', 
        'Fashion Style', 'Movie Tastes', 'Educational Background', 
        'Wellness Practices', 'Photography Style', 'Outdoor Activities', 'Shopping Behavior'
      ];
      
      const physicalPlaces = [
        'Local Café', 'Independent Bookstore', 'Music Venue', 'Art Gallery', 
        'Tech Store', 'Fitness Studio', 'Travel Agency', 'Local Restaurant', 
        'Boutique Shop', 'Cinema', 'Learning Center', 'Wellness Spa', 
        'Camera Shop', 'Outdoor Equipment Store', 'Shopping District'
      ];
      
      // Topic categories to show relationships more clearly
      const topicCategories = {
        'Food & Drink': ['Coffee Preferences', 'Food Preferences', 'Local Café', 'Local Restaurant'],
        'Arts & Culture': ['Art Interests', 'Reading Habits', 'Music Taste', 'Independent Bookstore', 'Art Gallery', 'Music Venue'],
        'Lifestyle': ['Fashion Style', 'Wellness Practices', 'Shopping Behavior', 'Boutique Shop', 'Wellness Spa', 'Shopping District'],
        'Technology': ['Tech Engagement', 'Photography Style', 'Tech Store', 'Camera Shop'],
        'Entertainment': ['Movie Tastes', 'Cinema'],
        'Education': ['Educational Background', 'Learning Center'],
        'Fitness & Outdoors': ['Fitness Goals', 'Outdoor Activities', 'Fitness Studio', 'Outdoor Equipment Store'],
        'Travel': ['Travel History', 'Travel Agency']
      };
      
      // Get category for an item
      function getCategoryForItem(item: string): string {
        for (const [category, items] of Object.entries(topicCategories)) {
          if (items.includes(item)) {
            return category;
          }
        }
        return 'Other';
      }
      
      // Get category color
      function getCategoryColor(category: string, alpha: number = 200): p5.Color {
        const colorMap: {[key: string]: p5.Color} = {
          'Food & Drink': p.color(255, 153, 51, alpha),         // Orange
          'Arts & Culture': p.color(153, 102, 255, alpha),       // Purple
          'Lifestyle': p.color(255, 102, 204, alpha),            // Pink
          'Technology': p.color(0, 153, 204, alpha),             // Blue
          'Entertainment': p.color(255, 204, 0, alpha),          // Yellow
          'Education': p.color(51, 153, 102, alpha),             // Green
          'Fitness & Outdoors': p.color(0, 204, 153, alpha),     // Teal
          'Travel': p.color(204, 102, 0, alpha),                 // Brown
          'Other': p.color(153, 153, 153, alpha)                 // Gray
        };
        
        return colorMap[category] || colorMap['Other'];
      }
      
      class Connection {
        source: Particle;
        target: Particle;
        strength: number;
        category: string;
        pulsePhase: number;
        pulseSpeed: number;
        visible: boolean;
        
        constructor(source: Particle, target: Particle) {
          this.source = source;
          this.target = target;
          this.strength = 0;
          this.category = '';
          this.pulsePhase = p.random(p.TWO_PI);
          this.pulseSpeed = p.random(0.01, 0.03);
          this.visible = false;
          
          // Determine if this is a meaningful connection
          const sourceCategory = getCategoryForItem(source.text);
          const targetCategory = getCategoryForItem(target.text);
          
          if (sourceCategory === targetCategory) {
            this.category = sourceCategory;
            this.strength = p.random(0.6, 1.0); // Strong connection
            this.visible = true;
          }
        }
        
        update(scrollProgress: number) {
          // Show more connections as user scrolls
          if (scrollProgress > 0.4 && !this.visible && this.category) {
            // Gradually reveal more connections
            const revealThreshold = p.map(scrollProgress, 0.4, 0.9, 0.9, 0.3);
            if (p.random() < 0.01 && p.random() < revealThreshold) {
              this.visible = true;
            }
          }
        }
        
        draw() {
          if (!this.visible) return;
          
          const d = p.dist(this.source.x, this.source.y, this.target.x, this.target.y);
          const maxDist = 300;
          
          if (d < maxDist) {
            const midX = (this.source.x + this.target.x) / 2;
            const midY = (this.source.y + this.target.y) / 2;
            
            // Calculate pulse effect
            const pulse = p.sin(p.frameCount * this.pulseSpeed + this.pulsePhase) * 0.5 + 0.5;
            const alpha = p.map(pulse, 0, 1, 50, 150);
            
            // Draw connection line
            p.stroke(getCategoryColor(this.category, alpha));
            p.strokeWeight(this.strength * 1.5);
            p.line(this.source.x, this.source.y, this.target.x, this.target.y);
            
            // Draw connection node at midpoint
            p.noStroke();
            p.fill(getCategoryColor(this.category, alpha + 50));
            const nodeSize = 6 * this.strength * (0.8 + pulse * 0.4);
            p.ellipse(midX, midY, nodeSize);
            
            // Occasionally show category label
            if (p.random() < 0.001 || (p.mouseX > midX - 30 && p.mouseX < midX + 30 && 
                p.mouseY > midY - 30 && p.mouseY < midY + 30)) {
              p.fill(255, 255, 255, 200);
              p.textAlign(p.CENTER);
              p.textSize(10);
              p.text(this.category, midX, midY - 15);
            }
          }
        }
      }
      
      class Particle {
        x: number;
        y: number;
        targetX: number;
        targetY: number;
        originalX: number;
        originalY: number;
        size: number;
        color: p5.Color;
        text: string;
        type: 'digital' | 'physical';
        speed: number;
        category: string;
        noiseOffset: number;
        
        constructor(text: string, type: 'digital' | 'physical') {
          this.text = text;
          this.type = type;
          this.category = getCategoryForItem(text);
          this.size = p.random(6, 14);
          this.color = getCategoryColor(this.category);
          
          // Add subtle variation to the base color
          this.color = p.lerpColor(this.color, p.color(255, 255, 255, 150), p.random(0, 0.2));
          
          // Initialize positions - arrange by category angle
          const categoryIndex = Object.keys(topicCategories).indexOf(this.category);
          const categoryCount = Object.keys(topicCategories).length;
          let angleOffset = 0;
          
          if (categoryIndex !== -1) {
            // Position particles by their category
            angleOffset = (categoryIndex / categoryCount) * p.TWO_PI;
          } else {
            // Random position for uncategorized items
            angleOffset = p.random(p.TWO_PI);
          }
          
          // Add some variation to positions
          angleOffset += p.random(-0.3, 0.3);
          
          const radius = type === 'digital' ? digitalProfileRadius : physicalWorldRadius;
          const radiusVariation = p.random(0.85, 1.15);
          
          this.x = p.width/2 + p.cos(angleOffset) * radius * radiusVariation;
          this.y = p.height/2 + p.sin(angleOffset) * radius * radiusVariation;
          
          this.originalX = this.x;
          this.originalY = this.y;
          
          // Target positions (for animation)
          this.targetX = this.x;
          this.targetY = this.y;
          
          // Very slow movement
          this.speed = p.random(0.003, 0.008);
          this.noiseOffset = p.random(1000);
        }
        
        update(scrollProgress: number) {
          // Use noise for more organic, slow movement
          const noiseScale = 0.0003; // Very slow movement
          const time = p.frameCount * noiseScale;
          const noiseValue = p.noise(this.noiseOffset, time);
          
          const angle = noiseValue * p.TWO_PI * 2;
          const radius = this.type === 'digital' ? digitalProfileRadius : physicalWorldRadius;
          const orbitDistance = radius * p.map(noiseValue, 0, 1, 0.85, 1.15);
          
          // Different behavior based on scroll progress
          if (scrollProgress > 0.7) {
            // When scrolled far, particles of the same category move closer together
            const categoryCenter = { x: 0, y: 0, count: 0 };
            particles.forEach(p => {
              if (p.category === this.category) {
                categoryCenter.x += p.x;
                categoryCenter.y += p.y;
                categoryCenter.count++;
              }
            });
            
            if (categoryCenter.count > 0) {
              categoryCenter.x /= categoryCenter.count;
              categoryCenter.y /= categoryCenter.count;
              
              const pullStrength = p.map(scrollProgress, 0.7, 1.0, 0.0001, 0.001);
              this.targetX = p.lerp(this.targetX, categoryCenter.x, pullStrength);
              this.targetY = p.lerp(this.targetY, categoryCenter.y, pullStrength);
            }
          } else if (scrollProgress > 0.3) {
            // Midway through scroll, introduce gentle orbiting
            const orbitSpeed = 0.00005; // Very slow orbit
            const t = p.frameCount * orbitSpeed;
            const orbitX = p.width/2 + p.cos(angle + t) * orbitDistance;
            const orbitY = p.height/2 + p.sin(angle + t) * orbitDistance;
            
            const orbitInfluence = p.map(scrollProgress, 0.3, 0.7, 0.1, 0.6);
            this.targetX = p.lerp(this.originalX, orbitX, orbitInfluence);
            this.targetY = p.lerp(this.originalY, orbitY, orbitInfluence);
          } else {
            // Early scroll: just slight motion around original position
            const drift = 5;
            this.targetX = this.originalX + p.cos(angle) * drift;
            this.targetY = this.originalY + p.sin(angle) * drift;
          }
          
          // Move very slowly toward target
          this.x = p.lerp(this.x, this.targetX, this.speed);
          this.y = p.lerp(this.y, this.targetY, this.speed);
        }
        
        draw() {
          p.push();
          
          // Draw particle
          p.noStroke();
          p.fill(this.color);
          
          if (this.type === 'digital') {
            // Digital entities are circles
            p.ellipse(this.x, this.y, this.size);
          } else {
            // Physical places are rounded squares
            p.rectMode(p.CENTER);
            p.rect(this.x, this.y, this.size, this.size, this.size/4);
          }
          
          // Draw label on hover or for larger particles
          const distToMouse = p.dist(p.mouseX, p.mouseY, this.x, this.y);
          const hoverRadius = 25;
          
          if (distToMouse < hoverRadius || this.size > 12) {
            p.fill(255, 255, 255, 220);
            p.textAlign(p.CENTER);
            p.textSize(10);
            p.text(this.text, this.x, this.y + this.size + 8);
            
            // Also show category for hover
            if (distToMouse < hoverRadius) {
              p.textSize(8);
              p.fill(getCategoryColor(this.category, 200));
              p.text(this.category, this.x, this.y + this.size + 22);
            }
          }
          
          p.pop();
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
        
        // Create digital identity particles
        for (let i = 0; i < digitalIdentities.length; i++) {
          particles.push(new Particle(digitalIdentities[i], 'digital'));
        }
        
        // Create physical place particles
        for (let i = 0; i < physicalPlaces.length; i++) {
          particles.push(new Particle(physicalPlaces[i], 'physical'));
        }
        
        // Create meaningful connections
        for (let i = 0; i < particles.length; i++) {
          const source = particles[i];
          
          for (let j = i + 1; j < particles.length; j++) {
            const target = particles[j];
            
            // Only connect digital to physical
            if (source.type !== target.type) {
              connections.push(new Connection(source, target));
            }
          }
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
        p.stroke(64, 224, 208, 70);
        p.ellipse(p.width/2, p.height/2, digitalProfileRadius * 2);
        
        // Physical world circle
        p.stroke(240, 150, 80, 70);
        p.ellipse(p.width/2, p.height/2, physicalWorldRadius * 2);
        
        // Center user
        p.noStroke();
        p.fill(255, 255, 255, 170);
        const userSize = 12 + p.sin(p.frameCount * 0.02) * 2;
        p.ellipse(userX, userY, userSize);
        
        // Draw a subtle user label
        if (scrollProgress < 0.3) {
          p.fill(255, 255, 255, 150);
          p.textAlign(p.CENTER);
          p.textSize(10);
          p.text("You", userX, userY + 20);
        }
        
        // Update and draw connections first (background layer)
        connections.forEach(connection => {
          connection.update(scrollProgress);
        });
        
        // Draw connections
        connections.forEach(connection => {
          connection.draw();
        });
        
        // Update and draw particles (foreground layer)
        particles.forEach(particle => {
          particle.update(scrollProgress);
          particle.draw();
        });
        
        // Draw labels
        p.fill(255, 255, 255, 180);
        p.textAlign(p.CENTER);
        p.textSize(14);
        p.text("Digital Identity", p.width/2, p.height/2 - digitalProfileRadius - 20);
        p.text("Physical World", p.width/2, p.height/2 + physicalWorldRadius + 20);
        
        // Draw visualization progress based on scroll
        const progressStages = [
          { threshold: 0.3, text: "Discovering Digital-Physical Connections", y: 30 },
          { threshold: 0.6, text: "Analyzing Category Relationships", y: 30 },
          { threshold: 0.8, text: "Revealing Meaningful Overlaps", y: 30 }
        ];
        
        // Show appropriate stage text based on scroll progress
        for (let i = 0; i < progressStages.length; i++) {
          const stage = progressStages[i];
          const nextStage = progressStages[i + 1] || { threshold: 1.1 };
          
          if (scrollProgress >= stage.threshold && scrollProgress < nextStage.threshold) {
            const alpha = Math.min(255, p.map(scrollProgress, 
              stage.threshold, 
              stage.threshold + 0.1, 
              0, 255));
            
            p.textSize(16);
            p.fill(255, 255, 255, alpha);
            p.text(stage.text, p.width/2, stage.y);
            break;
          }
        }
        
        // When scrolled far, show insight summary
        if (scrollProgress > 0.85) {
          const insightText = "Your digital preferences align with physical locations in your area";
          const alpha = p.map(scrollProgress, 0.85, 0.95, 0, 255);
          
          p.textSize(14);
          p.fill(255, 255, 255, alpha);
          p.text(insightText, p.width/2, p.height - 30);
          
          // Draw central "insight" zone
          p.noFill();
          p.stroke(255, 255, 255, alpha * 0.5);
          p.strokeWeight(1);
          p.ellipse(p.width/2, p.height/2, 90 + p.sin(p.frameCount * 0.05) * 5);
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
        
        // Update particle positions
        particles.forEach(particle => {
          // Keep relative positions
          const dx = particle.x - p.width/2;
          const dy = particle.y - p.height/2;
          
          particle.x = p.width/2 + dx;
          particle.y = p.height/2 + dy;
          particle.targetX = particle.x;
          particle.targetY = particle.y;
          particle.originalX = particle.x;
          particle.originalY = particle.y;
        });
      };
      
      const handleScroll = () => {
        // Calculate scroll progress (0 to 1)
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
        
        // Update radii based on scroll - they converge as the user scrolls
        const minRadius = 120;
        const maxRadius = 160;
        const convergence = p.map(scrollProgress, 0, 1, 0, 0.6);
        
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
        Scroll to see digital-physical connections emerge
      </div>
    </div>
  );
};

export default PhysicalDigitalOverlap;