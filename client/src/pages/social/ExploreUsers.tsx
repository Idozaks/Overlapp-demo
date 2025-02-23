import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ExploreUsers() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // For demo purposes, using a hardcoded currentUserId
  const currentUserId = 1;

  // Constants for query keys
  const USERS_QUERY_KEY = ["/api/users", { currentUserId }];
  const FEED_QUERY_KEY = ["/api/feed"];

  const { data, isLoading } = useQuery<{ users: (User & { isFollowing?: boolean })[] }>({
    queryKey: USERS_QUERY_KEY,
  });

  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log('Attempting to follow user:', userId);
      try {
        const response = await apiRequest(`/api/users/${userId}/follow`, {
          method: 'POST',
          body: { followerId: currentUserId },
        });

        console.log('Follow response status:', response.status);
        const responseData = await response.json();
        console.log('Follow response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to follow user');
        }

        return responseData;
      } catch (error) {
        console.error('Follow request error:', error);
        throw error;
      }
    },
    onMutate: async (userId) => {
      console.log('Starting optimistic update for follow:', userId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(USERS_QUERY_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData<{ users: (User & { isFollowing?: boolean })[] }>(
        USERS_QUERY_KEY,
        (old) => {
          if (!old) return { users: [] };
          return {
            users: old.users.map(user =>
              user.id === userId ? { ...user, isFollowing: true } : user
            )
          };
        }
      );

      return { previousUsers };
    },
    onError: (err, userId, context) => {
      console.error('Follow mutation error:', err);

      // Revert the optimistic update
      queryClient.setQueryData(USERS_QUERY_KEY, context?.previousUsers);

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to follow user",
        variant: "destructive",
      });
    },
    onSuccess: (data, userId) => {
      console.log('Follow mutation succeeded:', { data, userId });
      toast({
        title: "Success",
        description: "Successfully followed user",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      console.log('Attempting to unfollow user:', userId);
      try {
        const response = await apiRequest(`/api/users/${userId}/follow`, {
          method: 'DELETE',
          body: { followerId: currentUserId },
        });

        console.log('Unfollow response status:', response.status);
        const responseData = await response.json();
        console.log('Unfollow response data:', responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to unfollow user');
        }

        return responseData;
      } catch (error) {
        console.error('Unfollow request error:', error);
        throw error;
      }
    },
    onMutate: async (userId) => {
      console.log('Starting optimistic update for unfollow:', userId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(USERS_QUERY_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData<{ users: (User & { isFollowing?: boolean })[] }>(
        USERS_QUERY_KEY,
        (old) => {
          if (!old) return { users: [] };
          return {
            users: old.users.map(user =>
              user.id === userId ? { ...user, isFollowing: false } : user
            )
          };
        }
      );

      return { previousUsers };
    },
    onError: (err, userId, context) => {
      console.error('Unfollow mutation error:', err);

      // Revert the optimistic update
      queryClient.setQueryData(USERS_QUERY_KEY, context?.previousUsers);

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to unfollow user",
        variant: "destructive",
      });
    },
    onSuccess: (data, userId) => {
      console.log('Unfollow mutation succeeded:', { data, userId });
      toast({
        title: "Success",
        description: "Successfully unfollowed user",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      console.log(`Handling ${isFollowing ? 'unfollow' : 'follow'} for user:`, userId);
      if (isFollowing) {
        await unfollowMutation.mutateAsync(userId);
      } else {
        await followMutation.mutateAsync(userId);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };

  const filteredUsers = data?.users.filter(user => 
    searchQuery === "" || 
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
                      <Avatar className="h-16 w-16 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
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
                      {user.id === currentUserId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/profile/${currentUserId}/edit`)}
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <Button
                          variant={user.isFollowing ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollow(user.id, user.isFollowing || false)}
                          disabled={
                            (followMutation.isPending && followMutation.variables === user.id) ||
                            (unfollowMutation.isPending && unfollowMutation.variables === user.id)
                          }
                        >
                          {((followMutation.isPending && followMutation.variables === user.id) ||
                            (unfollowMutation.isPending && unfollowMutation.variables === user.id)) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            user.isFollowing ? "Unfollow" : "Follow"
                          )}
                        </Button>
                      )}
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