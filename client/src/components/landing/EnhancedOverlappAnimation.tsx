import React, { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import p5 from 'p5';

// Define node types for the visualization
type NodeType = 'user' | 'business' | 'interest' | 'location' | 'event' | 'brand' | 'product';

// Define interface for exposed node data
export interface NodeData {
  id: number;
  type: NodeType;
  label: string;
  connections: ConnectionData[];
  isHovered: boolean;
}

// Define interface for exposed connection data
export interface ConnectionData {
  sourceId: number;
  targetId: number;
  sourceType: NodeType;
  targetType: NodeType;
  sourceLabel: string;
  targetLabel: string;
  connectionType: ConnectionType;
  connectionLabel: string;
  strength: number;
  overlap: number;
}

// Create a context to share animation data
interface AnimationContextType {
  nodes: NodeData[];
  selectedNodeId: number | null;
  setSelectedNodeId: (id: number | null) => void;
  hoveredNodeId: number | null;
}

export const AnimationContext = createContext<AnimationContextType>({
  nodes: [],
  selectedNodeId: null,
  setSelectedNodeId: () => {},
  hoveredNodeId: null
});

export const useAnimationContext = () => useContext(AnimationContext);

type OverlappAnimationProps = {
  className?: string;
  onNodeSelect?: (nodeData: NodeData) => void;
};

// Define all possible connection types
type ConnectionType = 
  | 'frequents' 
  | 'visits' 
  | 'follows' 
  | 'likes' 
  | 'purchases' 
  | 'attends' 
  | 'shares' 
  | 'recommends' 
  | 'reviews' 
  | 'creates' 
  | 'partners' 
  | 'employs' 
  | 'manages' 
  | 'owns'
  | 'interacts'
  | 'overlaps'
  | 'similar_to'
  | 'invested_in'
  | 'mentors'
  | 'collaborates'
  | 'sells_to'
  | 'supplies'
  | 'located_at'
  | 'hosts'
  | 'sells'
  | 'popular_at'
  | 'featured_in'
  | 'represented_by'
  | 'embodied_by'
  | 'venue_for'
  | 'houses'
  | 'sponsored_by'
  | 'showcases'
  | 'produces'
  | 'connected_to'
  | 'related_to'
  | 'complementary_to';

// NodeType already defined above

const EnhancedOverlappAnimation = ({ className = '', onNodeSelect }: OverlappAnimationProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<p5 | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  
  // Check if we're on a mobile device
  const isMobile = useCallback(() => {
    return window.innerWidth < 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const sketch = (p: p5) => {
      // Animation state variables with reduced complexity for mobile
      const myceliumBranches: MyceliumBranch[] = [];
      const myceliumCount = isMobile() ? 6 : 12;
      const nodes: Node[] = [];
      const connections: Connection[] = [];
      const nodeCount = isMobile() ? 15 : 30; // Fewer nodes on mobile
      
      let scrollY = 0;
      let lastScrollY = 0;
      let scrollVelocity = 0;
      
      // Frame rate control - lower for mobile
      const desktopFrameRate = 30;
      const mobileFrameRate = 15;
      
      // Track if animation is in view
      let isInViewport = false;
      
      // Sample data for different node types
      const nodeLabels: Record<NodeType, string[]> = {
        user: [
          'Design Enthusiast', 'Food Explorer', 'Tech Professional', 
          'Outdoor Adventurer', 'Music Lover', 'Fitness Coach', 
          'Art Collector', 'Local Shopper'
        ],
        business: [
          'Design Studio', 'Restaurant Chain', 'Tech Startup',
          'Outdoor Retailer', 'Music Venue', 'Fitness Studio',
          'Art Gallery', 'Local Market'
        ],
        interest: [
          'Modern Art', 'Vegan Cuisine', 'Machine Learning',
          'Rock Climbing', 'Jazz Music', 'CrossFit',
          'Sculpture', 'Farmers Markets'
        ],
        location: [
          'Downtown District', 'Financial Center', 'Cultural Hub',
          'Shopping Mall', 'Historic Quarter', 'Dining Area',
          'Arts District', 'City Center'
        ],
        event: [
          'Tech Conference', 'Food Festival', 'Product Launch',
          'Outdoor Exhibition', 'Live Concert', 'Fitness Workshop',
          'Art Exhibition', 'Market Day'
        ],
        brand: [
          'Artisan Design', 'Bistro Group', 'TechFusion',
          'OutdoorLife', 'SoundWave', 'PeakFitness',
          'GalleryOne', 'LocalHarvest'
        ],
        product: [
          'Canvas Series', 'Signature Dish', 'AI Platform',
          'Climbing Gear', 'Audio Equipment', 'Training Program',
          'Limited Edition', 'Fresh Produce'
        ]
      };
      
      // Get the display name for a node type
      const getNodeTypeDisplayName = (type: NodeType): string => {
        const displayNames: Record<NodeType, string> = {
          user: 'User',
          business: 'Business',
          interest: 'Interest',
          location: 'Location',
          event: 'Event',
          brand: 'Brand',
          product: 'Product'
        };
        return displayNames[type];
      };
      
      // Colors for each node type
      const nodeColors: Record<NodeType, {r: number, g: number, b: number}> = {
        user: {r: 100, g: 200, b: 255},       // Blue
        business: {r: 255, g: 150, b: 100},   // Orange
        interest: {r: 100, g: 220, b: 150},   // Green
        location: {r: 250, g: 220, b: 100},   // Yellow
        event: {r: 240, g: 130, b: 200},      // Purple
        brand: {r: 150, g: 130, b: 240},      // Indigo
        product: {r: 220, g: 100, b: 120}     // Red
      };
      
      // Connection type mapping based on source and target node types
      const determineConnectionType = (source: NodeType, target: NodeType): ConnectionType => {
        const connectionMappings: Record<string, ConnectionType> = {
          'user_business': 'frequents',
          'user_interest': 'likes',
          'user_location': 'visits',
          'user_event': 'attends',
          'user_brand': 'follows',
          'user_product': 'purchases',
          'business_interest': 'creates',
          'business_location': 'located_at',
          'business_event': 'hosts',
          'business_brand': 'partners',
          'business_product': 'sells',
          'interest_location': 'popular_at',
          'interest_event': 'featured_in',
          'interest_brand': 'represented_by',
          'interest_product': 'embodied_by',
          'location_event': 'venue_for',
          'location_brand': 'houses',
          'location_product': 'sells',
          'event_brand': 'sponsored_by',
          'event_product': 'showcases',
          'brand_product': 'produces'
        };
        
        // Try both directions since connections can go either way
        const key1 = `${source}_${target}`;
        const key2 = `${target}_${source}`;
        
        if (connectionMappings[key1]) {
          return connectionMappings[key1];
        } else if (connectionMappings[key2]) {
          return connectionMappings[key2];
        }
        
        // Default fallback based on source type
        const fallbacks: Record<NodeType, ConnectionType> = {
          user: 'interacts',
          business: 'partners',
          interest: 'similar_to',
          location: 'connected_to',
          event: 'related_to',
          brand: 'collaborates',
          product: 'complementary_to'
        };
        
        return fallbacks[source] || 'overlaps';
      };
      
      // Connection label formatting based on connection type
      const getConnectionLabel = (type: ConnectionType, source: Node, target: Node): string => {
        // Create specific relationship descriptions between node types
        switch(type) {
          case 'frequents':
            return `visits`;
          case 'visits':
            return `visits`;
          case 'follows':
            return `follows`;
          case 'likes':
            return `likes`;
          case 'purchases':
            return `buys`;
          case 'attends':
            return `attends`;
          case 'shares':
            return `shares`;
          case 'recommends':
            return `recommends`;
          case 'reviews':
            return `reviews`;
          case 'creates':
            return `creates`;
          case 'partners':
            return `partners`;
          case 'employs':
            return `employs`;
          case 'manages':
            return `manages`;
          case 'owns':
            return `owns`;
          case 'interacts':
            return `interacts`;
          case 'overlaps':
            return `overlaps`;
          case 'similar_to':
            return `similar to`;
          case 'invested_in':
            return `invests in`;
          case 'mentors':
            return `mentors`;
          case 'collaborates':
            return `collaborates`;
          case 'sells_to':
            return `sells to`;
          case 'supplies':
            return `supplies`;
          case 'located_at':
            return `located at`;
          case 'hosts':
            return `hosts`;
          case 'sells':
            return `sells`;
          case 'popular_at':
            return `popular at`;
          case 'featured_in':
            return `featured in`;
          case 'represented_by':
            return `represented by`;
          case 'embodied_by':
            return `embodied by`;
          case 'venue_for':
            return `venue for`;
          case 'houses':
            return `houses`;
          case 'sponsored_by':
            return `sponsored by`;
          case 'showcases':
            return `showcases`;
          case 'produces':
            return `produces`;
          case 'connected_to':
            return `connected to`;
          case 'related_to':
            return `related to`;
          case 'complementary_to':
            return `complementary to`;
          default:
            return `connected to`;
        }
      };
      
      // Mycelium-like branching for background
      class MyceliumBranch {
        x: number;
        y: number;
        length: number;
        angle: number;
        generation: number;
        maxGeneration: number;
        thickness: number;
        points: { x: number, y: number }[];
        children: MyceliumBranch[];
        speed: number;
        growing: boolean;
        color: p5.Color;
        
        constructor(
          x?: number, 
          y?: number, 
          angle?: number, 
          generation = 0,
          maxGeneration?: number
        ) {
          // Random starting point if not specified
          this.x = x || p.random(p.width);
          this.y = y || p.random(p.height);
          this.length = p.random(40, 100);
          this.angle = angle !== undefined ? angle : p.random(p.TWO_PI);
          this.generation = generation;
          this.maxGeneration = maxGeneration || Math.floor(p.random(2, 4));
          this.thickness = p.map(this.generation, 0, this.maxGeneration, 2.5, 0.5);
          this.points = [{ x: this.x, y: this.y }];
          this.children = [];
          this.speed = p.random(0.2, 0.5);
          this.growing = true;
          
          // Subtle color variations
          this.color = p.color(255, 255, 255, 40);
        }
        
        applyScrollForce(force: number) {
          // Adjust all points based on scroll
          if (Math.abs(force) > 0.5) {
            this.points.forEach(point => {
              point.y += force * 0.03;
            });
          }
        }
        
        grow() {
          if (!this.growing) return;
          
          // Add slight variations to angle as it grows
          this.angle += p.random(-0.1, 0.1);
          
          // Calculate new endpoint
          const growAmount = this.speed;
          const currentLength = this.getCurrentLength();
          
          if (currentLength < this.length) {
            const lastPoint = this.points[this.points.length - 1];
            const newX = lastPoint.x + Math.cos(this.angle) * growAmount;
            const newY = lastPoint.y + Math.sin(this.angle) * growAmount;
            
            // Bounce off edges
            let bounced = false;
            let newAngle = this.angle;
            
            if (newX < 0 || newX > p.width) {
              newAngle = Math.PI - newAngle;
              bounced = true;
            }
            
            if (newY < 0 || newY > p.height) {
              newAngle = -newAngle;
              bounced = true;
            }
            
            if (bounced) {
              this.angle = newAngle;
              return;
            }
            
            this.points.push({ x: newX, y: newY });
          } else {
            this.growing = false;
            
            // Maybe branch out
            if (this.generation < this.maxGeneration && p.random() < 0.7) {
              const lastPoint = this.points[this.points.length - 1];
              const branchCount = Math.floor(p.random(1, 3)); // 1-2 branches
              
              for (let i = 0; i < branchCount; i++) {
                const angleOffset = p.random(-Math.PI/4, Math.PI/4);
                const child = new MyceliumBranch(
                  lastPoint.x,
                  lastPoint.y,
                  this.angle + angleOffset,
                  this.generation + 1,
                  this.maxGeneration
                );
                this.children.push(child);
              }
            }
          }
        }
        
        getCurrentLength() {
          let length = 0;
          for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            length += Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
          }
          return length;
        }
        
        draw() {
          if (this.points.length < 2) return;
          
          p.push();
          p.noFill();
          p.stroke(this.color);
          p.strokeWeight(this.thickness);
          
          p.beginShape();
          for (const point of this.points) {
            p.curveVertex(point.x, point.y);
          }
          p.endShape();
          p.pop();
          
          // Draw children
          for (const child of this.children) {
            child.draw();
          }
        }
      }
      
      class Node {
        id: number;
        x: number;
        y: number;
        size: number;
        type: NodeType;
        color: p5.Color;
        label: string;
        velocityX: number;
        velocityY: number;
        noiseOffsetX: number;
        noiseOffsetY: number;
        dragging: boolean;
        hovered: boolean;
        
        constructor(id: number) {
          this.id = id;
          this.dragging = false;
          this.hovered = false;
          
          // Assign a node type based on distribution
          const typeDistribution: NodeType[] = [
            'user', 'user', 'user',             // 3 users
            'business', 'business', 'business', // 3 businesses
            'interest', 'interest', 'interest', // 3 interests 
            'location', 'location',             // 2 locations
            'event', 'event',                   // 2 events
            'brand',                            // 1 brand
            'product'                           // 1 product
          ];
          
          // Choose a type based on the id or randomly
          this.type = id < typeDistribution.length 
            ? typeDistribution[id] 
            : typeDistribution[Math.floor(p.random(typeDistribution.length))];
          
          // Positioning - with significantly more initial spacing for repel forces to work better
          const typeIndex = Object.keys(nodeColors).indexOf(this.type);
          const typeCount = Object.keys(nodeColors).length;
          const angle = (typeIndex / typeCount) * p.TWO_PI + p.random(-0.3, 0.3);
          const radius = p.random(120, 200); // Further increased radius for more spacing
          
          // Position nodes in a more structured pattern based on their type
          // Different types are placed in different regions to reduce initial overlap
          this.x = p.width/2 + p.cos(angle) * radius;
          this.y = p.height/2 + p.sin(angle) * radius;
          
          // Add slight randomization to avoid perfect circles
          this.x += p.random(-30, 30);
          this.y += p.random(-30, 30);
          
          // Visual properties
          const typeColorData = nodeColors[this.type];
          this.color = p.color(
            typeColorData.r, 
            typeColorData.g, 
            typeColorData.b, 
            200
          );
          
          // Size range depends on type (users and businesses slightly larger)
          if (this.type === 'user' || this.type === 'business') {
            this.size = p.random(12, 18);
          } else if (this.type === 'interest') {
            this.size = p.random(10, 16);
          } else {
            this.size = p.random(8, 15);
          }
          
          // Assign a label from the appropriate category
          const labelsForType = nodeLabels[this.type];
          this.label = labelsForType[id % labelsForType.length];
          
          // Movement
          this.velocityX = 0;
          this.velocityY = 0;
          this.noiseOffsetX = p.random(1000);
          this.noiseOffsetY = p.random(1000);
        }
        
        // Check if mouse is over this node
        isMouseOver() {
          return p.dist(p.mouseX, p.mouseY, this.x, this.y) < this.size / 2 + 5;
        }
        
        // Start dragging this node
        startDrag() {
          if (this.isMouseOver()) {
            this.dragging = true;
          }
        }
        
        // Stop dragging this node
        stopDrag() {
          this.dragging = false;
        }
        
        update() {
          // Handle dragging
          if (this.dragging) {
            this.x = p.mouseX;
            this.y = p.mouseY;
            // Reset velocity when dragging
            this.velocityX = 0;
            this.velocityY = 0;
          } else {
            // Check if hovered
            this.hovered = this.isMouseOver();
            
            // Use Perlin noise for extremely minimal movement when not dragging
            const noiseScale = 0.0003; // Very slow movement
            const noiseValueX = p.noise(this.noiseOffsetX + p.frameCount * noiseScale);
            const noiseValueY = p.noise(this.noiseOffsetY + p.frameCount * noiseScale);
            
            // Convert noise (0-1) to very minimal direction (-0.03 to 0.03)
            this.velocityX = p.map(noiseValueX, 0, 1, -0.03, 0.03);
            this.velocityY = p.map(noiseValueY, 0, 1, -0.03, 0.03);
            
            // Mobile optimization: Less intensive physics calculations
            if (isMobile()) {
              // Add repel force but only check against a subset of nodes to save processing power
              // Skip some nodes by only checking every 2nd or 3rd node
              for (let i = 0; i < nodes.length; i += 2) { // Check every other node on mobile
                const otherNode = nodes[i];
                if (otherNode.id !== this.id) {
                  const dx = this.x - otherNode.x;
                  const dy = this.y - otherNode.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  
                  // Simplified repel with larger minimum distance to avoid clumping
                  const repelRadius = this.size + otherNode.size + 50;
                  
                  if (distance < repelRadius) {
                    // Simple normalized repel force
                    const nx = dx / distance || 0;
                    const ny = dy / distance || 0;
                    const strength = 1.2 * (1 - distance / repelRadius);
                    
                    this.velocityX += nx * strength;
                    this.velocityY += ny * strength;
                  }
                }
              }
            } else {
              // Desktop: Full physics with all nodes
              for (const otherNode of nodes) {
                if (otherNode.id !== this.id) {
                  const dx = this.x - otherNode.x;
                  const dy = this.y - otherNode.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  
                  // Only apply force if nodes are close to each other (within repel radius)
                  const repelRadius = this.size + otherNode.size + 60; // Increased margin for stronger repel effect
                  
                  if (distance < repelRadius) {
                    // Normalize direction vector
                    const nx = dx / distance || 0;
                    const ny = dy / distance || 0;
                    
                    // Calculate repel strength inversely proportional to distance
                    // Increased from 0.8 to 1.5 for stronger repulsion
                    const strength = 1.5 * (1 - distance / repelRadius);
                    
                    // Apply repel force with stronger effect as they get closer
                    // Use squared relationship for stronger close-range repulsion
                    const closeRangeEffect = Math.min(5, 1 + (3 * Math.pow(1 - distance / repelRadius, 2)));
                    
                    this.velocityX += nx * strength * closeRangeEffect;
                    this.velocityY += ny * strength * closeRangeEffect;
                  }
                }
              }
            }
            
            // Keep nodes inside canvas with some buffer
            const buffer = this.size * 2;
            const maxVelocity = 4; // Increased from 2 to 4 to allow stronger movement
            
            // Constrain velocity to prevent excessive movement
            this.velocityX = p.constrain(this.velocityX, -maxVelocity, maxVelocity);
            this.velocityY = p.constrain(this.velocityY, -maxVelocity, maxVelocity);
            
            // Apply velocity with damping factor
            this.x += this.velocityX * 0.5;
            this.y += this.velocityY * 0.5;
            
            // Apply boundary forces to keep nodes on screen
            if (this.x < buffer) {
              this.velocityX += (buffer - this.x) * 0.02;
            } else if (this.x > p.width - buffer) {
              this.velocityX -= (this.x - (p.width - buffer)) * 0.02;
            }
            
            if (this.y < buffer) {
              this.velocityY += (buffer - this.y) * 0.02;
            } else if (this.y > p.height - buffer) {
              this.velocityY -= (this.y - (p.height - buffer)) * 0.02;
            }
            
            // Barely respond to scroll velocity
            this.y += scrollVelocity * 0.01;
          }
          
          // Bounce off edges with padding
          const padding = 20;
          if (this.x < padding) this.x = padding;
          if (this.x > p.width - padding) this.x = p.width - padding;
          if (this.y < padding) this.y = padding;
          if (this.y > p.height - padding) this.y = p.height - padding;
        }
        
        draw() {
          p.push();
          p.noStroke();
          
          // Draw node with shape based on type
          p.fill(this.color);
          
          switch(this.type) {
            case 'user':
              // Users are circles
              p.ellipse(this.x, this.y, this.size);
              break;
            case 'business':
              // Businesses are rounded squares
              p.rectMode(p.CENTER);
              p.rect(this.x, this.y, this.size, this.size, this.size / 4);
              break;
            case 'interest':
              // Interests are triangles
              p.beginShape();
              const triRadius = this.size / 2;
              for (let i = 0; i < 3; i++) {
                const angle = p.TWO_PI * i / 3 - p.PI / 2; // Start at top
                const tx = this.x + p.cos(angle) * triRadius;
                const ty = this.y + p.sin(angle) * triRadius;
                p.vertex(tx, ty);
              }
              p.endShape(p.CLOSE);
              break;
            case 'location':
              // Locations are pins/markers
              p.beginShape();
              p.vertex(this.x, this.y - this.size/2);
              p.vertex(this.x + this.size/2, this.y);
              p.vertex(this.x, this.y + this.size/2);
              p.vertex(this.x - this.size/2, this.y);
              p.endShape(p.CLOSE);
              break;
            case 'event':
              // Events are stars
              const starPoints = 5;
              const outerRadius = this.size / 2;
              const innerRadius = outerRadius * 0.4;
              p.beginShape();
              for (let i = 0; i < starPoints * 2; i++) {
                const angle = p.TWO_PI * i / (starPoints * 2) - p.PI / 2;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const sx = this.x + p.cos(angle) * radius;
                const sy = this.y + p.sin(angle) * radius;
                p.vertex(sx, sy);
              }
              p.endShape(p.CLOSE);
              break;
            case 'brand':
              // Brands are hexagons
              p.beginShape();
              const hexRadius = this.size / 2;
              for (let i = 0; i < 6; i++) {
                const angle = p.TWO_PI * i / 6;
                const hx = this.x + p.cos(angle) * hexRadius;
                const hy = this.y + p.sin(angle) * hexRadius;
                p.vertex(hx, hy);
              }
              p.endShape(p.CLOSE);
              break;
            case 'product':
              // Products are diamonds/squares rotated 45°
              p.push();
              p.translate(this.x, this.y);
              p.rotate(p.PI / 4);
              p.rectMode(p.CENTER);
              p.rect(0, 0, this.size * 0.7, this.size * 0.7);
              p.pop();
              break;
          }
          
          // Always draw type and label for clarity
          p.fill(0, 0, 0, 220); // Black text
          p.textAlign(p.CENTER, p.CENTER);
          
          // Draw type label above node
          p.textSize(8);
          p.text(getNodeTypeDisplayName(this.type), this.x, this.y - this.size * 0.9);
          
          // Draw name label below node
          p.textSize(8);
          p.text(this.label, this.x, this.y + this.size * 0.9);
          
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
        connectionType: ConnectionType;
        connectionLabel: string;
        
        constructor(source: Node, target: Node) {
          this.source = source;
          this.target = target;
          this.strength = p.random(0.3, 1);
          
          // Determine connection type based on the source and target types
          this.connectionType = determineConnectionType(source.type, target.type);
          
          // Generate a specific label for this connection
          this.connectionLabel = getConnectionLabel(this.connectionType, source, target);
          
          // Create meaningful overlaps between related entities
          // Higher overlap if both are related in some way
          if (source.type === 'user' && target.type === 'interest') {
            this.overlap = p.random(0.6, 0.9); // Strong overlap for users and their interests
          } else if (source.type === 'business' && target.type === 'product') {
            this.overlap = p.random(0.5, 0.8); // Strong for businesses and their products
          } else if (source.type === 'location' && target.type === 'event') {
            this.overlap = p.random(0.4, 0.7); // Medium-strong for locations and events
          } else if (p.dist(source.x, source.y, target.x, target.y) < 100) {
            this.overlap = p.random(0.3, 0.6); // Medium overlap for nearby nodes
          } else {
            this.overlap = p.random(0.1, 0.3); // Less overlap for unrelated entities
          }
          
          this.alpha = 80; // Slightly higher default opacity for better visibility
          this.pulsePhase = p.random(p.TWO_PI); // Random phase for connection pulse
        }
        
        update() {
          // Make connections more prominent when scrolling
          const targetAlpha = 80 + Math.min(Math.abs(scrollVelocity * 3), 100);
          this.alpha = p.lerp(this.alpha, targetAlpha, 0.05);
        }
        
        draw() {
          const d = p.dist(this.source.x, this.source.y, this.target.x, this.target.y);
          const maxDist = 250; // Visible connection distance
          
          if (d < maxDist) {
            // Calculate fade based on distance
            const fadeByDistance = p.map(d, 0, maxDist, 1, 0);
            const currentAlpha = this.alpha * fadeByDistance;
            
            // Calculate the position of the overlap indicator
            const midX = p.lerp(this.source.x, this.target.x, 0.5);
            const midY = p.lerp(this.source.y, this.target.y, 0.5);
            
            p.push();
            
            // Draw connection: simplified for mobile when out of viewport
            const useSimplifiedDrawing = isMobile() && !isInViewport;
            
            p.noFill();
            // Use black stroke with appropriate alpha
            p.stroke(0, 0, 0, currentAlpha);
            p.strokeWeight(this.strength);
            
            if (useSimplifiedDrawing) {
              // Simplified straight line for mobile when not in viewport
              p.beginShape();
              p.vertex(this.source.x, this.source.y);
              p.vertex(this.target.x, this.target.y);
              p.endShape();
            } else {
              // Full curved connection for desktop or when in viewport
              // Calculate control points for curved path
              const ctrl1X = p.lerp(this.source.x, this.target.x, 0.25) + p.sin(p.frameCount * 0.01 + this.pulsePhase) * 5;
              const ctrl1Y = p.lerp(this.source.y, this.target.y, 0.25) + p.cos(p.frameCount * 0.01 + this.pulsePhase) * 5;
              const ctrl2X = p.lerp(this.source.x, this.target.x, 0.75) - p.sin(p.frameCount * 0.01 + this.pulsePhase) * 5;
              const ctrl2Y = p.lerp(this.source.y, this.target.y, 0.75) - p.cos(p.frameCount * 0.01 + this.pulsePhase) * 5;
              
              p.beginShape();
              p.vertex(this.source.x, this.source.y);
              p.bezierVertex(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, this.target.x, this.target.y);
              p.endShape();
            }
            
            // Draw connection label at midpoint
            p.noStroke();
            
            // On mobile when not in viewport, only draw labels for stronger connections
            const shouldDrawLabel = !useSimplifiedDrawing || this.overlap > 0.5;
            
            if (shouldDrawLabel) {
              // Create a small background for the label for better readability
              p.fill(255, 255, 255, 180);
              p.rectMode(p.CENTER);
              const labelWidth = this.connectionLabel.length * 5;
              p.rect(midX, midY, labelWidth, 14, 4);
              
              // Draw the connection label
              p.fill(0, 0, 0, 220);
              p.textAlign(p.CENTER, p.CENTER);
              p.textSize(8);
              p.text(this.connectionLabel, midX, midY);
            }
            
            // Draw dots along the connection to show data flow
            // Only when animated connections are needed (desktop or in viewport)
            if (!useSimplifiedDrawing && this.overlap > 0.3) {
              // Create multiple pulse dots for stronger connections
              const pulseCount = Math.floor(this.overlap * 5) + 1;
              for (let i = 0; i < pulseCount; i++) {
                const pulseSpeed = 0.01;
                const pulseOffset = i / pulseCount;
                const pulsePhase = ((p.frameCount * pulseSpeed + this.pulsePhase + pulseOffset) % 1);
                
                // Calculate position along the curve
                let pulseX, pulseY;
                
                // Linear interpolation for straight lines is always used in simplified mode
                // or when calculating bezier curve points would cause errors
                pulseX = p.lerp(this.source.x, this.target.x, pulsePhase);
                pulseY = p.lerp(this.source.y, this.target.y, pulsePhase);
                
                // Draw pulse dot
                const pulseSize = 3;
                p.noStroke();
                p.fill(0, 0, 0, currentAlpha + 50);
                p.ellipse(pulseX, pulseY, pulseSize);
              }
            }
            
            p.pop();
          }
        }
      }
      
      // Function to convert internal nodes to exposed NodeData format
      const convertToNodeData = () => {
        const nodeDataArray: NodeData[] = nodes.map(node => {
          // Find all connections for this node
          const nodeConnections = connections.filter(conn => 
            conn.source.id === node.id || conn.target.id === node.id
          );
          
          // Convert internal connections to ConnectionData format
          const connectionDataArray: ConnectionData[] = nodeConnections.map(conn => ({
            sourceId: conn.source.id,
            targetId: conn.target.id,
            sourceType: conn.source.type,
            targetType: conn.target.type,
            sourceLabel: conn.source.label,
            targetLabel: conn.target.label,
            connectionType: conn.connectionType,
            connectionLabel: conn.connectionLabel,
            strength: conn.strength,
            overlap: conn.overlap
          }));
          
          return {
            id: node.id,
            type: node.type,
            label: node.label,
            connections: connectionDataArray,
            isHovered: node.hovered
          };
        });
        
        return nodeDataArray;
      };
      
      // Update the React state with node data
      const updateExternalState = () => {
        const nodeDataArray = convertToNodeData();
        
        // Set nodes data in React state
        setNodes(nodeDataArray);
        
        // Update hovered node ID
        const hoveredNode = nodes.find(n => n.hovered);
        setHoveredNodeId(hoveredNode ? hoveredNode.id : null);
      };
      
      // Helper function to handle both mouse and touch interactions
      const handleInteractionStart = (x: number, y: number) => {
        // Check for clicking/touching nodes
        for (const node of nodes) {
          if (p.dist(x, y, node.x, node.y) < node.size / 2 + 5) {
            // Handle node selection
            setSelectedNodeId(node.id);
            
            // If onNodeSelect callback exists, call it with the node data
            if (onNodeSelect) {
              const nodeData = convertToNodeData().find(n => n.id === node.id);
              if (nodeData) {
                onNodeSelect(nodeData);
              }
            }
            
            // Start dragging the node
            node.dragging = true;
            break; // Only interact with one node at a time
          }
        }
      };
      
      const handleInteractionEnd = () => {
        // Stop dragging all nodes
        for (const node of nodes) {
          node.stopDrag();
        }
      };
      
      // Mouse handlers
      p.mousePressed = () => {
        handleInteractionStart(p.mouseX, p.mouseY);
        return false; // Return false to prevent default browser behavior
      };
      
      p.mouseReleased = () => {
        handleInteractionEnd();
        return false;
      };
      
      // Touch handlers for mobile devices
      p.touchStarted = () => {
        // Check if we're touching a node
        const isNodeTouched = nodes.some(node => p.dist(p.mouseX, p.mouseY, node.x, node.y) < node.size / 2 + 5);
        
        // For p5.js mobile, we can just use mouseX/mouseY as they are mapped to touch events
        if (isNodeTouched) {
          handleInteractionStart(p.mouseX, p.mouseY);
          return true; // Prevent default only when interacting with nodes
        }
        
        // Allow normal scrolling when touching empty canvas areas
        return false;
      };
      
      p.touchEnded = () => {
        // Check if any node was being dragged
        const wasNodeDragged = nodes.some(node => node.dragging);
        
        // End interaction
        handleInteractionEnd();
        
        // Only prevent default if we were interacting with a node
        return wasNodeDragged;
      };
      
      // Handle touch moving (dragging)
      p.touchMoved = () => {
        // Check if any node is being dragged
        const isNodeBeingDragged = nodes.some(node => node.dragging);
        
        // Update any node that is being dragged
        for (const node of nodes) {
          if (node.dragging) {
            node.x = p.mouseX;
            node.y = p.mouseY;
          }
        }
        
        // Only prevent default scrolling if we're interacting with a node
        // This allows normal page scrolling when touching empty areas
        return isNodeBeingDragged;
      };

      // Check if element is in viewport for lazy rendering
      const checkIsInViewport = () => {
        if (!containerRef.current) return false;
        
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // Element is in viewport if its top is in view or its bottom is in view
        // or if the element spans the entire viewport
        const verticallyInView = (
          (rect.top >= 0 && rect.top <= windowHeight) ||
          (rect.bottom >= 0 && rect.bottom <= windowHeight) ||
          (rect.top <= 0 && rect.bottom >= windowHeight)
        );
        
        isInViewport = verticallyInView;
        return verticallyInView;
      };
      
      p.setup = () => {
        // Create responsive canvas with a strict height
        const canvas = p.createCanvas(
          containerRef.current?.offsetWidth || window.innerWidth,
          400 // Controlled height to stay contained within section
        );
        canvas.parent(containerRef.current!);
        
        // Set appropriate frame rate for device
        p.frameRate(isMobile() ? mobileFrameRate : desktopFrameRate);
        
        // Create mycelium branches
        for (let i = 0; i < myceliumCount; i++) {
          myceliumBranches.push(new MyceliumBranch());
        }
        
        // Create nodes with better spacing distribution
        for (let i = 0; i < nodeCount; i++) {
          nodes.push(new Node(i));
        }
        
        // Initial viewport check
        checkIsInViewport();
        
        // Create connections with more strategic linking
        // First ensure each node has at least one connection
        nodes.forEach((sourceNode, i) => {
          // Find complementary node types for meaningful connections
          const compatibleTypes = getCompatibleNodeTypes(sourceNode.type);
          
          // Find potential targets of compatible types
          const potentialTargets = nodes.filter(node => 
            compatibleTypes.includes(node.type) && node.id !== sourceNode.id
          );
          
          if (potentialTargets.length > 0) {
            // Connect to at least one compatible node
            const targetNode = potentialTargets[Math.floor(p.random(potentialTargets.length))];
            connections.push(new Connection(sourceNode, targetNode));
          }
        });
        
        // Add additional connections for more network density
        for (let i = 0; i < nodeCount; i++) {
          const sourceNode = nodes[i];
          
          // Number of additional connections varies by node type
          let maxNodeConnections = 2; // Default
          
          // Users connect to more entities
          if (sourceNode.type === 'user') maxNodeConnections = 4;
          // Interests connect to many entities
          else if (sourceNode.type === 'interest') maxNodeConnections = 5;
          // Businesses have several connections
          else if (sourceNode.type === 'business') maxNodeConnections = 3;
          
          // How many more connections to add (random but based on max)
          const additionalConnections = Math.floor(p.random(1, maxNodeConnections));
          
          // Current connection count for this node
          const currentConnections = connections.filter(conn => 
            conn.source.id === sourceNode.id || conn.target.id === sourceNode.id
          ).length;
          
          // Add more connections if below the limit
          for (let j = 0; j < additionalConnections && j + currentConnections < maxNodeConnections; j++) {
            // Find unconnected nodes
            const alreadyConnectedIds = connections.filter(conn => 
              conn.source.id === sourceNode.id || conn.target.id === sourceNode.id
            ).map(conn => 
              conn.source.id === sourceNode.id ? conn.target.id : conn.source.id
            );
            
            const unconnectedNodes = nodes.filter(node => 
              node.id !== sourceNode.id && !alreadyConnectedIds.includes(node.id)
            );
            
            if (unconnectedNodes.length > 0) {
              const targetNode = unconnectedNodes[Math.floor(p.random(unconnectedNodes.length))];
              connections.push(new Connection(sourceNode, targetNode));
            }
          }
        }
        
        // Listen for scroll events
        window.addEventListener('scroll', handleScroll);
      };
      
      // Helper function to determine which node types can meaningfully connect
      function getCompatibleNodeTypes(type: NodeType): NodeType[] {
        // Different connection possibilities based on node type
        switch(type) {
          case 'user':
            return ['interest', 'business', 'event', 'location', 'brand', 'product'];
          case 'business':
            return ['user', 'product', 'location', 'event', 'brand'];
          case 'interest':
            return ['user', 'event', 'product'];
          case 'location':
            return ['business', 'user', 'event'];
          case 'event':
            return ['business', 'user', 'interest', 'location'];
          case 'brand':
            return ['business', 'user', 'product'];
          case 'product':
            return ['business', 'user', 'interest', 'brand'];
          default:
            return ['user', 'business', 'interest']; // Fallback
        }
      }
      
      p.draw = () => {
        // Check if in viewport every 60 frames (roughly once every 1-4 seconds depending on frame rate)
        if (p.frameCount % 60 === 0) {
          checkIsInViewport();
        }
        
        p.clear();
        
        // For mobile devices, only do full updates when in viewport
        const shouldReduceUpdates = isMobile() && !isInViewport;
        
        // Update scroll velocity (ease to zero)
        scrollVelocity = scrollVelocity * 0.92;
        
        // On mobile, when out of viewport, only update what's needed 
        if (shouldReduceUpdates) {
          // Minimal updates - just draw existing state
          // Skip animation updates for performance
          
          // Draw a simplified version of connections (fewer or no animations)
          if (p.frameCount % 3 === 0) { // Only update every 3 frames
            // Draw connections (middle layer) - simplified
            connections.forEach(connection => connection.draw());
            
            // Draw nodes (top layer) - without updates
            nodes.forEach(node => node.draw());
            
            // Skip mycelium animations completely
            // Skip new branch generation
            
            // Simplified legend
            if (p.frameCount % 6 === 0) { // Only draw legend every 6 frames
              drawLegend();
            }
          }
        } else {
          // Full animation updates when in viewport or on desktop
          
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
          
          // Add an occasional new mycelium branch (less frequently on mobile)
          const branchProbability = isMobile() ? 0.001 : 0.003;
          const maxBranches = isMobile() ? 10 : 20;
          if (p.random() < branchProbability && myceliumBranches.length < maxBranches) {
            myceliumBranches.push(new MyceliumBranch());
          }
          
          // Draw legend showing node types and shapes
          drawLegend();
        }
        
        // Update React state with current node data
        // Only do this occasionally to avoid performance issues
        if (p.frameCount % (isMobile() ? 60 : 30) === 0) { // Less frequent updates on mobile
          updateExternalState();
        }
      };
      
      // Draw a legend showing what each shape/color represents
      function drawLegend() {
        const legendX = 10;
        const legendY = 20;
        const lineHeight = 16;
        const nodeTypes = Object.keys(nodeColors) as NodeType[];
        
        p.push();
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(9);
        p.fill(0, 0, 0, 180);
        p.text("Node Types:", legendX, legendY - 10);
        
        nodeTypes.forEach((type, i) => {
          const y = legendY + i * lineHeight;
          const iconSize = 8;
          
          // Draw node icon
          p.fill(
            nodeColors[type].r, 
            nodeColors[type].g, 
            nodeColors[type].b, 
            200
          );
          p.noStroke();
          
          // Draw appropriate shape based on type
          switch(type) {
            case 'user':
              p.ellipse(legendX + 5, y, iconSize);
              break;
            case 'business':
              p.rectMode(p.CENTER);
              p.rect(legendX + 5, y, iconSize, iconSize, iconSize/4);
              break;
            case 'interest':
              p.beginShape();
              for (let j = 0; j < 3; j++) {
                const angle = p.TWO_PI * j / 3 - p.PI / 2;
                const tx = legendX + 5 + p.cos(angle) * (iconSize/2);
                const ty = y + p.sin(angle) * (iconSize/2);
                p.vertex(tx, ty);
              }
              p.endShape(p.CLOSE);
              break;
            case 'location':
              p.beginShape();
              p.vertex(legendX + 5, y - iconSize/2);
              p.vertex(legendX + 5 + iconSize/2, y);
              p.vertex(legendX + 5, y + iconSize/2);
              p.vertex(legendX + 5 - iconSize/2, y);
              p.endShape(p.CLOSE);
              break;
            case 'event':
              const starPoints = 5;
              const outerRadius = iconSize / 2;
              const innerRadius = outerRadius * 0.4;
              p.beginShape();
              for (let j = 0; j < starPoints * 2; j++) {
                const angle = p.TWO_PI * j / (starPoints * 2) - p.PI / 2;
                const radius = j % 2 === 0 ? outerRadius : innerRadius;
                const sx = legendX + 5 + p.cos(angle) * radius;
                const sy = y + p.sin(angle) * radius;
                p.vertex(sx, sy);
              }
              p.endShape(p.CLOSE);
              break;
            case 'brand':
              p.beginShape();
              for (let j = 0; j < 6; j++) {
                const angle = p.TWO_PI * j / 6;
                const hx = legendX + 5 + p.cos(angle) * (iconSize/2);
                const hy = y + p.sin(angle) * (iconSize/2);
                p.vertex(hx, hy);
              }
              p.endShape(p.CLOSE);
              break;
            case 'product':
              p.push();
              p.translate(legendX + 5, y);
              p.rotate(p.PI / 4);
              p.rectMode(p.CENTER);
              p.rect(0, 0, iconSize * 0.7, iconSize * 0.7);
              p.pop();
              break;
          }
          
          // Draw node type label
          p.fill(0, 0, 0, 220);
          p.text(getNodeTypeDisplayName(type), legendX + 15, y);
        });
        p.pop();
      }
      
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
    
    // Add scroll event listener for viewport detection
    const handleScrollForViewport = () => {
      // Check if animation is in viewport on scroll
      if (canvasRef.current) {
        const p5Instance = canvasRef.current as any;
        if (p5Instance.checkIsInViewport) {
          p5Instance.checkIsInViewport();
        }
      }
    };
    
    // Add throttled scroll event listener for viewport detection
    window.addEventListener('scroll', handleScrollForViewport, { passive: true });
    
    // Initialize the p5 instance
    canvasRef.current = new p5(sketch, containerRef.current!);
    
    // Cleanup
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
      window.removeEventListener('scroll', handleScrollForViewport);
    };
  }, [onNodeSelect, setNodes, setHoveredNodeId, setSelectedNodeId]);
  
  // Create animation context value
  const animationContextValue = {
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    hoveredNodeId
  };

  return (
    <AnimationContext.Provider value={animationContextValue}>
      <div 
        ref={containerRef} 
        className={`relative w-full h-[400px] overflow-hidden ${className}`}
        aria-hidden="true" // Animation is decorative
      >
        <div className="absolute bottom-2 right-2 bg-black/20 text-black text-xs px-2 py-1 rounded-md pointer-events-none">
          Network visualization of Overlapp connections
        </div>
        <div className="absolute top-2 right-2 bg-black/20 text-black text-xs px-2 py-1 rounded-md pointer-events-none">
          Click/touch and drag nodes to interact
        </div>
      </div>
    </AnimationContext.Provider>
  );
};

export default EnhancedOverlappAnimation;