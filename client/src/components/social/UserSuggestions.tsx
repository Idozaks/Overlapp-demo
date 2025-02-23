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

  // For demo purposes, using a hardcoded currentUserId
  const currentUserId = 1;

  // Constants for query keys to ensure consistency
  const USERS_QUERY_KEY = ["/api/users", { currentUserId }];
  const FEED_QUERY_KEY = ["/api/feed"];

  const { data, isLoading } = useQuery<{ users: (User & { isFollowing?: boolean })[] }>({
    queryKey: USERS_QUERY_KEY,
  });

  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await apiRequest(`/api/users/${userId}/follow`, {
          method: 'POST',
          body: { followerId: currentUserId },
        });

        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData.message || 'Failed to follow user');
        }

        return await response.json();
      } catch (error) {
        console.error('Follow request error:', error);
        throw error;
      }
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });
      const previousUsers = queryClient.getQueryData(USERS_QUERY_KEY);

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
      queryClient.setQueryData(USERS_QUERY_KEY, context?.previousUsers);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to follow user",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully followed user",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await apiRequest(`/api/users/${userId}/follow`, {
          method: 'DELETE',
          body: { followerId: currentUserId },
        });

        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData.message || 'Failed to unfollow user');
        }

        return await response.json();
      } catch (error) {
        console.error('Unfollow request error:', error);
        throw error;
      }
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });
      const previousUsers = queryClient.getQueryData(USERS_QUERY_KEY);

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
      queryClient.setQueryData(USERS_QUERY_KEY, context?.previousUsers);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to unfollow user",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully unfollowed user",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(userId);
      } else {
        await followMutation.mutateAsync(userId);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

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
              <h4 
                className="font-medium hover:underline cursor-pointer" 
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                {user.displayName || "Anonymous"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {user.bio?.slice(0, 30)}
                {user.bio && user.bio.length > 30 && "..."}
              </p>
            </div>
          </div>
          {user.id === currentUserId ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProfile}
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
      ))}
    </div>
  );
}