import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import {
  ArrowLeft,
  BookmarkIcon,
  Calendar,
  Globe,
  Info,
  Link as LinkIcon,
  MessageSquare,
  Share2,
  ThumbsUp,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AIButton } from '@/components/ui/ai-button';
import { AIInterface, AIResult } from '@/components/ui/ai-interface';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type Interest = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
};

type InterestContent = {
  id: number;
  interestId: number;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  createdAt: string;
};

type Group = {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
};

const InterestDetail = () => {
  const [, params] = useRoute('/interests/:id');
  const interestId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State to track if user has joined the interest
  const [isUserJoined, setIsUserJoined] = useState(false);

  // Fetch interest details
  const { data: interestData, isLoading: isLoadingInterest } = useQuery<{interest: Interest}>({
    queryKey: [`/api/interests/${interestId}`],
    enabled: !!interestId,
  });

  // Fetch interest content
  const { data: contentData, isLoading: isLoadingContent } = useQuery<{content: InterestContent[]}>({
    queryKey: [`/api/interests/${interestId}/content`],
    enabled: !!interestId,
  });

  // Check if user has joined this interest
  const { data: userInterestData } = useQuery<{interests: Interest[]}>({
    queryKey: [`/api/user/interests`],
  });
  
  // Check if user is following this interest when user interests data changes
  useEffect(() => {
    if (userInterestData?.interests) {
      const joined = userInterestData.interests.some((interest: Interest) => interest.id === interestId);
      setIsUserJoined(joined);
    }
  }, [userInterestData, interestId]);

  // Mutation to join/leave an interest
  const joinInterestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/user/interests/${interestId}`, {
        method: isUserJoined ? 'DELETE' : 'POST',
      });
    },
    onSuccess: () => {
      setIsUserJoined(!isUserJoined);
      queryClient.invalidateQueries({ queryKey: [`/api/user/interests`] });
      toast({
        title: isUserJoined ? 'Removed from interests' : 'Added to your interests',
        description: isUserJoined 
          ? `You have left ${interestData?.interest?.name}`
          : `You have joined ${interestData?.interest?.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${isUserJoined ? 'leave' : 'join'} the interest. Please try again.`,
        variant: 'destructive',
      });
    },
  });

  const interest = interestData?.interest as Interest;
  const content = contentData?.content as InterestContent[] || [];
  
  // For demo purposes, let's create some mock groups related to this interest
  // In a real implementation, this would be fetched from the API
  const relatedGroups: Group[] = [
    {
      id: 1,
      name: `${interest?.name || 'Interest'} Enthusiasts`,
      description: `A group for people passionate about ${interest?.name || 'this interest'}`,
      memberCount: 24,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: `${interest?.name || 'Interest'} Beginners`,
      description: `New to ${interest?.name || 'this interest'}? Join us to learn the basics!`,
      memberCount: 15,
      createdAt: new Date().toISOString(),
    },
  ];

  // Function to handle joining a group
  const handleJoinGroup = (groupId: number, groupName: string) => {
    toast({
      title: 'Group Joined',
      description: `You have successfully joined the "${groupName}" group.`,
    });
  };

  if (isLoadingInterest) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/interests">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <Skeleton className="h-10 w-1/3" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!interest) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Interest not found</h2>
        <p className="mb-6">The interest you're looking for doesn't seem to exist.</p>
        <Link href="/interests">
          <Button>Explore Interests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/interests">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Interests
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {interest.iconUrl ? (
              <img
                src={interest.iconUrl}
                alt={interest.name}
                className="w-6 h-6"
              />
            ) : (
              <BookmarkIcon className="w-5 h-5 text-primary" />
            )}
            {interest.name}
          </h1>
        </div>
        <AIButton
          variant={isUserJoined ? "outline" : "default"}
          className="flex items-center gap-2"
          onClick={() => joinInterestMutation.mutate()}
          disabled={joinInterestMutation.isPending}
          showSparkles={!isUserJoined}
        >
          {joinInterestMutation.isPending ? (
            "Processing..."
          ) : isUserJoined ? (
            <>
              <ThumbsUp className="h-4 w-4" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Follow Interest
            </>
          )}
        </AIButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About {interest.name}</CardTitle>
              <CardDescription className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {interest.category}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {interest.description || `Explore the world of ${interest.name} and connect with others who share your passion.`}
              </p>
              
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="content" className="flex-1">
                    <Info className="w-4 h-4 mr-2" /> Content
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="flex-1">
                    <Users className="w-4 h-4 mr-2" /> Groups
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" /> Discussions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="pt-4">
                  {isLoadingContent ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <Skeleton className="h-5 w-2/3" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-12 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : content.length > 0 ? (
                    <div className="space-y-4">
                      {content.map((item) => (
                        <Card key={item.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <CardDescription className="flex items-center text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              {new URL(item.url).hostname}
                              <span className="mx-2">•</span>
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            {item.description && (
                              <p className="text-sm mb-2">{item.description}</p>
                            )}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm flex items-center text-primary hover:underline"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              View Resource
                            </a>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No content available for this interest yet.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="groups" className="pt-4">
                  <div className="space-y-4">
                    {relatedGroups.map((group) => (
                      <Card key={group.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{group.name}</CardTitle>
                              <CardDescription className="flex items-center text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {group.memberCount} members
                              </CardDescription>
                            </div>
                            <AIButton
                              size="sm"
                              onClick={() => handleJoinGroup(group.id, group.name)}
                              showSparkles
                            >
                              Join Group
                            </AIButton>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{group.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="flex justify-center mt-6">
                      <AIButton variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        View All Groups
                      </AIButton>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="discussions" className="pt-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Join conversations about {interest.name}</p>
                    <AIButton variant="outline" showSparkles>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start a Discussion
                    </AIButton>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Recommended Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedGroups.map((group) => (
                <div key={group.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{group.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-medium">{group.name}</h4>
                      <p className="text-xs text-muted-foreground">{group.memberCount} members</p>
                    </div>
                  </div>
                  <AIButton
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => handleJoinGroup(group.id, group.name)}
                  >
                    Join
                  </AIButton>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <AIButton className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                View All Groups
              </AIButton>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Share this interest with your friends and connections
              </p>
              <AIButton className="w-full" variant="outline" showSparkles>
                <Share2 className="w-4 h-4 mr-2" />
                Share Interest
              </AIButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterestDetail;