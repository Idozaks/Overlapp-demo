import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2 } from "lucide-react";
import PostList from "@/components/social/PostList";
import ProfileEdit from "@/components/profile/ProfileEdit";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Profile() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // For demo purposes, using a hardcoded currentUserId
  const currentUserId = 1;

  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isNaN(userId)
  });

  const { data: posts, isLoading: loadingPosts } = useQuery<{ posts: PostWithUser[] }>({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: !!userId && !isNaN(userId)
  });

  const { data: followers } = useQuery<{ followers: User[] }>({
    queryKey: [`/api/users/${userId}/followers`],
    enabled: !!userId && !isNaN(userId)
  });

  const { data: following } = useQuery<{ following: User[] }>({
    queryKey: [`/api/users/${userId}/following`],
    enabled: !!userId && !isNaN(userId)
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/users/${userId}/follow`, {
        method: 'POST',
        body: JSON.stringify({ followerId: currentUserId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/followers`] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/users/${userId}/follow`, {
        method: 'DELETE',
        body: JSON.stringify({ followerId: currentUserId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/followers`] });
    },
  });

  // Handle invalid ID
  if (!userId || isNaN(userId)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Invalid user ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loadingUser || loadingPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFollowing = followers?.followers?.some(follower => follower.id === currentUserId);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync();
    } else {
      await followMutation.mutateAsync();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback>{user.user.displayName?.[0] || "U"}</AvatarFallback>
                {user.user.avatar && (
                  <AvatarImage src={user.user.avatar} alt={user.user.displayName || "User"} />
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      {user.user.displayName || "Anonymous"}
                    </h1>
                    {user.user.bio && (
                      <p className="text-muted-foreground mb-4">{user.user.bio}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {userId === currentUserId ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={followMutation.isPending || unfollowMutation.isPending}
                        variant={isFollowing ? "outline" : "default"}
                      >
                        {followMutation.isPending || unfollowMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          isFollowing ? "Unfollow" : "Follow"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{followers?.followers?.length || 0}</span> followers
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{following?.following?.length || 0}</span> following
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Posts</h2>
          <PostList posts={posts?.posts || []} />
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <ProfileEdit 
              user={user.user} 
              onSuccess={() => setIsEditing(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}