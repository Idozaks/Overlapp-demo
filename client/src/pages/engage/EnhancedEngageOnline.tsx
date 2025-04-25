import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Globe, 
  Search, 
  RefreshCw, 
  BarChart, 
  MessageCircle, 
  ArrowUpRight, 
  Store, 
  Newspaper, 
  Calendar, 
  Gamepad2, 
  BookOpen, 
  HeartHandshake, 
  Compass,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

// Simplified online entity type
type OnlineEntity = {
  id: number;
  name: string;
  icon: string;
  category: string;
  description: string;
  url: string;
  compatibilityScore: number;
  tags: string[];
  lastActive: string;
};

export function EnhancedEngageOnline() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch online entities (normally from API)
  const { data: onlineEntities, isLoading } = useQuery({
    queryKey: ['/api/entities/online'],
    // Simulate API data for now since we're enhancing the UI
    queryFn: async () => {
      return {
        entities: [
          { 
            id: 1, 
            name: 'Tech Innovators Forum', 
            icon: 'Newspaper',
            category: 'Forum',
            description: 'A community for technology enthusiasts and innovators',
            url: 'https://techinnovators.example.com',
            compatibilityScore: 92,
            tags: ['Technology', 'Innovation', 'Programming', 'AI'],
            lastActive: '2 hours ago'
          },
          { 
            id: 2, 
            name: 'Global Bookworms', 
            icon: 'BookOpen',
            category: 'Book Club',
            description: 'Online book club for avid readers around the world',
            url: 'https://globalbookworms.example.com',
            compatibilityScore: 78,
            tags: ['Books', 'Reading', 'Literature', 'Fiction'],
            lastActive: '1 day ago'
          },
          { 
            id: 3, 
            name: 'Creative Arts Collective', 
            icon: 'Palette',
            category: 'Community',
            description: 'Digital space for artists to share and collaborate',
            url: 'https://creativearts.example.com',
            compatibilityScore: 85,
            tags: ['Art', 'Design', 'Creativity', 'Collaboration'],
            lastActive: '3 hours ago'
          },
          { 
            id: 4, 
            name: 'Eco Warriors Network', 
            icon: 'HeartHandshake',
            category: 'Non-profit',
            description: 'Platform dedicated to environmental conservation',
            url: 'https://ecowarriors.example.com',
            compatibilityScore: 67,
            tags: ['Environment', 'Sustainability', 'Climate', 'Activism'],
            lastActive: '5 days ago'
          },
          { 
            id: 5, 
            name: 'Digital Explorers', 
            icon: 'Gamepad2',
            category: 'Gaming',
            description: 'Gaming community focused on exploration and adventure',
            url: 'https://digitalexplorers.example.com',
            compatibilityScore: 73,
            tags: ['Gaming', 'Adventure', 'Virtual Reality', 'Exploration'],
            lastActive: '12 hours ago'
          }
        ]
      };
    }
  });

  // Filter online entities based on search term and active tab
  const filteredEntities = onlineEntities?.entities.filter(entity => {
    const matchesSearch = 
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'communities' && ['Forum', 'Community', 'Book Club'].includes(entity.category)) return true;
    if (activeTab === 'platforms' && ['Platform', 'Gaming', 'Marketplace'].includes(entity.category)) return true;
    if (activeTab === 'organizations' && ['Non-profit', 'Company', 'Institution'].includes(entity.category)) return true;
    
    return false;
  }) || [];

  // Get the icon component based on the entity's icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Newspaper': return <Newspaper className="h-5 w-5" />;
      case 'BookOpen': return <BookOpen className="h-5 w-5" />;
      case 'Palette': return <LayoutGrid className="h-5 w-5" />;
      case 'HeartHandshake': return <HeartHandshake className="h-5 w-5" />;
      case 'Gamepad2': return <Gamepad2 className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
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
            <Globe className="h-3 w-3 mr-1" />
            Online Mode
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Online Engagement
              </CardTitle>
              <CardDescription>
                Discover digital spaces that match your identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Globe className="h-12 w-12 mx-auto mb-3 text-primary/70" />
                <h3 className="text-lg font-medium">Your Digital Footprint</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect with online spaces that align with your interests and values
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Top Categories</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Newspaper className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Forums & Communities</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Store className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Digital Marketplaces</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                    <div className="bg-primary/10 p-1.5 rounded">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Event Platforms</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Activity Stats</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/30 p-3 rounded-md text-center">
                    <span className="text-2xl font-bold">5</span>
                    <p className="text-xs text-muted-foreground">Platforms Matched</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md text-center">
                    <span className="text-2xl font-bold">78%</span>
                    <p className="text-xs text-muted-foreground">Avg. Compatibility</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Suggestions
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Digital Engagement Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p>Explore communities that align with your interests</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p>Check compatibility scores to find the best matches</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowUpRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p>Update your interests to discover new online spaces</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Digital Spaces</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search digital spaces..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="pb-1">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="communities" className="flex-1">Communities</TabsTrigger>
                  <TabsTrigger value="platforms" className="flex-1">Platforms</TabsTrigger>
                  <TabsTrigger value="organizations" className="flex-1">Organizations</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : filteredEntities.length > 0 ? (
                    <div className="space-y-4">
                      {filteredEntities.map((entity) => (
                        <OnlineEntityCard 
                          key={entity.id} 
                          entity={entity} 
                          getIconComponent={getIconComponent}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No matches found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Explore More Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center">
                  <Newspaper className="h-5 w-5 mb-2" />
                  <span className="text-xs">News & Media</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center">
                  <Gamepad2 className="h-5 w-5 mb-2" />
                  <span className="text-xs">Gaming</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center">
                  <BookOpen className="h-5 w-5 mb-2" />
                  <span className="text-xs">Education</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center">
                  <Store className="h-5 w-5 mb-2" />
                  <span className="text-xs">Shopping</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center">
                  <HeartHandshake className="h-5 w-5 mb-2" />
                  <span className="text-xs">Non-Profit</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 flex flex-col items-center justify-center">
                  <LayoutGrid className="h-5 w-5 mb-2" />
                  <span className="text-xs">More</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Online Entity Card Component
function OnlineEntityCard({ 
  entity, 
  getIconComponent 
}: { 
  entity: OnlineEntity, 
  getIconComponent: (iconName: string) => React.ReactNode 
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="p-4 flex items-start space-x-4 flex-grow">
          <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
            {getIconComponent(entity.icon)}
          </div>
          
          <div className="space-y-1">
            <h4 className="font-medium">{entity.name}</h4>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">{entity.category}</Badge>
              <span className="text-xs">• Active {entity.lastActive}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {entity.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {entity.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">+{entity.tags.length - 3} more</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center bg-muted/10 border-l">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-1">
            <span className="font-bold text-primary">{entity.compatibilityScore}%</span>
          </div>
          <span className="text-xs text-muted-foreground">Compatibility</span>
        </div>
      </div>
      
      <CardFooter className="flex justify-between p-3 bg-card">
        <Link href={`/analyze/online/${entity.id}`}>
          <Button variant="ghost" size="sm">
            <BarChart className="h-4 w-4 mr-1" /> Analyze Overlap
          </Button>
        </Link>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowUpRight className="h-4 w-4 mr-1" /> Visit
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default EnhancedEngageOnline;