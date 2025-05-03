import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SyntheticChat } from "@/components/chat/SyntheticChat";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

interface User {
  id: number;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
}

export function SyntheticChatPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const userId = parseInt(params.id);

  // Fetch user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data as User;
    },
    enabled: !isNaN(userId),
  });

  const getWelcomeMessage = (user?: User) => {
    if (!user) return "Hello! I'm looking forward to chatting with you.";
    
    return `Hi there! I'm ${user.displayName || user.username}. ${
      user.bio ? user.bio.split('.')[0] + '.' : "Nice to meet you!"
    } How can I help you today?`;
  };

  if (isNaN(userId)) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Invalid user ID. Please select a valid user.</p>
            <Button 
              variant="outline" 
              className="mt-4 mx-auto block"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto mt-8 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading user profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto mt-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">
              {error ? "Error loading user data. Please try again." : "User not found."}
            </p>
            <Button 
              variant="outline" 
              className="mt-4 mx-auto block"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          className="p-2"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Chat with {user.displayName || user.username}</h1>
      </div>
      
      <div className="max-w-md mx-auto">
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