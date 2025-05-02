import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Calendar, 
  Tag, 
  Store, 
  ArrowUp, 
  Info,
  Sparkles
} from 'lucide-react';
import ConstellationCanvas, { NodeData } from '@/components/constellation/ConstellationCanvas';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPrivacyPanelOpen, setIsPrivacyPanelOpen] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    } else {
      // Redirect to onboarding if no user data
      toast({
        title: "No profile found",
        description: "Please complete onboarding first",
        variant: "destructive"
      });
      setLocation('/');
    }
  }, [setLocation, toast]);

  // Handle node selection
  const handleNodeSelect = (node: NodeData) => {
    setSelectedNode(node);
    setIsSheetOpen(true);
  };

  // Toggle privacy panel
  const togglePrivacyPanel = () => {
    setIsPrivacyPanelOpen(!isPrivacyPanelOpen);
  };

  // Handle revoking data in privacy panel
  const handleRevokeData = () => {
    // Ask for confirmation
    if (window.confirm('Are you sure you want to revoke all your data? This action cannot be undone.')) {
      // Clear localStorage
      localStorage.removeItem('userData');
      
      // Show toast
      toast({
        title: "Data revoked",
        description: "All your data has been cleared",
      });
      
      // Close privacy panel
      setIsPrivacyPanelOpen(false);
      
      // Redirect to onboarding
      setTimeout(() => {
        setLocation('/');
      }, 1500);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#101010]">
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          <h1 className="text-xl font-bold text-white">Overlapp</h1>
        </div>
      </header>
      
      {/* Main constellation canvas */}
      <div className="flex-grow w-full">
        {userData && (
          <ConstellationCanvas 
            userData={userData}
            highlightedNodeId={selectedNode?.id || null}
            onNodeSelect={handleNodeSelect}
            className="w-full h-full"
          />
        )}
      </div>
      
      {/* Bottom sheet - Mall Companion */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[60vh] max-h-[600px]">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center">
              {selectedNode?.type === 'user' && <Users className="mr-2 h-5 w-5" />}
              {selectedNode?.type === 'interest' && <Tag className="mr-2 h-5 w-5" />}
              {selectedNode?.type === 'location' && <MapPin className="mr-2 h-5 w-5" />}
              {selectedNode?.type === 'event' && <Calendar className="mr-2 h-5 w-5" />}
              {selectedNode?.type === 'brand' && <Store className="mr-2 h-5 w-5" />}
              {selectedNode?.label || 'Node Details'}
              
              <Badge 
                variant="outline" 
                className="ml-2 capitalize"
              >
                {selectedNode?.type || 'Node'}
              </Badge>
            </SheetTitle>
            <SheetDescription>
              Explore connections and discover overlap
            </SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="overlap">Overlap</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Type</h3>
                    <p className="text-muted-foreground capitalize">{selectedNode?.type}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Name</h3>
                    <p className="text-muted-foreground">{selectedNode?.label}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Connections</h3>
                    <p className="text-muted-foreground">{selectedNode?.connections.length || 0} connections</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="connections" className="p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedNode?.connections.length === 0 && (
                      <p className="text-muted-foreground">No connections found</p>
                    )}
                    
                    {selectedNode?.connections.map((connection, idx) => (
                      <div key={idx} className="flex items-center p-2 border rounded-md">
                        <Badge variant="outline" className="mr-2">
                          {connection.type}
                        </Badge>
                        <span className="text-sm">
                          ID: {connection.targetId}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          Strength: {Math.round(connection.strength * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="overlap" className="p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overlap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Discover shared connections and affinities with this node
                  </p>
                  
                  <div className="flex justify-center">
                    <Button className="bg-primary text-primary-foreground">
                      Analyze Overlap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
      
      {/* FAB for Privacy Panel */}
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 bottom-4 rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg"
        onClick={togglePrivacyPanel}
      >
        <Lock className="h-5 w-5" />
      </Button>
      
      {/* Privacy Panel Modal */}
      {isPrivacyPanelOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
                Privacy Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-auto max-h-[300px] border bg-muted/50 p-4 rounded-md font-mono text-xs">
                <pre>{JSON.stringify(userData, null, 2)}</pre>
              </div>
              
              <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-start gap-4">
                  <Info className="mt-1 h-5 w-5 text-amber-500" />
                  <div>
                    <h3 className="font-medium text-amber-500">Privacy Information</h3>
                    <p className="text-sm text-muted-foreground">
                      All your data is stored locally on your device. No data is sent to any server.
                      You can revoke access to your data at any time by clicking the button below.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPrivacyPanelOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRevokeData}
                >
                  Revoke Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}