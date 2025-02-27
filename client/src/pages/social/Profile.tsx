import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, AtSign, Calendar } from "lucide-react";
import { Link } from "wouter";
import PostList from "@/components/social/PostList";
import type { User, PostWithUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ContactCard from "@/components/profile/ContactCard";

export default function Profile() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

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
      if (!currentUser?.id) {
        throw new Error("You must be logged in to follow users.");
      }
      await apiRequest(`/api/users/${userId}/follow`, {
        method: 'POST',
        body: { followerId: currentUser.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/followers`] });
    },
    onError: (error) => {
      console.error("Follow mutation error:", error);
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) {
        throw new Error("You must be logged in to unfollow users.");
      }
      await apiRequest(`/api/users/${userId}/follow`, {
        method: 'DELETE',
        body: { followerId: currentUser.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/followers`] });
    },
    onError: (error) => {
      console.error("Unfollow mutation error:", error);
    }
  });

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

  const isFollowing = followers?.followers?.some(follower => follower.id === currentUser?.id);
  const isOwnProfile = currentUser?.id === userId;

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync();
    } else {
      await followMutation.mutateAsync();
    }
  };

  const interests = user.user.preferences?.interests || [];
  const retailPreferences = user.user.preferences?.retailPreferences || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-full md:w-1/3">
                <Avatar className="w-32 h-32 mx-auto md:mx-0">
                  <AvatarFallback>{user.user.displayName?.[0] || "U"}</AvatarFallback>
                  {user.user.avatar && (
                    <AvatarImage src={user.user.avatar} alt={user.user.displayName || "User"} />
                  )}
                </Avatar>

                <div className="mt-4 text-center md:text-left">
                  <h1 className="text-2xl font-bold">
                    {user.user.displayName || "Anonymous"}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <AtSign className="w-4 h-4" />
                    {user.user.username}
                  </p>
                  {user.user.createdAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      Joined {format(new Date(user.user.createdAt), 'MMMM yyyy')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  {isOwnProfile ? (
                    <Link href={`/profile/${userId}/edit`}>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    currentUser && (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={followMutation.isPending || unfollowMutation.isPending}
                        variant={isFollowing ? "outline" : "default"}
                        className="w-full"
                      >
                        {followMutation.isPending || unfollowMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          isFollowing ? "Unfollow" : "Follow"
                        )}
                      </Button>
                    )
                  )}

                  <div className="flex gap-4 justify-center md:justify-start">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{followers?.followers?.length || 0}</span> followers
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{following?.following?.length || 0}</span> following
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6">
                {user.user.bio && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">About</h2>
                    <p className="text-muted-foreground">{user.user.bio}</p>
                  </div>
                )}

                {interests.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                      {interests.map(interest => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {retailPreferences.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Shopping Preferences</h2>
                    <div className="flex flex-wrap gap-2">
                      {retailPreferences.map(preference => (
                        <Badge key={preference} variant="outline">
                          {preference}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isOwnProfile && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Card</h2>
            <ContactCard userId={userId} />
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Posts</h2>
          <PostList posts={posts?.posts || []} />
        </div>
      </div>
    </div>
  );
}