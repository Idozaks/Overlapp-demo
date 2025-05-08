import { FC, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPinIcon, UserIcon, TagIcon, RefreshCw } from "lucide-react";

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

const PersonNearby: FC = () => {
  const [radius, setRadius] = useState<number>(10);
  const [location, setLocation] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get nearby users
  const { data: nearbyUsers, isLoading, refetch } = useQuery<{users: NearbyUser[]}>({
    queryKey: ['/api/users/nearby', radius, userLocation],
    enabled: !!userLocation,
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
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonNearby;