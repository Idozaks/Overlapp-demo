import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  RefreshCw, 
  BarChart, 
  Calendar, 
  ArrowUpRight, 
  Store, 
  Utensils, 
  School, 
  Home, 
  Building2, 
  Coffee, 
  ParkingSquare, 
  Map,
  Filter,
  Music
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

// Simplified physical location type
type PhysicalLocation = {
  id: number;
  name: string;
  icon: string;
  category: string;
  description: string;
  address: string;
  distance: string;
  compatibilityScore: number;
  tags: string[];
  openHours: string;
};

export function EnhancedEngageOffline() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('nearby');
  const [distanceRange, setDistanceRange] = useState([10]);
  
  // Fetch physical locations (normally from API)
  const { data: physicalLocations, isLoading } = useQuery({
    queryKey: ['/api/locations/physical'],
    // Simulate API data for now since we're enhancing the UI
    queryFn: async () => {
      return {
        locations: [
          { 
            id: 1, 
            name: 'Urban Co-Working Space', 
            icon: 'Building2',
            category: 'Workspace',
            description: 'Modern co-working space for professionals and creatives',
            address: '123 Main Street, Downtown',
            distance: '0.8 miles away',
            compatibilityScore: 91,
            tags: ['Co-Working', 'Networking', 'Professional', 'WiFi'],
            openHours: 'Open now • 8AM - 9PM'
          },
          { 
            id: 2, 
            name: 'Central Park Community Garden', 
            icon: 'ParkingSquare',
            category: 'Outdoor',
            description: 'Community garden with workshops and events',
            address: '45 Park Avenue',
            distance: '1.2 miles away',
            compatibilityScore: 76,
            tags: ['Gardening', 'Community', 'Outdoors', 'Sustainable'],
            openHours: 'Open now • 7AM - Sunset'
          },
          { 
            id: 3, 
            name: 'Artisan Coffee House', 
            icon: 'Coffee',
            category: 'Café',
            description: 'Specialty coffee shop with live music and art displays',
            address: '78 Arts District',
            distance: '0.5 miles away',
            compatibilityScore: 88,
            tags: ['Coffee', 'Arts', 'Music', 'Social'],
            openHours: 'Open now • 6AM - 10PM'
          },
          { 
            id: 4, 
            name: 'University Innovation Lab', 
            icon: 'School',
            category: 'Education',
            description: 'Public innovation lab hosting workshops and talks',
            address: 'University Campus, Building C',
            distance: '2.1 miles away',
            compatibilityScore: 83,
            tags: ['Innovation', 'Technology', 'Learning', 'Workshops'],
            openHours: 'Closed • Opens 9AM tomorrow'
          },
          { 
            id: 5, 
            name: 'Global Cuisine Market', 
            icon: 'Utensils',
            category: 'Food',
            description: 'International food market with cooking classes',
            address: '156 Market Square',
            distance: '1.5 miles away',
            compatibilityScore: 79,
            tags: ['Food', 'Cooking', 'International', 'Market'],
            openHours: 'Open now • 10AM - 8PM'
          }
        ]
      };
    }
  });

  // Filter physical locations based on search term, active tab, and distance range
  const filteredLocations = physicalLocations?.locations.filter(location => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Simple distance filter (in a real app this would use actual distance)
    const distanceInMiles = parseFloat(location.distance.split(' ')[0]);
    if (distanceInMiles > distanceRange[0]) return false;
    
    if (activeTab === 'nearby') return true;
    if (activeTab === 'food' && ['Food', 'Café', 'Restaurant'].includes(location.category)) return true;
    if (activeTab === 'workspace' && ['Workspace', 'Library', 'Office'].includes(location.category)) return true;
    if (activeTab === 'events' && location.tags.some(tag => ['Events', 'Workshops', 'Classes'].includes(tag))) return true;
    
    return false;
  }) || [];

  // Get the icon component based on the location's icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="h-5 w-5" />;
      case 'ParkingSquare': return <ParkingSquare className="h-5 w-5" />;
      case 'Coffee': return <Coffee className="h-5 w-5" />;
      case 'School': return <School className="h-5 w-5" />;
      case 'Utensils': return <Utensils className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link href="/engage">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Engage
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <MapPin className="h-3 w-3 mr-1" />
            Physical Mode
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Physical Locations
              </CardTitle>
              <CardDescription>
                Find places that match your identity and interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Map className="h-12 w-12 mx-auto mb-3 text-primary/70" />
                <h3 className="text-lg font-medium">Location Matching</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover physical places aligned with your preferences
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Distance Filter</h4>
                <div className="space-y-5">
                  <Slider
                    value={distanceRange}
                    onValueChange={setDistanceRange}
                    max={25}
                    step={1}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Range</span>
                    <Badge variant="outline">{distanceRange[0]} miles</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Top Categories</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Coffee className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Cafés & Restaurants</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Co-Working Spaces</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Event Venues</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Nearby Places
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Physical Engagement Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p>Visit places that align with your interests to expand your network</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p>Check compatibility scores to find the most relevant locations</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p>Adjust the distance range to discover more places</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Places Near You</CardTitle>
                <Button size="icon" variant="ghost">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for places..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="pb-1">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="nearby" className="flex-1">Nearby</TabsTrigger>
                  <TabsTrigger value="food" className="flex-1">Food & Drink</TabsTrigger>
                  <TabsTrigger value="workspace" className="flex-1">Workspaces</TabsTrigger>
                  <TabsTrigger value="events" className="flex-1">Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : filteredLocations.length > 0 ? (
                    <div className="space-y-4">
                      {filteredLocations.map((location) => (
                        <PhysicalLocationCard 
                          key={location.id} 
                          location={location} 
                          getIconComponent={getIconComponent}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No places found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or increasing the distance range</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events Near You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-3 rounded">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">Tech Meetup: AI & Machine Learning</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Tomorrow, 6:30 PM</span>
                      <span>•</span>
                      <span>Urban Co-Working Space</span>
                    </div>
                  </div>
                  <Badge className="ml-auto">92% Match</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-3 rounded">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">Live Jazz Night</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Friday, 8:00 PM</span>
                      <span>•</span>
                      <span>Artisan Coffee House</span>
                    </div>
                  </div>
                  <Badge className="ml-auto">85% Match</Badge>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-3 rounded">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">International Cooking Workshop</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Saturday, 2:00 PM</span>
                      <span>•</span>
                      <span>Global Cuisine Market</span>
                    </div>
                  </div>
                  <Badge className="ml-auto">79% Match</Badge>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Physical Location Card Component
function PhysicalLocationCard({ 
  location, 
  getIconComponent 
}: { 
  location: PhysicalLocation, 
  getIconComponent: (iconName: string) => React.ReactNode 
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="p-4 flex items-start space-x-4 flex-grow">
          <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
            {getIconComponent(location.icon)}
          </div>
          
          <div className="space-y-1">
            <h4 className="font-medium">{location.name}</h4>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">{location.category}</Badge>
              <span className="text-xs">• {location.distance}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">{location.description}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {location.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {location.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">+{location.tags.length - 3} more</Badge>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground mt-2">
              <MapPin className="h-3 w-3 inline mr-1" />
              {location.address}
            </div>
            
            <div className="text-xs text-green-500 mt-1">
              {location.openHours}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center bg-muted/10 border-l">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-1">
            <span className="font-bold text-primary">{location.compatibilityScore}%</span>
          </div>
          <span className="text-xs text-muted-foreground">Compatibility</span>
        </div>
      </div>
      
      <CardFooter className="flex justify-between p-3 bg-card">
        <Button variant="ghost" size="sm">
          <BarChart className="h-4 w-4 mr-1" /> Analyze Overlap
        </Button>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Map className="h-4 w-4 mr-1" /> Directions
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Calendar className="h-4 w-4 mr-1" /> Events
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default EnhancedEngageOffline;