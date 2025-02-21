import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import type { User } from "@shared/schema";

export default function ExploreUsers() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
  });

  const filteredUsers = data?.users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Explore Users</h1>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                        {user.avatar && (
                          <AvatarImage src={user.avatar} alt={user.displayName || "User"} />
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h3 
                          className="text-lg font-semibold hover:underline cursor-pointer"
                          onClick={() => navigate(`/profile/${user.id}`)}
                        >
                          {user.displayName || "Anonymous"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {user.bio || "No bio yet"}
                        </p>
                        {user.preferences?.interests && user.preferences.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {user.preferences.interests.map((interest, i) => (
                              <span 
                                key={i}
                                className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
