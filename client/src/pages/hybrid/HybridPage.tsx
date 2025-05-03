import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Users,
  Tag,
  Store,
  Calendar,
  Sparkles,
  Lock,
  Search,
  ShieldAlert,
  Info
} from 'lucide-react';

// Mock data - would be replaced with data from API or user selection
interface Connection {
  id: number;
  type: 'person' | 'place' | 'interest' | 'event' | 'brand';
  name: string;
  description: string;
  avatar?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  tags: string[];
  overlapStrength: number; // 0-100
}

const SAMPLE_CONNECTIONS: Connection[] = [
  {
    id: 1,
    type: 'person',
    name: 'Alex Chen',
    description: 'UX Designer with passion for travel and photography',
    avatar: '/avatars/avatar1.svg',
    tags: ['Design', 'Travel', 'Photography'],
    overlapStrength: 85,
    location: {
      lat: 32.0853,
      lng: 34.7818,
      address: 'Tel Aviv Design Center'
    }
  },
  {
    id: 2,
    type: 'place',
    name: 'Dizengoff Center',
    description: 'Popular shopping mall and meetup spot',
    tags: ['Shopping', 'Food', 'Entertainment'],
    overlapStrength: 70,
    location: {
      lat: 32.0750,
      lng: 34.7749,
      address: 'Dizengoff St 50, Tel Aviv'
    }
  },
  {
    id: 3,
    type: 'interest',
    name: 'Photography',
    description: 'Taking and editing photos, both digital and film',
    tags: ['Art', 'Technology', 'Creative'],
    overlapStrength: 90
  },
  {
    id: 4,
    type: 'event',
    name: 'Tel Aviv Art Festival',
    description: 'Annual showcase of local and international artists',
    tags: ['Art', 'Culture', 'Community'],
    overlapStrength: 65,
    location: {
      lat: 32.0733,
      lng: 34.7795,
      address: 'Rothschild Blvd, Tel Aviv'
    }
  },
  {
    id: 5,
    type: 'brand',
    name: 'Camera Co.',
    description: 'Specializing in professional photography equipment',
    tags: ['Technology', 'Photography', 'Retail'],
    overlapStrength: 75,
    location: {
      lat: 32.0631,
      lng: 34.7642,
      address: 'Allenby St 112, Tel Aviv'
    }
  },
  {
    id: 6,
    type: 'place',
    name: 'BeachSide Cafe',
    description: 'Popular cafe with ocean views',
    tags: ['Food', 'Coffee', 'Meeting Spot'],
    overlapStrength: 80,
    location: {
      lat: 32.0872,
      lng: 34.7652,
      address: 'Herbert Samuel St, Tel Aviv'
    }
  },
  {
    id: 7,
    type: 'person',
    name: 'Dana Levy',
    description: 'Marketing professional and coffee enthusiast',
    avatar: '/avatars/avatar2.svg',
    tags: ['Marketing', 'Coffee', 'Travel'],
    overlapStrength: 65,
    location: {
      lat: 32.0700,
      lng: 34.7925,
      address: 'Sarona Market'
    }
  },
  {
    id: 8,
    type: 'interest',
    name: 'Cooking',
    description: 'Experimenting with new recipes and cuisines',
    tags: ['Food', 'Culture', 'Creativity'],
    overlapStrength: 60
  }
];

export default function HybridPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isPrivacyPanelOpen, setIsPrivacyPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapFocus, setMapFocus] = useState<{lat: number, lng: number} | null>(null);

  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        // For demo, we'll use sample connections
        setConnections(SAMPLE_CONNECTIONS);
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

  // Handle connection card click
  const handleConnectionClick = (connection: Connection) => {
    setSelectedConnection(connection);
    
    // If location exists, update map focus
    if (connection.location) {
      setMapFocus(connection.location);
    }
  };

  // Get connections filtered by active tab and search term
  const getFilteredConnections = () => {
    return connections.filter(connection => {
      // Filter by type if not "all" tab
      const typeMatch = activeTab === 'all' || 
                       (activeTab === 'people' && connection.type === 'person') ||
                       (activeTab === 'places' && connection.type === 'place') ||
                       (activeTab === 'interests' && connection.type === 'interest') ||
                       (activeTab === 'events' && connection.type === 'event') ||
                       (activeTab === 'brands' && connection.type === 'brand');
                       
      // Filter by search term
      const searchMatch = 
        searchTerm === '' || 
        connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return typeMatch && searchMatch;
    });
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

  // Get icon based on connection type
  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'person':
        return <Users className="h-5 w-5" />;
      case 'place':
        return <MapPin className="h-5 w-5" />;
      case 'interest':
        return <Tag className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'brand':
        return <Store className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  // Get color class based on overlap strength
  const getOverlapColorClass = (strength: number) => {
    if (strength >= 80) return "bg-green-500 text-white";
    if (strength >= 60) return "bg-lime-500 text-white";
    if (strength >= 40) return "bg-amber-500 text-white";
    if (strength >= 20) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm">
        <div className="flex items-center">
          <div className="gradient-primary text-white p-1.5 rounded-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold ml-2 bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] bg-clip-text text-transparent">Overlapp</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search connections..."
              className="pl-8 h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:border-[#4D7FE8] focus:ring-1 focus:ring-[#4D7FE8] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={togglePrivacyPanel}
            title="Privacy Settings"
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Lock className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Sidebar with tabs and cards */}
        <div className="w-full lg:w-[400px] border-r border-gray-800 flex flex-col">
          <Tabs 
            defaultValue="all" 
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className="px-4 py-2 border-b border-gray-800">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="people" className="flex-1">People</TabsTrigger>
                <TabsTrigger value="places" className="flex-1">Places</TabsTrigger>
                <TabsTrigger value="interests" className="flex-1">Interests</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-3">
                {getFilteredConnections().map(connection => (
                  <Card 
                    key={connection.id}
                    className={`cursor-pointer transition-all hover:bg-muted/50 ${selectedConnection?.id === connection.id ? 'border-primary' : ''}`}
                    onClick={() => handleConnectionClick(connection)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2 ${connection.type === 'person' ? '' : 'bg-muted'}`}>
                          {connection.type === 'person' && connection.avatar ? (
                            <Avatar>
                              <AvatarImage src={connection.avatar} alt={connection.name} />
                              <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : (
                            getConnectionIcon(connection.type)
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-white">{connection.name}</h3>
                            <Badge 
                              className={getOverlapColorClass(connection.overlapStrength)}
                            >
                              {connection.overlapStrength}%
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {connection.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {connection.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {connection.location && (
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{connection.location.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {getFilteredConnections().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No connections found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>
        
        {/* Main content - Map View */}
        <div className="flex-grow p-4">
          <Card className="w-full h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>
                {selectedConnection ? (
                  <div className="flex items-center">
                    {getConnectionIcon(selectedConnection.type)}
                    <span className="ml-2">{selectedConnection.name}</span>
                    <Badge className="ml-2 capitalize">
                      {selectedConnection.type}
                    </Badge>
                  </div>
                ) : (
                  "Overlap Map"
                )}
              </CardTitle>
              <CardDescription>
                {selectedConnection 
                  ? selectedConnection.description
                  : "Select a connection to see details and location"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow relative">
              {selectedConnection ? (
                <div className="h-full flex flex-col lg:flex-row gap-4">
                  {/* Map visualization */}
                  <div className="flex-grow h-[300px] lg:h-auto rounded-lg overflow-hidden relative">
                    {selectedConnection.location ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-lg p-6">
                        <div className="text-2xl text-primary mb-4">
                          <MapPin className="h-10 w-10 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-center mb-2">
                          {selectedConnection.location.address}
                        </h3>
                        <p className="text-sm text-muted-foreground text-center">
                          Coordinates: {selectedConnection.location.lat.toFixed(4)}, {selectedConnection.location.lng.toFixed(4)}
                        </p>
                        <div className="mt-4">
                          <Button variant="outline" size="sm">
                            Open in Maps
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                        <p className="text-muted-foreground">No location information available</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Details panel */}
                  <div className="w-full lg:w-[350px] flex flex-col border-t lg:border-l lg:border-t-0 border-gray-800 lg:pl-4 pt-4 lg:pt-0">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-1">Overlap Strength</h3>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full" 
                          style={{ width: `${selectedConnection.overlapStrength}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedConnection.overlapStrength}% match with your profile
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedConnection.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium mb-1">Related Connections</h3>
                      <div className="space-y-2">
                        {connections
                          .filter(conn => 
                            // Show connections with shared tags
                            conn.id !== selectedConnection.id && 
                            conn.tags.some(tag => selectedConnection.tags.includes(tag))
                          )
                          .slice(0, 3)
                          .map(connection => (
                            <div 
                              key={connection.id}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                              onClick={() => handleConnectionClick(connection)}
                            >
                              <div className="rounded-full p-1 bg-muted">
                                {getConnectionIcon(connection.type)}
                              </div>
                              <div className="flex-grow">
                                <div className="font-medium text-sm">{connection.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">{connection.type}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {connection.overlapStrength}%
                              </Badge>
                            </div>
                          ))}
                          
                          {connections.filter(conn => 
                            conn.id !== selectedConnection.id && 
                            conn.tags.some(tag => selectedConnection.tags.includes(tag))
                          ).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No related connections found
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a connection</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Choose a connection from the left panel to view details and location information
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
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