import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MatchResult } from "../../../../server/matching";
import { Progress } from "@/components/ui/progress";
import { Loader2, UserIcon, ActivityIcon, BookIcon, UsersIcon, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

export default function Matches() {
  const { user } = useAuth();
  const [weightConfig, setWeightConfig] = useState({
    identityWeight: 0.7,
    interestWeight: 0.3,
    minIdentityMatches: 1,
    includeCompatibilityInsights: true
  });

  // Using a separate state for applied configuration to avoid auto-refetching
  // Initialize with the same default values
  const [appliedConfig, setAppliedConfig] = useState({
    identityWeight: 0.7,
    interestWeight: 0.3,
    minIdentityMatches: 1,
    includeCompatibilityInsights: true
  });
  
  // State for tracking match feedback
  const [feedbackStates, setFeedbackStates] = useState<Record<number, 'positive' | 'negative' | 'neutral' | undefined>>({});

  const { data, isLoading, error, refetch } = useQuery<{ matches: MatchResult[] }>({
    queryKey: [`/api/identity-matches/${user?.id}`, appliedConfig],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not logged in");
      const queryParams = new URLSearchParams({
        identityWeight: appliedConfig.identityWeight.toString(),
        interestWeight: appliedConfig.interestWeight.toString(),
        minIdentityMatches: appliedConfig.minIdentityMatches.toString(),
        includeCompatibilityInsights: appliedConfig.includeCompatibilityInsights.toString()
      });
      const response = await fetch(`/api/identity-matches/${user.id}?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Only refetch when user ID changes, not when sliders change
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading your matches. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Matching Preferences</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Identity Attributes Weight: {Math.round(weightConfig.identityWeight * 100)}%</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.9" 
                  step="0.1"
                  value={weightConfig.identityWeight} 
                  onChange={(e) => setWeightConfig({
                    ...weightConfig,
                    identityWeight: parseFloat(e.target.value),
                    interestWeight: 1 - parseFloat(e.target.value)
                  })} 
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Interest Matches Weight: {Math.round(weightConfig.interestWeight * 100)}%</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.9" 
                  step="0.1"
                  value={weightConfig.interestWeight}
                  onChange={(e) => setWeightConfig({
                    ...weightConfig,
                    interestWeight: parseFloat(e.target.value),
                    identityWeight: 1 - parseFloat(e.target.value)
                  })} 
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Identity Matches: {weightConfig.minIdentityMatches}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="1"
                  value={weightConfig.minIdentityMatches} 
                  onChange={(e) => setWeightConfig({
                    ...weightConfig,
                    minIdentityMatches: parseInt(e.target.value)
                  })} 
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={weightConfig.includeCompatibilityInsights}
                  onCheckedChange={(checked) => setWeightConfig({
                    ...weightConfig,
                    includeCompatibilityInsights: checked
                  })}
                  id="insights-mode"
                />
                <label
                  htmlFor="insights-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                  AI Compatibility Insights
                </label>
              </div>
            </div>
            <Button 
              className="mt-4"
              onClick={() => {
                // Apply the current slider values to the applied config
                setAppliedConfig(weightConfig);
                // Then refetch with the new values
                refetch();
              }}
            >
              Update Matches
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.matches?.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No matches found. Try adjusting your preferences or complete your profile with more information.</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {data?.matches?.map((match) => (
          <Card key={match.userId} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={match.avatar || undefined} />
                  <AvatarFallback>
                    {match.displayName?.[0]?.toUpperCase() || match.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge className="ml-auto">
                  {Math.round(match.matchScore * 100)}% Match
                </Badge>
              </div>
              <CardTitle className="mt-2">{match.displayName || match.username}</CardTitle>
              <CardDescription>{match.bio || "No bio provided"}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="flex items-center">
                      <UserIcon className="mr-1 h-4 w-4" /> Identity Match
                    </span>
                    <span>{Math.round(match.identityScore * 100)}%</span>
                  </div>
                  <Progress value={match.identityScore * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="flex items-center">
                      <ActivityIcon className="mr-1 h-4 w-4" /> Interest Match
                    </span>
                    <span>{Math.round(match.interestScore * 100)}%</span>
                  </div>
                  <Progress value={match.interestScore * 100} className="h-2" />
                </div>
                
                {match.commonIdentities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <UsersIcon className="mr-1 h-4 w-4" /> Common Identity Attributes
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {match.commonIdentities.map((identity, idx) => (
                        <Badge key={idx} variant="outline" className="bg-primary/5">{identity}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {match.sharedInterests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <BookIcon className="mr-1 h-4 w-4" /> Shared Interests
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {match.sharedInterests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-secondary/10">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {appliedConfig.includeCompatibilityInsights && match.compatibilityInsights && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                    <h4 className="text-sm font-medium mb-2 flex items-center text-amber-700 dark:text-amber-400">
                      <Sparkles className="mr-1 h-4 w-4" /> AI Compatibility Insights
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      {match.compatibilityInsights}
                    </p>
                  </div>
                )}
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">What do you think of this match?</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant={feedbackStates[match.userId] === 'positive' ? 'default' : 'outline'} 
                      size="sm"
                      className={feedbackStates[match.userId] === 'positive' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={async () => {
                        if (!user?.id) return;
                        
                        try {
                          // Submit positive feedback
                          const response = await fetch(`/api/matches/${user.id}/feedback`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              targetUserId: match.userId,
                              score: 1,
                              interactionType: 'explicit'
                            })
                          });
                          
                          if (response.ok) {
                            // Update local state
                            setFeedbackStates(prev => ({
                              ...prev,
                              [match.userId]: 'positive'
                            }));
                            
                            toast({
                              title: "Feedback submitted",
                              description: "Thanks! We'll use this to improve your matches.",
                              variant: "default"
                            });
                            
                            // Refetch matches after a brief delay
                            setTimeout(() => refetch(), 1000);
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to submit feedback. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" /> Good Match
                    </Button>
                    
                    <Button 
                      variant={feedbackStates[match.userId] === 'negative' ? 'default' : 'outline'} 
                      size="sm"
                      className={feedbackStates[match.userId] === 'negative' ? 'bg-red-600 hover:bg-red-700' : ''}
                      onClick={async () => {
                        if (!user?.id) return;
                        
                        try {
                          // Submit negative feedback
                          const response = await fetch(`/api/matches/${user.id}/feedback`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              targetUserId: match.userId,
                              score: -1,
                              interactionType: 'explicit'
                            })
                          });
                          
                          if (response.ok) {
                            // Update local state
                            setFeedbackStates(prev => ({
                              ...prev,
                              [match.userId]: 'negative'
                            }));
                            
                            toast({
                              title: "Feedback submitted",
                              description: "Thanks! We'll use this to improve your matches.",
                              variant: "default"
                            });
                            
                            // Refetch matches after a brief delay
                            setTimeout(() => refetch(), 1000);
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to submit feedback. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" /> Not for Me
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Link href={`/profile/${match.userId}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <Link href={`/social/overlap?targetId=${match.userId}`}>
                <Button>View Overlap</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}