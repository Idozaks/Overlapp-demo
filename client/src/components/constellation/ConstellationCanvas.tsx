import React, { useEffect, useRef, useState, useCallback } from 'react';
import p5 from 'p5';

// Define node types for the visualization
type NodeType = 'user' | 'interest' | 'location' | 'event' | 'brand' | 'product';

// Define interface for node data
export interface NodeData {
  id: number;
  type: NodeType;
  label: string;
  connections: ConnectionData[];
  isHighlighted?: boolean;
  x?: number;
  y?: number;
}

// Define interface for connection data
export interface ConnectionData {
  sourceId: number;
  targetId: number;
  type: string;
  strength: number;
}

type ConstellationCanvasProps = {
  className?: string;
  onNodeSelect?: (nodeData: NodeData) => void;
  highlightedNodeId?: number | null;
  userData?: any;
};

const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  className = '',
  onNodeSelect,
  highlightedNodeId = null,
  userData
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<p5 | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  
  // Mock data generation (would be replaced with actual data from API)
  const generateMockData = useCallback(() => {
    // Generate user node based on onboarding data
    const userInterests = userData?.interests || [];
    
    const mockNodes: NodeData[] = [
      // User node is always at index 0
      {
        id: 0,
        type: 'user',
        label: userData?.name || 'You',
        connections: [],
        isHighlighted: true
      }
    ];
    
    // Add interest nodes based on user selections
    const interestLabels = [
      'Technology', 'Art & Design', 'Food & Cooking', 'Fitness', 'Travel',
      'Music', 'Reading', 'Photography', 'Gaming', 'Fashion',
      'Gardening', 'Movies', 'Science', 'Sports', 'Podcasts'
    ];
    
    // Add other people nodes
    const peopleLabels = [
      'Tech Enthusiast', 'Design Professional', 'Food Explorer', 
      'Fitness Coach', 'Travel Blogger', 'Music Producer',
      'Book Author', 'Photographer', 'Gamer', 'Fashion Designer'
    ];
    
    // Add venues/location nodes
    const venueLabels = [
      'Tech Hub', 'Design Studio', 'Culinary School', 
      'Fitness Center', 'Travel Agency', 'Music Venue',
      'Library', 'Photo Gallery', 'Gaming Cafe', 'Fashion Boutique'
    ];
    
    // Add interest nodes first (based on user selection if available)
    let nextId = 1;
    
    // If user has selected interests, use those
    if (userInterests && userInterests.length > 0) {
      userInterests.forEach((interestId: number) => {
        if (interestId >= 1 && interestId <= interestLabels.length) {
          const label = interestLabels[interestId - 1];
          mockNodes.push({
            id: nextId,
            type: 'interest',
            label,
            connections: [{
              sourceId: 0,
              targetId: nextId,
              type: 'likes',
              strength: 0.8
            }]
          });
          
          // Add connection to user node
          mockNodes[0].connections.push({
            sourceId: 0,
            targetId: nextId,
            type: 'likes',
            strength: 0.8
          });
          
          nextId++;
        }
      });
    } else {
      // Add some random interests if user hasn't selected any
      const randomInterests = Array.from({ length: 3 }, () => 
        Math.floor(Math.random() * interestLabels.length)
      );
      
      randomInterests.forEach(idx => {
        mockNodes.push({
          id: nextId,
          type: 'interest',
          label: interestLabels[idx],
          connections: [{
            sourceId: 0,
            targetId: nextId,
            type: 'likes',
            strength: 0.8
          }]
        });
        
        // Add connection to user node
        mockNodes[0].connections.push({
          sourceId: 0,
          targetId: nextId,
          type: 'likes',
          strength: 0.8
        });
        
        nextId++;
      });
    }
    
    // Add people nodes
    for (let i = 0; i < 5; i++) {
      const personNodeId = nextId;
      mockNodes.push({
        id: personNodeId,
        type: 'user',
        label: peopleLabels[i % peopleLabels.length],
        connections: []
      });
      
      // Connect each person to 1-3 random interests
      const numConnections = Math.floor(Math.random() * 3) + 1;
      const availableInterestNodes = mockNodes.filter(n => n.type === 'interest');
      
      for (let j = 0; j < numConnections && j < availableInterestNodes.length; j++) {
        const randomInterestIndex = Math.floor(Math.random() * availableInterestNodes.length);
        const interestNode = availableInterestNodes[randomInterestIndex];
        
        // Add connection from person to interest
        mockNodes[personNodeId].connections.push({
          sourceId: personNodeId,
          targetId: interestNode.id,
          type: 'likes',
          strength: Math.random() * 0.5 + 0.3 // random strength between 0.3 and 0.8
        });
        
        // Remove this interest from available list to avoid duplicates
        availableInterestNodes.splice(randomInterestIndex, 1);
      }
      
      nextId++;
    }
    
    // Add venue/location nodes
    for (let i = 0; i < 3; i++) {
      const venueNodeId = nextId;
      mockNodes.push({
        id: venueNodeId,
        type: 'location',
        label: venueLabels[i % venueLabels.length],
        connections: []
      });
      
      // Connect venue to 1-2 random people
      const numConnections = Math.floor(Math.random() * 2) + 1;
      const availablePeopleNodes = mockNodes.filter(n => n.type === 'user' && n.id !== 0);
      
      for (let j = 0; j < numConnections && j < availablePeopleNodes.length; j++) {
        const randomPersonIndex = Math.floor(Math.random() * availablePeopleNodes.length);
        const personNode = availablePeopleNodes[randomPersonIndex];
        
        // Add connection from venue to person
        mockNodes[venueNodeId].connections.push({
          sourceId: venueNodeId,
          targetId: personNode.id,
          type: 'visited_by',
          strength: Math.random() * 0.4 + 0.4 // random strength between 0.4 and 0.8
        });
        
        // Add connection from person to venue
        mockNodes[personNode.id].connections.push({
          sourceId: personNode.id,
          targetId: venueNodeId,
          type: 'visits',
          strength: Math.random() * 0.4 + 0.4 // same strength
        });
        
        // Remove this person from available list to avoid duplicates
        availablePeopleNodes.splice(randomPersonIndex, 1);
      }
      
      nextId++;
    }
    
    return mockNodes;
  }, [userData]);
  
  useEffect(() => {
    // Generate nodes when component mounts or userData changes
    const generatedNodes = generateMockData();
    setNodes(generatedNodes);
  }, [generateMockData, userData]);
  
  useEffect(() => {
    // Update node highlighting when highlightedNodeId changes
    if (nodes.length > 0) {
      // We won't recreate the entire nodes array, just update the isHighlighted property
      // This prevents unnecessary re-renders and animation glitches
      setNodes(prevNodes => 
        prevNodes.map(node => {
          // Only update the node if its highlight state has changed
          const shouldBeHighlighted = node.id === highlightedNodeId || node.id === 0;
          if (node.isHighlighted !== shouldBeHighlighted) {
            return {
              ...node,
              isHighlighted: shouldBeHighlighted
            };
          }
          return node;
        })
      );
    }
  }, [highlightedNodeId]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Remove any existing canvas
    if (canvasRef.current) {
      canvasRef.current.remove();
    }
    
    const sketch = (p: p5) => {
      // Configuration
      const config = {
        nodeSize: {
          user: 24,
          interest: 18,
          location: 20,
          event: 16,
          brand: 16,
          product: 14
        },
        colors: {
          user: p.color(21, 255, 138),        // Neon green #15ff8a
          interest: p.color(21, 255, 255),    // Cyan
          location: p.color(255, 21, 138),    // Pink
          event: p.color(255, 255, 21),       // Yellow
          brand: p.color(138, 21, 255),       // Purple
          product: p.color(255, 138, 21)      // Orange
        },
        bgColor: p.color(16, 16, 16),         // Dark background #101010
        lineColor: p.color(255, 255, 255, 50),
        highlightColor: p.color(21, 255, 138), // Highlight in neon green
        dampingFactor: 0.95,                  // Controls stabilization speed
        springLength: 120,                    // Base spring length between nodes
        springStiffness: 0.06,                // How rigid connections are
        centerAttraction: 0.0001,             // Attract nodes to center
        repulsionStrength: 400,               // Strength of node repulsion
        friction: 0.2,                        // Friction to slow down nodes
        initialRadius: 200                    // Initial placement radius
      };
      
      // Variables for physics simulation
      const nodePositions: Map<number, { x: number, y: number }> = new Map();
      const nodeVelocities: Map<number, { vx: number, vy: number }> = new Map();
      let isDragging = false;
      let draggedNodeId: number | null = null;
      let draggedPrevX = 0;
      let draggedPrevY = 0;
      
      // Setup the sketch
      p.setup = () => {
        // Create canvas that fills the container
        const canvas = p.createCanvas(
          containerRef.current!.clientWidth,
          containerRef.current!.clientHeight
        );
        
        canvas.mousePressed(() => handleMousePressed());
        canvas.mouseMoved(() => handleMouseMoved());
        canvas.mouseReleased(() => handleMouseReleased());
        
        // Initialize node positions in a circle
        nodes.forEach(node => {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * config.initialRadius + 100;
          
          // User node (id=0) at center
          const x = node.id === 0 
            ? p.width / 2 
            : p.width / 2 + Math.cos(angle) * radius;
            
          const y = node.id === 0 
            ? p.height / 2 
            : p.height / 2 + Math.sin(angle) * radius;
          
          nodePositions.set(node.id, { x, y });
          nodeVelocities.set(node.id, { vx: 0, vy: 0 });
        });
      };
      
      p.draw = () => {
        // Draw background
        p.background(config.bgColor);
        
        // Apply forces
        applyForces();
        
        // Update positions
        updatePositions();
        
        // Draw connections first (so they appear behind nodes)
        drawConnections();
        
        // Draw nodes
        drawNodes();
        
        // Draw labels for hovered node
        if (hoveredNodeId !== null) {
          const hoveredNode = nodes.find(n => n.id === hoveredNodeId);
          if (hoveredNode) {
            drawNodeLabel(hoveredNode);
          }
        }
      };
      
      // Handle window resize
      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
        }
      };
      
      // Apply physics forces to nodes
      const applyForces = () => {
        // Apply spring forces between connected nodes
        nodes.forEach(sourceNode => {
          sourceNode.connections.forEach(connection => {
            const targetNode = nodes.find(n => n.id === connection.targetId);
            if (!targetNode) return;
            
            const sourcePos = nodePositions.get(sourceNode.id);
            const targetPos = nodePositions.get(targetNode.id);
            
            if (!sourcePos || !targetPos) return;
            
            // Calculate distance and direction
            const dx = targetPos.x - sourcePos.x;
            const dy = targetPos.y - sourcePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Skip if nodes are too close
            if (distance < 1) return;
            
            // Calculate spring force
            const springLength = config.springLength * (1 - 0.3 * connection.strength);
            const displacement = distance - springLength;
            const springForce = displacement * config.springStiffness;
            
            // Apply force along the spring direction
            const fx = (dx / distance) * springForce;
            const fy = (dy / distance) * springForce;
            
            // Update velocities (if not being dragged)
            const sourceVel = nodeVelocities.get(sourceNode.id)!;
            const targetVel = nodeVelocities.get(targetNode.id)!;
            
            if (sourceNode.id !== draggedNodeId) {
              sourceVel.vx += fx;
              sourceVel.vy += fy;
            }
            
            if (targetNode.id !== draggedNodeId) {
              targetVel.vx -= fx;
              targetVel.vy -= fy;
            }
          });
        });
        
        // Apply repulsion forces between all nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            
            const posA = nodePositions.get(nodeA.id);
            const posB = nodePositions.get(nodeB.id);
            
            if (!posA || !posB) continue;
            
            // Calculate distance and direction
            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const distSq = dx * dx + dy * dy;
            const distance = Math.sqrt(distSq);
            
            // Skip if nodes are too far apart
            if (distance > 200) continue;
            
            // Calculate repulsion force (inversely proportional to distance squared)
            const repulsionForce = config.repulsionStrength / Math.max(distSq, 100);
            
            // Apply force in opposite directions
            const fx = (dx / distance) * repulsionForce;
            const fy = (dy / distance) * repulsionForce;
            
            const velA = nodeVelocities.get(nodeA.id)!;
            const velB = nodeVelocities.get(nodeB.id)!;
            
            if (nodeA.id !== draggedNodeId) {
              velA.vx -= fx;
              velA.vy -= fy;
            }
            
            if (nodeB.id !== draggedNodeId) {
              velB.vx += fx;
              velB.vy += fy;
            }
          }
        }
        
        // Apply center attraction
        nodes.forEach(node => {
          if (node.id === draggedNodeId) return;
          
          const pos = nodePositions.get(node.id);
          const vel = nodeVelocities.get(node.id);
          
          if (!pos || !vel) return;
          
          // Calculate direction to center
          const dx = p.width / 2 - pos.x;
          const dy = p.height / 2 - pos.y;
          const distSq = dx * dx + dy * dy;
          
          // Force proportional to distance from center
          const centerForce = distSq * config.centerAttraction;
          
          vel.vx += dx * centerForce;
          vel.vy += dy * centerForce;
        });
      };
      
      // Update node positions based on velocities
      const updatePositions = () => {
        nodes.forEach(node => {
          if (node.id === draggedNodeId) return;
          
          const pos = nodePositions.get(node.id);
          const vel = nodeVelocities.get(node.id);
          
          if (!pos || !vel) return;
          
          // Apply friction
          vel.vx *= (1 - config.friction);
          vel.vy *= (1 - config.friction);
          
          // Update position
          pos.x += vel.vx;
          pos.y += vel.vy;
          
          // Boundary constraints
          const margin = 50;
          if (pos.x < margin) {
            pos.x = margin;
            vel.vx *= -0.5;
          } else if (pos.x > p.width - margin) {
            pos.x = p.width - margin;
            vel.vx *= -0.5;
          }
          
          if (pos.y < margin) {
            pos.y = margin;
            vel.vy *= -0.5;
          } else if (pos.y > p.height - margin) {
            pos.y = p.height - margin;
            vel.vy *= -0.5;
          }
        });
      };
      
      // Draw connections between nodes
      const drawConnections = () => {
        p.noFill();
        
        nodes.forEach(sourceNode => {
          const sourcePos = nodePositions.get(sourceNode.id);
          if (!sourcePos) return;
          
          sourceNode.connections.forEach(connection => {
            const targetNode = nodes.find(n => n.id === connection.targetId);
            if (!targetNode) return;
            
            const targetPos = nodePositions.get(targetNode.id);
            if (!targetPos) return;
            
            // Determine if this connection should be highlighted
            const isHighlighted = 
              (sourceNode.isHighlighted && targetNode.isHighlighted) ||
              (sourceNode.id === hoveredNodeId || targetNode.id === hoveredNodeId);
            
            // Set stroke based on highlight state
            if (isHighlighted) {
              p.stroke(config.highlightColor);
              p.strokeWeight(2 * connection.strength);
            } else {
              // Lower opacity for non-highlighted connections
              const edgeColor = p.color(config.lineColor);
              edgeColor.setAlpha(30 + 70 * connection.strength);
              p.stroke(edgeColor);
              p.strokeWeight(1 * connection.strength);
            }
            
            // Draw the connection
            p.line(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
          });
        });
      };
      
      // Draw all nodes
      const drawNodes = () => {
        p.noStroke();
        
        nodes.forEach(node => {
          const pos = nodePositions.get(node.id);
          if (!pos) return;
          
          // Get node size based on type
          const baseSize = config.nodeSize[node.type];
          
          // Increase size if hovered or highlighted
          const isHovered = node.id === hoveredNodeId;
          const size = isHovered ? baseSize * 1.3 : baseSize;
          
          // Determine color
          let nodeColor = config.colors[node.type];
          
          // Add outer glow for hovered or highlighted nodes
          if (isHovered || node.isHighlighted) {
            // Draw glow
            const glowColor = isHovered ? p.color(255, 255, 255, 80) : config.highlightColor;
            p.fill(glowColor);
            p.circle(pos.x, pos.y, size + 10);
          }
          
          // Draw node
          p.fill(nodeColor);
          p.circle(pos.x, pos.y, size);
          
          // Store current position in the node data for external use
          node.x = pos.x;
          node.y = pos.y;
        });
      };
      
      // Draw label for a node
      const drawNodeLabel = (node: NodeData) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return;
        
        // Label text
        const labelText = node.label;
        const typeText = node.type.charAt(0).toUpperCase() + node.type.slice(1);
        
        // Calculate text dimensions
        p.textSize(14);
        const labelWidth = p.textWidth(labelText);
        const typeWidth = p.textWidth(typeText);
        const maxWidth = Math.max(labelWidth, typeWidth);
        
        // Background with rounded corners
        p.fill(16, 16, 16, 220);
        p.rect(
          pos.x - maxWidth/2 - 10,
          pos.y + 15,
          maxWidth + 20,
          50,
          5
        );
        
        // Draw text
        p.fill(255);
        p.textAlign(p.CENTER, p.TOP);
        p.text(labelText, pos.x, pos.y + 25);
        
        // Draw type with reduced opacity
        p.fill(200);
        p.textSize(12);
        p.text(typeText, pos.x, pos.y + 45);
      };
      
      // Mouse pressed handler
      const handleMousePressed = () => {
        // Find if mouse is over any node
        const mouseX = p.mouseX;
        const mouseY = p.mouseY;
        
        for (const node of nodes) {
          const pos = nodePositions.get(node.id);
          if (!pos) continue;
          
          const dx = mouseX - pos.x;
          const dy = mouseY - pos.y;
          const distSq = dx * dx + dy * dy;
          
          const radius = config.nodeSize[node.type] / 2;
          
          if (distSq <= radius * radius) {
            isDragging = true;
            draggedNodeId = node.id;
            draggedPrevX = mouseX;
            draggedPrevY = mouseY;
            break;
          }
        }
      };
      
      // Mouse moved handler
      const handleMouseMoved = () => {
        const mouseX = p.mouseX;
        const mouseY = p.mouseY;
        
        // Handle dragging
        if (isDragging && draggedNodeId !== null) {
          const pos = nodePositions.get(draggedNodeId);
          if (pos) {
            // Move the dragged node to mouse position
            pos.x = mouseX;
            pos.y = mouseY;
            
            // Reset velocity
            const vel = nodeVelocities.get(draggedNodeId);
            if (vel) {
              vel.vx = (mouseX - draggedPrevX) * 0.3;
              vel.vy = (mouseY - draggedPrevY) * 0.3;
            }
            
            draggedPrevX = mouseX;
            draggedPrevY = mouseY;
          }
          return;
        }
        
        // Check for hover
        let foundHoveredNode = false;
        
        for (const node of nodes) {
          const pos = nodePositions.get(node.id);
          if (!pos) continue;
          
          const dx = mouseX - pos.x;
          const dy = mouseY - pos.y;
          const distSq = dx * dx + dy * dy;
          
          const radius = config.nodeSize[node.type] / 2;
          
          if (distSq <= radius * radius) {
            if (hoveredNodeId !== node.id) {
              setHoveredNodeId(node.id);
              p.cursor(p.HAND);
            }
            foundHoveredNode = true;
            break;
          }
        }
        
        if (!foundHoveredNode && hoveredNodeId !== null) {
          setHoveredNodeId(null);
          p.cursor(p.ARROW);
        }
      };
      
      // Mouse released handler
      const handleMouseReleased = () => {
        if (isDragging && draggedNodeId !== null && hoveredNodeId === draggedNodeId) {
          // Handle click if node wasn't dragged much
          const node = nodes.find(n => n.id === draggedNodeId);
          if (node && onNodeSelect) {
            onNodeSelect(node);
          }
        }
        
        isDragging = false;
        draggedNodeId = null;
      };
    };
    
    // Create the p5 instance
    canvasRef.current = new p5(sketch, containerRef.current);
    
    // Cleanup function
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
      }
    };
  }, [nodes, hoveredNodeId, onNodeSelect]);
  
  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
    />
  );
};

export default ConstellationCanvas;