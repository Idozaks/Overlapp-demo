import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, User, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface SyntheticUser {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  interests?: string[];
  occupation?: string;
  location?: string;
  age?: number;
}

export function SyntheticUsersList() {
  const [, setLocation] = useLocation();

  // Fetch list of synthetic users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await axios.get('/api/users', {
        params: { synthetic: true, limit: 10 }
      });
      console.log("Synthetic users API response:", response.data);
      return response.data;
    },
  });
  
  // Extract users array from the response structure
  const users = usersData?.users || [];

  const handleChatClick = (userId: number) => {
    console.log("Navigating to synthetic chat with user ID:", userId);
    setLocation(`/chat/synthetic/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading synthetic users...</p>
      </div>
    );
  }

  if (error || !users) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-4">Failed to load synthetic users</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No synthetic users available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.displayName || user.username} />
                ) : (
                  <AvatarFallback>{(user.displayName || user.username).charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-base">{user.displayName || user.username}</CardTitle>
                {user.occupation && (
                  <CardDescription className="text-xs">{user.occupation}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2">
            {user.location && (
              <div className="text-xs text-muted-foreground">
                📍 {user.location}
                {user.age && <span className="ml-2">• {user.age} yrs</span>}
              </div>
            )}
            
            {user.bio && (
              <p className="text-sm line-clamp-2">{user.bio}</p>
            )}
            
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {user.interests.slice(0, 4).map((interest, idx) => (
                  <Badge variant="secondary" key={idx} className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.interests.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => handleChatClick(user.id)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}