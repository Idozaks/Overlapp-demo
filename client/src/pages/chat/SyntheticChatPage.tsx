import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, User, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SyntheticChat } from "@/components/chat/SyntheticChat";
import axios from "axios";

interface User {
  id: number;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  occupation?: string;
  location?: string;
  age?: number;
  interests?: string[];
}

export function SyntheticChatPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/chat/:id");
  const userId = params?.id ? parseInt(params.id) : 0;

  // Fetch user details
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data as User;
    },
  });

  const getWelcomeMessage = (user?: User) => {
    if (!user) return "Hello! I'm a synthetic user. How can I help you today?";
    
    return `Hi there! I'm ${user.displayName || user.username}${user.occupation ? `, a ${user.occupation}` : ''}${user.location ? ` from ${user.location}` : ''}. How's your day going?`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading synthetic user profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <User className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The synthetic user you're looking for couldn't be found or is unavailable.
        </p>
        <Button onClick={() => setLocation('/chat/synthetic')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Synthetic Users
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <div className="border-b p-3 flex items-center justify-between bg-card">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/chat/synthetic')}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-10 w-10 mr-3">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.displayName} />
            ) : (
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          
          <div>
            <div className="flex items-center">
              <h1 className="font-medium">{user.displayName || user.username}</h1>
              <Badge variant="outline" className="ml-2 text-xs">
                <Bot className="h-3 w-3 mr-1" />
                Synthetic
              </Badge>
            </div>
            
            {user.occupation && (
              <p className="text-xs text-muted-foreground">
                {user.occupation}
                {user.location && ` • ${user.location}`}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* User bio banner */}
      {user.bio && (
        <div className="bg-muted/50 p-3 text-sm border-b max-w-full overflow-hidden">
          <p className="text-muted-foreground line-clamp-2">{user.bio}</p>
        </div>
      )}
      
      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <SyntheticChat 
          userId={user.id} 
          userName={user.displayName || user.username}
          userAvatar={user.avatar}
          initialMessage={getWelcomeMessage(user)}
        />
      </div>
    </div>
  );
}