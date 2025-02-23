import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UserSuggestions() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  //  This should be fetched from authentication or context
  const currentUserId = 1; //  REPLACE THIS WITH PROPER AUTHENTICATION

  const { data, isLoading } = useQuery<{ users: (User & { isFollowing?: boolean })[] }>({
    queryKey: [`/api/users?currentUserId=${currentUserId}`],
  });

  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(`/api/users/${userId}/follow`, {
        method: 'POST',
        body: { followerId: currentUserId, followingId: userId }, // Added followingId
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to follow user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users?currentUserId=${currentUserId}`] });
      toast({
        title: "Success",
        description: "Successfully followed user",
      });
    },
    onError: (error) => {
      console.error('Follow error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to follow user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(`/api/users/${userId}/follow`, {
        method: 'DELETE',
        body: { followerId: currentUserId, followingId: userId }, // Added followingId
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unfollow user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users?currentUserId=${currentUserId}`] });
      toast({
        title: "Success",
        description: "Successfully unfollowed user",
      });
    },
    onError: (error) => {
      console.error('Unfollow error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!data?.users?.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No users found
      </div>
    );
  }

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(userId);
      } else {
        await followMutation.mutateAsync(userId);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = data.users.filter(user => user.id !== currentUserId);

  return (
    <div className="space-y-4">
      {filteredUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
              <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={user.displayName || "User"} />
              )}
            </Avatar>
            <div>
              <h4 className="font-medium hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                {user.displayName || "Anonymous"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {user.bio?.slice(0, 30)}
                {user.bio && user.bio.length > 30 && "..."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFollow(user.id, user.isFollowing || false)}
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            {followMutation.isPending || unfollowMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              user.isFollowing ? "Unfollow" : "Follow"
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}