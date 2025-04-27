import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Search, 
  ArrowLeft, 
  Heart, 
  BarChart, 
  MessageCircle, 
  Clock, 
  ThumbsUp, 
  Check, 
  X, 
  Filter 
} from 'lucide-react';
// Ensure i18n is initialized
import '../../../lib/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

// Simplified user type
type SimpleUser = {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  interests: string[];
  bio: string;
  location: string;
  occupation: string;
  compatibilityScore: number;
};

export function EnhancedEngagePersona() {
  // Wrap useTranslation in a try-catch to handle cases where the i18n context isn't available
  const { t = (key: string) => key } = useTranslation ? useTranslation() : { t: (key: string) => key };
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [mounted, setMounted] = useState(false);
  
  // Use effect to handle DOM mounting safely
  useEffect(() => {
    setMounted(true);
    
    // Safe DOM manipulation only after component is mounted
    const container = document.getElementById('engage-persona-container');
    if (container) {
      // Any DOM manipulations that were causing the appendChild error would go here
    }
    
    return () => {
      setMounted(false);
    };
  }, []);
  
  // Fetch suggested users (normally from API)
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ['/api/users/suggestions'],
    // Simulate API data for now since we're enhancing the UI
    queryFn: async () => {
      return {
        users: [
          { 
            id: 1, 
            username: 'johndoe', 
            displayName: 'John Doe', 
            avatar: '/images/avatars/avatar-1.jpg',
            interests: ['Technology', 'Travel', 'Photography', 'Hiking'],
            bio: 'Software developer and outdoor enthusiast',
            location: 'San Francisco',
            occupation: 'Software Engineer',
            compatibilityScore: 87
          },
          { 
            id: 2, 
            username: 'janedoe', 
            displayName: 'Jane Smith', 
            avatar: '/images/avatars/avatar-2.jpg',
            interests: ['Art', 'Music', 'Travel', 'Cooking'],
            bio: 'Artist and foodie exploring the world',
            location: 'New York',
            occupation: 'Graphic Designer',
            compatibilityScore: 75
          },
          { 
            id: 3, 
            username: 'mikeross', 
            displayName: 'Mike Ross', 
            avatar: '/images/avatars/avatar-3.jpg',
            interests: ['Photography', 'Technology', 'Movies', 'Books'],
            bio: 'Photographer and tech enthusiast',
            location: 'Chicago',
            occupation: 'Photographer',
            compatibilityScore: 83
          }
        ]
      };
    }
  });

  // Filter suggested users based on search term
  const filteredUsers = suggestedUsers?.users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Don't render anything if not mounted to prevent DOM errors
  if (!mounted) {
    return (
      <div className="container py-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading persona view...</p>
      </div>
    );
  }

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
            <User className="h-3 w-3 mr-1" />
            Personal Mode
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription>
                This is how others see you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
                  ) : (
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-semibold">{user?.displayName || user?.username}</h3>
                <span className="text-muted-foreground text-sm">{user?.occupation || 'No occupation set'}</span>
                <span className="text-muted-foreground text-sm">{user?.location || 'No location set'}</span>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Top Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.preferences?.interests && user.preferences.interests.length > 0 ? (
                    user.preferences.interests.slice(0, 5).map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary">{interest}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No interests added yet</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-sm text-muted-foreground">
                  {user?.bio || 'No bio added yet. Add a bio to help others understand you better.'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/profile/${user?.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Personal Engagement Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p>Add more interests to improve your matches</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p>Complete your profile with a bio and occupation</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <p>Explore people with similar and diverse interests</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Find People</CardTitle>
                <Button size="icon" variant="ghost">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, interest, or location..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="pb-1">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="suggestions" className="flex-1">Suggestions</TabsTrigger>
                  <TabsTrigger value="nearby" className="flex-1">Nearby</TabsTrigger>
                  <TabsTrigger value="interests" className="flex-1">By Interest</TabsTrigger>
                </TabsList>
                
                <TabsContent value="suggestions" className="mt-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <div className="space-y-4">
                      {filteredUsers.map((suggestedUser) => (
                        <UserCard key={suggestedUser.id} user={suggestedUser} />
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
                
                <TabsContent value="nearby" className="mt-4">
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Coming Soon</h3>
                    <p className="text-muted-foreground">Nearby people matching will be available soon</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="interests" className="mt-4">
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Coming Soon</h3>
                    <p className="text-muted-foreground">Interest-based matching will be available soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// User Card Component
function UserCard({ user }: { user: SimpleUser }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex bg-muted/30">
        <div className="p-4 flex items-start space-x-4 flex-grow">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h4 className="font-medium">{user.displayName}</h4>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> {user.occupation || 'No occupation'} • {user.location || 'No location'}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {user.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs">{interest}</Badge>
              ))}
              {user.interests.length > 3 && (
                <Badge variant="outline" className="text-xs">+{user.interests.length - 3} more</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center bg-muted/10 border-l">
          <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-1">
            <span className="font-bold text-primary">{user.compatibilityScore}%</span>
          </div>
          <span className="text-xs text-muted-foreground">Compatibility</span>
        </div>
      </div>
      
      <CardFooter className="flex justify-between p-3 bg-card">
        <Link href={`/analyze/persona/${user.id}`}>
          <Button variant="ghost" size="sm">
            <BarChart className="h-4 w-4 mr-1" /> Analyze Overlap
          </Button>
        </Link>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default EnhancedEngagePersona;