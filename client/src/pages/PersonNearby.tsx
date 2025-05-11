import { FC, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GptButton } from "@/components/ui/gpt-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPinIcon, 
  UserIcon, 
  TagIcon, 
  RefreshCw, 
  SparklesIcon, 
  Loader2, 
  MessageCircleIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type NearbyUser = {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  interests: string[];
  location?: string;
  distance?: number;
}

// Connection analysis result type
interface ConnectionAnalysis {
  compatibilityScore: number;
  compatibilityReasoning: string;
  conversationStarters: string[];
  sharedInterests: Array<string | { interest: string; explanation?: string }>;
  complementaryDifferences: Array<string | { interest: string; explanation?: string }>;
  recommendedActivities: Array<string | { activity: string; reason?: string }>;
}

const PersonNearby: FC = () => {
  const [radius, setRadius] = useState<number>(10);
  const [location, setLocation] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [connectionAnalysis, setConnectionAnalysis] = useState<ConnectionAnalysis | null>(null);
  const { toast } = useToast();
  
  // Get user data from localStorage if available
  const getUserDataFromStorage = () => {
    try {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        const userData = JSON.parse(storedData);
        console.log("Found user data in localStorage:", userData);
        
        // Combine both selected interests and enriched interests
        const allInterests = [
          ...(userData.interests || []).map((id: number) => {
            // If it's MVP mode, we have a global list of INTERESTS
            const INTERESTS = [
              "Music", "Art & Design", "Travel", "Food & Dining", "Fashion",
              "Technology", "Books", "Movies", "Gaming", "Sports & Fitness",
              "Photography", "Dancing", "Podcasts", "Hiking", "Cooking", 
              "Pets", "Yoga", "Writing", "Programming", "Painting"
            ];
            return INTERESTS[id] || `Interest ${id}`;
          }),
          ...(userData.enrichedInterests || [])
        ];
        
        return {
          id: 0,
          username: userData.name?.toLowerCase().replace(/\s+/g, '_') || "current_user",
          displayName: userData.name || "Current User",
          bio: userData.bio || "App user interested in exploring connections.",
          interests: allInterests.filter(Boolean)
        };
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
    
    // Fallback data if nothing in localStorage
    return {
      id: 0,
      username: "current_user",
      displayName: "Current User",
      bio: "Tech enthusiast and outdoor adventurer. Love discovering new apps and hiking trails.",
      interests: ["Technology", "Hiking", "Photography", "Coffee", "Reading"]
    };
  };
  
  // Get current user data either from localStorage or fallback
  const currentUser = getUserDataFromStorage();

  // Get nearby users
  const { data: nearbyUsers, isLoading, refetch } = useQuery<{users: NearbyUser[]}>({
    queryKey: userLocation 
      ? [`/api/users/nearby/${radius}`, `?lat=${userLocation.lat}&lng=${userLocation.lng}`]
      : ['/api/users/nearby', radius],
    enabled: !!userLocation,
  });
  
  // Mutation for connection analysis
  const analyzeConnection = useMutation({
    mutationFn: async (targetUser: NearbyUser) => {
      try {
        console.log("Sending connection analysis request with data:", {
          userInterests: currentUser.interests,
          targetInterests: targetUser.interests
        });
        
        const response = await apiRequest('/api/connections/analyze', {
          method: 'POST',
          body: {
            userInterests: currentUser.interests,
            targetInterests: targetUser.interests,
            userBio: currentUser.bio,
            targetBio: targetUser.bio || ''
          }
        });
        
        console.log("Connection analysis response:", response);
        return response as unknown as ConnectionAnalysis;
      } catch (error) {
        console.error("Connection analysis error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setConnectionAnalysis(data);
      setAnalysisOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Connection analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze connection potential",
        variant: "destructive"
      });
    }
  });

  // Simulate getting current location
  useEffect(() => {
    const getUserLocation = () => {
      // For demo purposes, simulate a location (New York City coordinates)
      const demoLocation = { lat: 40.7128, lng: -74.0060 };
      setUserLocation(demoLocation);
      setLocation("New York City");
    };
    
    getUserLocation();
  }, []);

  // Simulated nearby users data
  const mockNearbyUsers: NearbyUser[] = [
    {
      id: 1,
      username: "traveler_jane",
      displayName: "Jane Traveler",
      bio: "Travel enthusiast and photographer exploring the world one city at a time.",
      interests: ["Photography", "Travel", "Hiking", "Food"],
      location: "Manhattan, NY",
      distance: 0.5
    },
    {
      id: 2,
      username: "tech_sam",
      displayName: "Sam Johnson",
      bio: "Full-stack developer passionate about new technologies and startups.",
      interests: ["Programming", "AI", "Startups", "Coffee"],
      location: "Brooklyn, NY",
      distance: 2.3
    },
    {
      id: 3,
      username: "fitness_mike",
      displayName: "Mike Fit",
      bio: "Fitness trainer helping people achieve their health goals.",
      interests: ["Fitness", "Nutrition", "Running", "Yoga"],
      location: "Queens, NY",
      distance: 4.8
    },
    {
      id: 4,
      username: "artist_elena",
      displayName: "Elena Artis",
      bio: "Visual artist specializing in digital and mixed media art.",
      interests: ["Art", "Design", "Museums", "Drawing"],
      location: "Soho, NY",
      distance: 1.2
    },
    {
      id: 5,
      username: "musiclover_dave",
      displayName: "Dave Melody",
      bio: "Music producer and vinyl collector. Always looking for new sounds.",
      interests: ["Music", "Vinyl", "Concerts", "Production"],
      location: "East Village, NY",
      distance: 0.8
    }
  ];

  // For demo purposes, use the mock data
  const displayedUsers = nearbyUsers?.users || mockNearbyUsers;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Find People Nearby</h1>
        <p className="text-muted-foreground mb-6">
          Discover people near your location with similar interests
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
              <MapPinIcon className="w-5 h-5 text-primary" />
              <span>{location || "Detecting location..."}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Radius:</span>
            <Input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value) || 1)}
              className="w-20"
              min={1}
              max={100}
            />
            <span className="text-sm">miles</span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              className="ml-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.profileImageUrl} alt={user.displayName || user.username} />
                      <AvatarFallback>
                        {(user.displayName || user.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium">{user.displayName || user.username}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        <span>{user.location}</span>
                        <span className="mx-1">•</span>
                        <span>{user.distance} miles away</span>
                      </div>
                    </div>
                  </div>
                  
                  {user.bio && <p className="text-sm mb-4">{user.bio}</p>}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button size="sm" variant="outline">View Profile</Button>
                    <GptButton 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        analyzeConnection.mutate(user);
                      }}
                      isLoading={analyzeConnection.isPending && selectedUser?.id === user.id}
                      loadingText="Analyzing..."
                      className="gap-2"
                    >
                      <SparklesIcon className="w-4 h-4" /> 
                      Analyze Overlap
                    </GptButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Connection Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              Connection Analysis
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <span>Your potential connection with {selectedUser.displayName || selectedUser.username}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {connectionAnalysis && (
            <div className="space-y-4 my-2 overflow-y-auto pr-2 flex-grow">
              {/* Compatibility Score */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Compatibility Score</span>
                  <Badge 
                    className={
                      (connectionAnalysis.compatibilityScore || 0) >= 80 
                        ? "bg-green-500" 
                        : (connectionAnalysis.compatibilityScore || 0) >= 60 
                        ? "bg-amber-500" 
                        : "bg-red-500"
                    }
                  >
                    {connectionAnalysis.compatibilityScore || 0}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {connectionAnalysis.compatibilityReasoning || "Analysis in progress. Try again in a moment."}
                </p>
              </div>
              
              {/* Conversation Starters */}
              {connectionAnalysis.conversationStarters && connectionAnalysis.conversationStarters.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Conversation Starters</h3>
                  <ul className="space-y-2">
                    {connectionAnalysis.conversationStarters.map((starter, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <MessageCircleIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{starter}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Shared Interests */}
              {connectionAnalysis.sharedInterests && connectionAnalysis.sharedInterests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Shared Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {connectionAnalysis.sharedInterests.map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {typeof interest === 'object' && interest !== null && 'interest' in interest 
                          ? (interest as { interest: string }).interest 
                          : typeof interest === 'string' 
                            ? interest
                            : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Complementary Differences */}
              {connectionAnalysis.complementaryDifferences && connectionAnalysis.complementaryDifferences.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Complementary Differences</h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {connectionAnalysis.complementaryDifferences.map(diff => 
                      typeof diff === 'object' && diff !== null && 'interest' in diff 
                        ? (diff as { interest: string }).interest 
                        : String(diff)
                    ).join(', ')}
                  </p>
                </div>
              )}
              
              {/* Recommended Activities */}
              {connectionAnalysis.recommendedActivities && connectionAnalysis.recommendedActivities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Recommended Activities</h3>
                  <ul className="space-y-1">
                    {connectionAnalysis.recommendedActivities.map((activity, i) => (
                      <li key={i} className="text-sm break-words">• {
                        typeof activity === 'object' && activity !== null && 'activity' in activity 
                          ? (activity as { activity: string }).activity 
                          : String(activity)
                      }</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex-shrink-0 mt-2 pt-2 border-t">
            <Button className="w-full" onClick={() => setAnalysisOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonNearby;