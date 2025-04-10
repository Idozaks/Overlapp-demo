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
      const myceliumBranches: MyceliumBranch[] = [];
      const nodeCount = 40;  // Number of nodes
      const myceliumCount = 15; // Number of mycelium branches
      let scrollY = 0;
      let lastScrollY = 0;
      let scrollVelocity = 0;
      
      // Node labels for a more meaningful visualization
      const userLabels = [
        'Art Lover', 'Coffee Enthusiast', 'Book Reader', 'Traveler',
        'Fitness', 'Tech', 'Music', 'Nature', 'Foodie', 'Film',
        'Education', 'Wellness', 'Photography', 'Hiking', 'Gardening'
      ];
      
      const businessLabels = [
        'Art Gallery', 'Café', 'Bookstore', 'Travel Agency',
        'Gym', 'Tech Store', 'Music Venue', 'Parks', 'Restaurant', 'Cinema',
        'School', 'Spa', 'Camera Shop', 'Outdoor Store', 'Garden Center'
      ];
      
      // Neural mycelium network branch
      class MyceliumBranch {
        points: p5.Vector[];
        color: p5.Color;
        thickness: number;
        speed: number;
        growthFactor: number;
        maxLength: number;
        energyNodes: number[];
        
        constructor() {
          // Start from a random position
          const startX = p.random(p.width);
          const startY = p.random(p.height);
          this.points = [p.createVector(startX, startY)];
          
          // Randomize appearance
          this.color = p.lerpColor(
            p.color(64, 224, 208, 50), // Teal
            p.color(77, 127, 232, 50), // Blue
            p.random()
          );
          
          this.thickness = p.random(0.5, 2);
          this.speed = p.random(0.05, 0.15);
          this.growthFactor = p.random(0.1, 0.3);
          this.maxLength = p.random(5, 20);
          this.energyNodes = [];
        }
        
        grow() {
          if (this.points.length < this.maxLength) {
            const lastPoint = this.points[this.points.length - 1];
            
            // Create a new point with slight random deviation for organic growth
            const angle = p.noise(lastPoint.x * 0.01, lastPoint.y * 0.01, p.frameCount * 0.001) * p.TWO_PI * 2;
            const length = this.speed * (1 + 0.5 * p.sin(p.frameCount * 0.01));
            
            // Calculate new position with natural movement
            const newX = lastPoint.x + p.cos(angle) * length;
            const newY = lastPoint.y + p.sin(angle) * length;
            
            // Keep within canvas bounds (with margin)
            const margin = 20;
            const boundedX = p.constrain(newX, margin, p.width - margin);
            const boundedY = p.constrain(newY, margin, p.height - margin);
            
            // Add new point
            this.points.push(p.createVector(boundedX, boundedY));
            
            // Randomly add energy nodes along the mycelium
            if (p.random() < 0.1 && this.points.length > 3) {
              this.energyNodes.push(this.points.length - 1);
            }
          } else if (p.random() < 0.05) {
            // Occasionally create a branch by removing the oldest point
            this.points.shift();
          }
        }
        
        draw() {
          p.push();
          // Draw the mycelium path
          p.noFill();
          p.stroke(this.color);
          p.strokeWeight(this.thickness);
          
          // Draw curved path
          p.beginShape();
          for (let i = 0; i < this.points.length; i++) {
            p.curveVertex(this.points[i].x, this.points[i].y);
          }
          p.endShape();
          
          // Draw energy nodes
          p.noStroke();
          for (const nodeIndex of this.energyNodes) {
            if (nodeIndex < this.points.length) {
              const point = this.points[nodeIndex];
              const pulseSize = 3 + p.sin(p.frameCount * 0.05 + nodeIndex) * 2;
              const energyColor = p.color(255, 255, 255, 100 + p.sin(p.frameCount * 0.05 + nodeIndex) * 50);
              p.fill(energyColor);
              p.ellipse(point.x, point.y, pulseSize);
            }
          }
          p.pop();
        }
        
        applyScrollForce(velocity: number) {
          // Make mycelium respond to scroll by adding slight vertical movement
          for (let i = 0; i < this.points.length; i++) {
            this.points[i].y += velocity * 0.02;
          }
        }
      }
      
      // Classes for nodes and connections
      class Node {
        id: number;
        x: number;
        y: number;
        size: number;
        color: p5.Color;
        type: 'user' | 'business';
        velocityX: number;
        velocityY: number;
        label: string;
        noiseOffsetX: number;
        noiseOffsetY: number;
        
        constructor(id: number) {
          this.id = id;
          this.x = p.random(p.width);
          this.y = p.random(p.height);
          this.size = p.random(6, 16);
          this.type = p.random() > 0.7 ? 'business' : 'user';
          this.color = this.type === 'business' 
            ? p.color(77, 127, 232, 200)  // Blue for businesses
            : p.color(64, 224, 208, 200); // Teal for users
          
          // Slower movement
          this.velocityX = p.random(-0.1, 0.1);
          this.velocityY = p.random(-0.1, 0.1);
          
          // Add a label for meaning
          const labelList = this.type === 'business' ? businessLabels : userLabels;
          this.label = labelList[Math.floor(p.random(labelList.length))];
          
          // For Perlin noise movement
          this.noiseOffsetX = p.random(1000);
          this.noiseOffsetY = p.random(1000);
        }
        
        update() {
          // Use Perlin noise for more natural movement, but much reduced
          const noiseScale = 0.0005; // Much slower change in movement
          const noiseValueX = p.noise(this.noiseOffsetX + p.frameCount * noiseScale);
          const noiseValueY = p.noise(this.noiseOffsetY + p.frameCount * noiseScale);
          
          // Convert noise (0-1) to very minimal direction (-0.05 to 0.05)
          this.velocityX = p.map(noiseValueX, 0, 1, -0.05, 0.05);
          this.velocityY = p.map(noiseValueY, 0, 1, -0.05, 0.05);
          
          // Move nodes very slowly
          this.x += this.velocityX * 0.3;
          this.y += this.velocityY * 0.3;
          
          // Barely respond to scroll velocity
          this.y += scrollVelocity * 0.02;
          
          // Bounce off edges with padding
          const padding = 20;
          if (this.x < padding) this.velocityX = Math.abs(this.velocityX) * 0.5;
          if (this.x > p.width - padding) this.velocityX = -Math.abs(this.velocityX) * 0.5;
          if (this.y < padding) this.velocityY = Math.abs(this.velocityY) * 0.5;
          if (this.y > p.height - padding) this.velocityY = -Math.abs(this.velocityY) * 0.5;
        }
        
        draw() {
          p.push();
          p.noStroke();
          
          // Draw node
          p.fill(this.color);
          if (this.type === 'business') {
            // Businesses are rounded squares
            p.rectMode(p.CENTER);
            p.rect(this.x, this.y, this.size, this.size, this.size / 4);
          } else {
            // Users are circles
            p.ellipse(this.x, this.y, this.size);
          }
          
          // Draw label for larger nodes
          if (this.size > 10) {
            const distToMouse = p.dist(p.mouseX, p.mouseY, this.x, this.y);
            const hoverRange = 50;
            
            // Show label on hover or sometimes randomly
            if (distToMouse < hoverRange || (p.frameCount % 180 === this.id % 180)) {
              p.fill(0, 0, 0, 220); // Black text for better visibility
              p.textAlign(p.CENTER, p.CENTER);
              p.textSize(8);
              p.text(this.label, this.x, this.y + this.size + 10);
            }
          }
          p.pop();
        }
      }
      
      class Connection {
        source: Node;
        target: Node;
        strength: number;
        overlap: number;
        alpha: number;
        pulsePhase: number;
        
        constructor(source: Node, target: Node) {
          this.source = source;
          this.target = target;
          this.strength = p.random(0.3, 1);
          
          // Create meaningful overlaps between related entities
          const sourceIdx = userLabels.indexOf(source.label);
          const targetIdx = businessLabels.indexOf(target.label);
          
          // Higher overlap if both are in the same category
          if (sourceIdx === targetIdx && sourceIdx !== -1) {
            this.overlap = p.random(0.6, 0.9); // Strong overlap for matching pairs
          } else if (p.dist(source.x, source.y, target.x, target.y) < 150) {
            this.overlap = p.random(0.3, 0.7); // Medium overlap for nearby nodes
          } else {
            this.overlap = p.random(0.1, 0.3); // Less overlap for unrelated entities
          }
          
          this.alpha = 70; // Lower default opacity for cleaner look
          this.pulsePhase = p.random(p.TWO_PI); // Random phase for connection pulse
        }
        
        update() {
          // Make connections more prominent when scrolling
          const targetAlpha = 70 + Math.min(Math.abs(scrollVelocity * 3), 100);
          this.alpha = p.lerp(this.alpha, targetAlpha, 0.05);
        }
        
        draw() {
          const d = p.dist(this.source.x, this.source.y, this.target.x, this.target.y);
          const maxDist = 250; // Increase visible connection distance
          
          if (d < maxDist) {
            // Calculate fade based on distance
            const fadeByDistance = p.map(d, 0, maxDist, 1, 0);
            const currentAlpha = this.alpha * fadeByDistance;
            
            // Calculate the position of the overlap indicator
            const midX = p.lerp(this.source.x, this.target.x, 0.5);
            const midY = p.lerp(this.source.y, this.target.y, 0.5);
            
            p.push();
            
            // Draw connection with subtle curve to suggest neural/mycelial nature
            p.noFill();
            p.stroke(255, 255, 255, currentAlpha);
            p.strokeWeight(this.strength);
            
            // Calculate control points for curved path
            const ctrl1X = p.lerp(this.source.x, this.target.x, 0.25) + p.sin(p.frameCount * 0.01 + this.pulsePhase) * 5;
            const ctrl1Y = p.lerp(this.source.y, this.target.y, 0.25) + p.cos(p.frameCount * 0.01 + this.pulsePhase) * 5;
            const ctrl2X = p.lerp(this.source.x, this.target.x, 0.75) - p.sin(p.frameCount * 0.01 + this.pulsePhase) * 5;
            const ctrl2Y = p.lerp(this.source.y, this.target.y, 0.75) - p.cos(p.frameCount * 0.01 + this.pulsePhase) * 5;
            
            p.beginShape();
            p.vertex(this.source.x, this.source.y);
            p.bezierVertex(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, this.target.x, this.target.y);
            p.endShape();
            
            // Animated data pulse along connection
            const pulseSpeed = 0.02;
            const pulsePhase = (p.frameCount * pulseSpeed + this.pulsePhase) % 1;
            const pulseX = p.lerp(this.source.x, this.target.x, pulsePhase);
            const pulseY = p.lerp(this.source.y, this.target.y, pulsePhase);
            
            // Only show pulse for strong connections
            if (this.overlap > 0.4) {
              const pulseSize = 3;
              p.noStroke();
              p.fill(255, 255, 255, currentAlpha + 50);
              p.ellipse(pulseX, pulseY, pulseSize);
            }
            
            // Draw overlap indicator at midpoint
            const overlapSize = this.overlap * 10 + 4;
            const pulseEffect = p.sin(p.frameCount * 0.05 + this.pulsePhase) * 0.2 + 1;
            
            p.noStroke();
            p.fill(255, 255, 255, currentAlpha + 20);
            p.ellipse(midX, midY, overlapSize * pulseEffect);
            
            // Indicate overlap strength with color
            let overlapColor;
            if (this.overlap > 0.6) {
              // High overlap - green (match)
              overlapColor = p.color(100, 200, 100, currentAlpha + 80);
            } else if (this.overlap > 0.3) {
              // Medium overlap - blue/teal blend
              overlapColor = p.color(90, 180, 200, currentAlpha + 80);
            } else {
              // Low overlap - subtle gray/blue
              overlapColor = p.color(180, 180, 200, currentAlpha + 80);
            }
            
            p.fill(overlapColor);
            p.ellipse(midX, midY, overlapSize * 0.6 * pulseEffect);
            
            p.pop();
          }
        }
      }
      
      p.setup = () => {
        // Create responsive canvas
        const canvas = p.createCanvas(
          containerRef.current?.offsetWidth || window.innerWidth,
          450 // Slightly taller for more vertical space
        );
        canvas.parent(containerRef.current!);
        
        // Create mycelium branches
        for (let i = 0; i < myceliumCount; i++) {
          myceliumBranches.push(new MyceliumBranch());
        }
        
        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
          nodes.push(new Node(i));
        }
        
        // Create connections: make more connections between related entities
        for (let i = 0; i < nodes.length; i++) {
          const sourceNode = nodes[i];
          
          // Connect to a few nodes
          const maxNodeConnections = sourceNode.type === 'business' ? 3 : 5; // Users connect to more entities
          const connectionCount = Math.floor(p.random(1, maxNodeConnections));
          
          for (let j = 0; j < connectionCount; j++) {
            // Choose a target of opposite type
            const potentialTargets = nodes.filter(node => 
              node.type !== sourceNode.type && 
              // Avoid too many connections to same target
              connections.filter(conn => 
                (conn.source.id === node.id || conn.target.id === node.id)
              ).length < 5
            );
            
            if (potentialTargets.length > 0) {
              const targetNode = potentialTargets[Math.floor(p.random(potentialTargets.length))];
              connections.push(new Connection(sourceNode, targetNode));
            }
          }
        }
        
        // Listen for scroll events
        window.addEventListener('scroll', handleScroll);
      };
      
      p.draw = () => {
        p.clear();
        
        // Update scroll velocity (ease to zero)
        scrollVelocity = scrollVelocity * 0.92;
        
        // Update and draw mycelium branches first (background layer)
        myceliumBranches.forEach(branch => {
          branch.applyScrollForce(scrollVelocity);
          branch.grow();
          branch.draw();
        });
        
        // Draw connections (middle layer)
        connections.forEach(connection => {
          connection.update();
          connection.draw();
        });
        
        // Draw and update nodes (top layer)
        nodes.forEach(node => {
          node.update();
          node.draw();
        });
        
        // Add an occasional new mycelium branch
        if (p.random() < 0.005 && myceliumBranches.length < 25) {
          myceliumBranches.push(new MyceliumBranch());
        }
      };
      
      p.windowResized = () => {
        p.resizeCanvas(
          containerRef.current?.offsetWidth || window.innerWidth,
          450
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
      className={`relative w-full h-[450px] ${className}`}
      aria-hidden="true" // Animation is decorative
    >
      <div className="absolute bottom-2 right-2 bg-black/20 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
        Hover over nodes to see details
      </div>
    </div>
  );
};

export default OverlappAnimation;