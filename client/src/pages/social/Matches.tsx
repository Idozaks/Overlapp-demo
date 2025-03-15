import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MatchResult } from "../../../../server/matching";
import { Progress } from "@/components/ui/progress";
import { Loader2, UserIcon, ActivityIcon, BookIcon, UsersIcon } from "lucide-react";
import { Link } from "wouter";

export default function Matches() {
  const { user } = useAuth();
  const [weightConfig, setWeightConfig] = useState({
    identityWeight: 0.7,
    interestWeight: 0.3,
    minIdentityMatches: 1
  });

  const { data, isLoading, error, refetch } = useQuery<{ matches: MatchResult[] }>({
    queryKey: ['/api/identity-matches', user?.id, weightConfig],
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [weightConfig, user?.id, refetch]);

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
            </div>
            <Button 
              className="mt-4"
              onClick={() => refetch()}
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
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Link href={`/profile/${match.userId}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <Button>Connect</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}