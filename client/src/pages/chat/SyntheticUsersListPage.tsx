import React from "react";
import { SyntheticUsersList } from "@/components/chat/SyntheticUsersList";
import { MessageSquareText, Bot, User } from "lucide-react";

export function SyntheticUsersListPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-center mb-6 text-center">
        <Bot className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Chat with Synthetic Users</h1>
      </div>
      
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-muted rounded-lg p-4 text-sm">
          <div className="flex items-center mb-2">
            <MessageSquareText className="h-4 w-4 mr-2 text-primary" />
            <h2 className="font-medium">How it works</h2>
          </div>
          <p className="ml-6 text-muted-foreground">
            Chat with AI-powered synthetic users who respond based on their digital identities.
            Each user has their own background, interests, and personality that informs their responses.
          </p>
          <div className="flex items-center mt-3 mb-2">
            <User className="h-4 w-4 mr-2 text-primary" />
            <h2 className="font-medium">Available Synthetic Users</h2>
          </div>
        </div>
      </div>
      
      <SyntheticUsersList />
    </div>
  );
}