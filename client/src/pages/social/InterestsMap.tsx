import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ForceGraph2D from 'react-force-graph-2d';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  displayName: string;
  username: string;
  avatar?: string;
  interests: string[];
}

interface Interest {
  id: number;
  name: string;
  category: string;
  users: number[];
}

interface GraphNode {
  id: string;
  name: string;
  type: 'user' | 'interest';
  val: number;
  color?: string;
  userId?: number;
  interestId?: number;
  category?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | {id: string; x: number; y: number};
  target: string | {id: string; x: number; y: number};
  strength?: number;
}

// Define color palette for different interest categories
const categoryColors = {
  'Technology': '#4285F4',
  'Art': '#EA4335',
  'Science': '#34A853',
  'Music': '#FBBC05',
  'Sports': '#FF6D01',
  'Food': '#46BDC6',
  'Travel': '#9C27B0',
  'Fashion': '#FF4081',
  'Literature': '#795548',
  'Movies': '#607D8B',
  'Other': '#8E44AD'
};

// Generate a color for categories not in our predefined list
const getColorForCategory = (category: string) => {
  if (category in categoryColors) {
    return categoryColors[category as keyof typeof categoryColors];
  }
  
  // Generate a deterministic color from the category name
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

export default function InterestsMap() {
  const isMobile = useIsMobile();
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [overlapThreshold, setOverlapThreshold] = useState<number>(1);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedLinks, setHighlightedLinks] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch all users with their interests
  const { data: usersData, isLoading: loadingUsers } = useQuery<{ users: User[] }>({
    queryKey: ['/api/users/with-interests'],
  });

  // Fetch all interests with data about which users have each interest
  const { data: interestsData, isLoading: loadingInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests/with-users'],
  });

  useEffect(() => {
    if (usersData?.users && interestsData?.interests) {
      // Extract all unique categories
      const allCategories = Array.from(
        new Set(interestsData.interests.map(interest => interest.category))
      );
      setCategories(allCategories);
      
      // Default to showing all categories
      setSelectedCategories(new Set(allCategories));
      
      generateGraph(usersData.users, interestsData.interests, overlapThreshold);
    }
  }, [usersData, interestsData, overlapThreshold]);

  const generateGraph = (users: User[], interests: Interest[], threshold: number) => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const userNodes: GraphNode[] = [];
    const interestNodes: GraphNode[] = [];

    // Filter interests based on selected categories
    const filteredInterests = interests.filter(interest => 
      selectedCategories.has(interest.category)
    );

    // Create user nodes
    users.forEach(user => {
      const userNode: GraphNode = {
        id: `user-${user.id}`,
        name: user.displayName || user.username,
        type: 'user',
        val: 1, // Base size
        userId: user.id
      };
      userNodes.push(userNode);
    });

    // Create interest nodes
    filteredInterests.forEach(interest => {
      if (interest.users.length >= threshold) {
        const interestNode: GraphNode = {
          id: `interest-${interest.id}`,
          name: interest.name,
          type: 'interest',
          val: interest.users.length * 0.5, // Size based on popularity
          color: getColorForCategory(interest.category),
          interestId: interest.id,
          category: interest.category
        };
        interestNodes.push(interestNode);
      }
    });

    // Combine all nodes
    nodes.push(...userNodes, ...interestNodes);

    // Create links between users and interests
    filteredInterests.forEach(interest => {
      interest.users.forEach(userId => {
        links.push({
          source: `user-${userId}`,
          target: `interest-${interest.id}`,
          strength: 0.5
        });
      });
    });

    // Create links between users who share interests (for high similarity only)
    users.forEach((user1, i) => {
      users.slice(i + 1).forEach(user2 => {
        // Find common interests
        const commonInterestIds = filteredInterests
          .filter(interest => 
            interest.users.includes(user1.id) && 
            interest.users.includes(user2.id)
          )
          .map(interest => interest.id);

        // If they share enough interests, connect them
        if (commonInterestIds.length >= threshold) {
          links.push({
            source: `user-${user1.id}`,
            target: `user-${user2.id}`,
            strength: commonInterestIds.length * 0.1 // Strength based on number of shared interests
          });
        }
      });
    });

    setGraphData({ nodes, links });
  };

  const handleNodeClick = (node: GraphNode) => {
    if (selectedNode === node) {
      // Clicking the same node again deselects it
      setSelectedNode(null);
      setHighlightedNodes(new Set());
      setHighlightedLinks(new Set());
      return;
    }

    setSelectedNode(node);
    
    // Highlight the selected node and its connections
    const connectedNodes = new Set<string>([node.id]);
    const connectedLinks = new Set<string>();
    
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === node.id) {
        connectedNodes.add(targetId);
        connectedLinks.add(`${sourceId}-${targetId}`);
      } else if (targetId === node.id) {
        connectedNodes.add(sourceId);
        connectedLinks.add(`${sourceId}-${targetId}`);
      }
    });
    
    setHighlightedNodes(connectedNodes);
    setHighlightedLinks(connectedLinks);
  };

  const toggleCategory = (category: string) => {
    const newSelectedCategories = new Set(selectedCategories);
    
    if (newSelectedCategories.has(category)) {
      newSelectedCategories.delete(category);
    } else {
      newSelectedCategories.add(category);
    }
    
    setSelectedCategories(newSelectedCategories);
    
    // Regenerate the graph with the new category filter
    if (usersData?.users && interestsData?.interests) {
      generateGraph(usersData.users, interestsData.interests, overlapThreshold);
    }
  };

  const nodeCanvasObject = (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = node.type === 'interest' ? 14 : 12;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + 8); // Add padding
    
    // Ensure node has x and y coordinates (they should be added by force graph)
    const nodeX = node.x || 0;
    const nodeY = node.y || 0;

    // Node color based on type and highlight status
    let color = node.type === 'user' ? '#1E88E5' : (node.color || '#4CAF50');
    
    // Dim nodes that are not highlighted (when a node is selected)
    if (selectedNode && !highlightedNodes.has(node.id)) {
      color = node.type === 'user' ? 'rgba(30, 136, 229, 0.3)' : `${node.color}50` || 'rgba(76, 175, 80, 0.3)';
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    
    if (node.type === 'interest') {
      // Interest nodes are squares
      const size = Math.sqrt(node.val) * 5 + 2; // Scale based on popularity
      ctx.rect(nodeX - size/2, nodeY - size/2, size, size);
    } else {
      // User nodes are circles
      const size = 5; // Constant size for users
      ctx.arc(nodeX, nodeY, size, 0, 2 * Math.PI, false);
    }
    
    ctx.fill();

    // Only show labels for interests or for highlighted users
    if (globalScale >= 1 && (node.type === 'interest' || (selectedNode && highlightedNodes.has(node.id)))) {
      // Add a background rectangle for the text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(
        nodeX - bckgDimensions[0] / 2,
        nodeY - bckgDimensions[1] / 2 - 10,
        bckgDimensions[0],
        bckgDimensions[1]
      );

      // Text color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.type === 'interest' ? '#000' : '#1A237E';
      ctx.fillText(label, nodeX, nodeY - 10);
    }
  };

  const linkCanvasObject = (link: any, ctx: CanvasRenderingContext2D) => {
    // Get source and target nodes
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const linkId = `${sourceId}-${targetId}`;
    
    // Determine if this link should be highlighted
    const isHighlighted = !selectedNode || highlightedLinks.has(linkId);
    
    // Set link color and width based on highlight status
    ctx.strokeStyle = isHighlighted ? '#666' : 'rgba(180, 180, 180, 0.2)';
    ctx.lineWidth = isHighlighted ? 0.8 : 0.5;
    
    // Safely get coordinates
    const sourceX = typeof link.source === 'object' ? (link.source.x || 0) : 0;
    const sourceY = typeof link.source === 'object' ? (link.source.y || 0) : 0;
    const targetX = typeof link.target === 'object' ? (link.target.x || 0) : 0;
    const targetY = typeof link.target === 'object' ? (link.target.y || 0) : 0;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
  };

  if (loadingUsers || loadingInterests) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-primary h-8 w-8 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p>Loading interest network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Shared Interests Map</h1>
        <p className="text-muted-foreground">
          Explore connections between users based on shared interests. Each square represents an interest,
          and each circle represents a user. Lines between them show connections.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Overlap Threshold</h3>
                <div className="flex items-center space-x-2">
                  <Slider
                    defaultValue={[overlapThreshold]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(value) => setOverlapThreshold(value[0])}
                  />
                  <span className="w-12 text-center">{overlapThreshold}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Show connections with at least this many shared interests
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Interest Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <TooltipProvider key={category}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "py-1 h-auto",
                              selectedCategories.has(category) 
                                ? "border-2 border-primary" 
                                : "opacity-50"
                            )}
                            style={{ 
                              borderColor: selectedCategories.has(category) 
                                ? getColorForCategory(category) 
                                : undefined,
                              color: selectedCategories.has(category) 
                                ? getColorForCategory(category) 
                                : undefined
                            }}
                            onClick={() => toggleCategory(category)}
                          >
                            {category}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle {category} interests</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>
                  {selectedNode.type === 'user' ? 'User' : 'Interest'} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium">{selectedNode.name}</h3>
                    {selectedNode.type === 'interest' && (
                      <p className="text-sm text-muted-foreground">
                        Category: {selectedNode.category}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Connections:</h4>
                    <ul className="text-sm space-y-1">
                      {Array.from(highlightedNodes)
                        .filter(id => id !== selectedNode.id)
                        .map(id => {
                          const node = graphData.nodes.find(n => n.id === id);
                          return node ? (
                            <li key={id} className="truncate">
                              • {node.name} ({node.type})
                            </li>
                          ) : null;
                        })}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-3 bg-card rounded-lg border shadow-sm overflow-hidden" style={{ height: '75vh' }}>
          {graphData.nodes.length > 0 && (
            <ForceGraph2D
              graphData={graphData}
              nodeCanvasObject={nodeCanvasObject}
              linkCanvasObject={linkCanvasObject}
              onNodeClick={handleNodeClick}
              cooldownTicks={100}
              linkWidth={1}
              linkColor={() => 'rgba(180, 180, 180, 0.6)'}
              nodeRelSize={6}
              nodeId="id"
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.1}
              warmupTicks={50}
              width={isMobile ? window.innerWidth - 50 : undefined}
              height={isMobile ? 400 : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}