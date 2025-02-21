import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function UserSuggestions() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
  });

  // For demo purposes, using a hardcoded currentUserId
  const currentUserId = 1;

  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest(`/api/users/${userId}/follow`, {
        method: 'POST',
        body: JSON.stringify({ followerId: currentUserId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest(`/api/users/${userId}/follow`, {
        method: 'DELETE',
        body: JSON.stringify({ followerId: currentUserId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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
    if (isFollowing) {
      await unfollowMutation.mutateAsync(userId);
    } else {
      await followMutation.mutateAsync(userId);
    }
  };

  return (
    <div className="space-y-4">
      {data.users.map((user) => (
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
            onClick={() => handleFollow(user.id, false)}
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            {followMutation.isPending || unfollowMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Follow"
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}