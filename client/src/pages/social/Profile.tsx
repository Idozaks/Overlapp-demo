import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, AtSign, Calendar, UserCheck, Users, Laptop } from "lucide-react";
import { Link } from "wouter";
import PostList from "@/components/social/PostList";
import type { User, PostWithUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Added type definition for Interest
interface Interest {
  id: number;
  name: string;
  category: string;
  description?: string;
  iconUrl?: string;
  isAiGenerated?: boolean;
}

export default function Profile() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation();

  // Group all useQuery hooks together at the top
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

  const { data: userInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: [`/api/users/${userId}/interests`],
    queryFn: async () => {
      const response = await apiRequest(`/api/users/${userId}/interests`);
      return response.json();
    },
    enabled: !!userId && !isNaN(userId)
  });

  // Group mutations together
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

  // Handle invalid userId
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

  // Handle loading state
  if (loadingUser || loadingPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Handle user not found
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

  const retailPreferences = user.user.preferences?.retailPreferences || [];
  // Keep full interest objects to access iconUrl
  const interestObjects = userInterests?.interests || [];

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
                    <div className="flex flex-col gap-3">
                      <Link href={`/profile/${userId}/edit`}>
                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                      <Button
                        onClick={() => navigate('/social/matches')}
                        className="w-full"
                        variant="default"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Find Matches
                      </Button>
                    </div>
                  ) : (
                    currentUser && (
                      <div className="flex flex-col gap-3">
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
                        
                        {/* Overlap button for comparing users */}
                        {currentUser && (
                          <Link href={`/social/overlap?targetUserId=${userId}`}>
                            <Button
                              variant="secondary"
                              className="w-full"
                              onClick={() => console.log("Navigating to overlap with target:", userId)}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Analyze Overlap
                            </Button>
                          </Link>
                        )}
                      </div>
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

                {/* Identity Attributes Section */}
                <div>
                  <h2 className="text-lg font-semibold mb-2">Identity Attributes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.user.gender && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Gender</span>
                        <span className="font-medium">{user.user.gender}</span>
                      </div>
                    )}
                    
                    {user.user.ageRange && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Age Range</span>
                        <span className="font-medium">{user.user.ageRange}</span>
                      </div>
                    )}
                    
                    {user.user.countryOfOrigin && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Country of Origin</span>
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://flagcdn.com/w20/${user.user.countryOfOrigin.toLowerCase()}.png`}
                            width="20" 
                            alt={user.user.countryOfOrigin}
                          />
                          <span className="font-medium">{user.user.countryOfOrigin}</span>
                        </div>
                      </div>
                    )}
                    
                    {user.user.languagesSpoken && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Languages Spoken</span>
                        <span className="font-medium">{user.user.languagesSpoken}</span>
                      </div>
                    )}
                    
                    {user.user.culturalBackground && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Cultural Background</span>
                        <span className="font-medium">{user.user.culturalBackground}</span>
                      </div>
                    )}
                    
                    {user.user.education && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Education</span>
                        <span className="font-medium">{user.user.education}</span>
                      </div>
                    )}
                    
                    {user.user.professionalField && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Professional Field</span>
                        <span className="font-medium">{user.user.professionalField}</span>
                      </div>
                    )}
                    
                    {user.user.communityAffiliations && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Community Affiliations</span>
                        <span className="font-medium">{user.user.communityAffiliations}</span>
                      </div>
                    )}
                    
                    {user.user.eventPreferences && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Event Preferences</span>
                        <span className="font-medium">{user.user.eventPreferences}</span>
                      </div>
                    )}
                    
                    {user.user.collaborationStyle && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Collaboration Style</span>
                        <span className="font-medium">{user.user.collaborationStyle}</span>
                      </div>
                    )}
                    
                    {user.user.personalValues && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Personal Values</span>
                        <span className="font-medium">{user.user.personalValues}</span>
                      </div>
                    )}
                    
                    {user.user.digitalIdentity && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Digital Identity</span>
                        <span className="font-medium">{user.user.digitalIdentity}</span>
                      </div>
                    )}
                    
                    {user.user.physicalActivityLevel && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Physical Activity Level</span>
                        <span className="font-medium">{user.user.physicalActivityLevel}</span>
                      </div>
                    )}
                    
                    {user.user.culturalExperiences && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Cultural Experiences</span>
                        <span className="font-medium">{user.user.culturalExperiences}</span>
                      </div>
                    )}
                    
                    {user.user.learningStyle && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Learning Style</span>
                        <span className="font-medium">{user.user.learningStyle}</span>
                      </div>
                    )}
                  </div>
                </div>

                {interestObjects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                      {interestObjects.map(interest => (
                        <Badge key={interest.name} variant="secondary">
                          {interest.iconUrl} {interest.name}
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

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Posts</h2>
          <PostList posts={posts?.posts || []} />
        </div>
      </div>
    </div>
  );
}