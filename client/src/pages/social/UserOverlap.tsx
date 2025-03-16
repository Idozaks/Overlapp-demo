import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function UserOverlap() {
  const [location] = useLocation();
  // Make sure to handle URL parameters correctly
  const searchParams = new URLSearchParams(window.location.search);
  const targetUserId = searchParams.get('targetUserId');
  const { user: currentUser } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Make sure we have the needed parameters
  useEffect(() => {
    console.log("Current location:", location);
    console.log("Current query params:", window.location.search);
    console.log("Target user ID:", targetUserId);
    console.log("Current user:", currentUser?.id);
  }, [location, targetUserId, currentUser]);

  // Convert targetUserId to number
  const targetUserIdNum = targetUserId ? parseInt(targetUserId) : 0;

  // Query to fetch target user data
  const { data: userData, isLoading: loadingUser, error: userError } = useQuery<{ user: any }>({
    queryKey: [`/api/users/${targetUserId}`],
    enabled: !!targetUserId,
    queryFn: async () => {
      const response = await fetch(`/api/users/${targetUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    }
  });

  // Query to fetch the overlap analysis
  const { data: overlapData, isLoading: loadingOverlap, error: overlapError, refetch } = useQuery<{ 
    analysis: string; 
    similarInterests: string[];
    uniqueCurrentUserInterests: string[];
    uniqueTargetUserInterests: string[];
    commonIdentities: string[];
    differentIdentities: Record<string, {current: string; target: string}>;
    overlapScore: number;
  }>({
    queryKey: [`/api/users/${targetUserId}/overlap`],
    enabled: !!targetUserId && !!currentUser?.id,
    queryFn: async () => {
      console.log("Fetching overlap data for target user ID:", targetUserId);
      // First check if target user exists
      const userCheckResponse = await fetch(`/api/users/${targetUserId}`);
      if (!userCheckResponse.ok) {
        throw new Error(`User with ID ${targetUserId} not found`);
      }
      
      // Then fetch overlap data
      const response = await fetch(`/api/users/${targetUserId}/overlap`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Overlap API error:", errorText);
        throw new Error('Failed to fetch overlap data: ' + errorText);
      }
      return response.json();
    }
  });

  // Function to regenerate analysis
  const regenerateAnalysis = async () => {
    setIsGenerating(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error regenerating analysis:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading states
  if (loadingUser || loadingOverlap) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing overlap between profiles...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (userError || overlapError) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading the comparison data. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const targetUser = userData?.user;
  const currentUserBio = currentUser?.bio || "";
  const targetUserBio = targetUser?.bio || "";
  
  if (!targetUser) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">User not found</p>
            <Link href="/social">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Social
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/profile/${targetUser.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* User Cards */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarImage src={currentUser?.avatar || undefined} />
                <AvatarFallback>
                  {currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>You</CardTitle>
                <CardDescription>
                  {currentUser?.username}
                </CardDescription>
              </div>
            </div>
            {currentUserBio && (
              <div className="mt-3 text-sm text-muted-foreground italic">
                <p className="line-clamp-2">{currentUserBio}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="flex items-center justify-center">
          <Badge className="text-xl px-4 py-2">VS</Badge>
        </div>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarImage src={targetUser.avatar || undefined} />
                <AvatarFallback>
                  {targetUser.displayName?.[0]?.toUpperCase() || targetUser.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{targetUser.displayName || targetUser.username}</CardTitle>
                <CardDescription>
                  {targetUser.username}
                </CardDescription>
              </div>
            </div>
            {targetUserBio && (
              <div className="mt-3 text-sm text-muted-foreground italic">
                <p className="line-clamp-2">{targetUserBio}</p>
              </div>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* Overlap Score Card with Visual Indicator and Quick Insights */}
      {overlapData && (
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-center">
              Overlap Score 
              <Badge className="text-xl px-4 py-2">
                {Math.round(overlapData.overlapScore * 100)}%
              </Badge>
            </CardTitle>
            
            {/* Visual Overlap Indicator */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <Progress 
                value={Math.round(overlapData.overlapScore * 100)} 
                className={`h-3 ${
                  overlapData.overlapScore > 0.7 
                    ? "bg-green-500/20" 
                    : overlapData.overlapScore > 0.4 
                      ? "bg-yellow-500/20" 
                      : "bg-orange-500/20"
                }`}
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Insights & Highlights */}
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2 flex items-center">
                  <span className="text-xl mr-2">✨</span> Quick Insights
                </h3>
                <p className="text-sm text-muted-foreground italic mb-3">
                  {overlapData.similarInterests.length > 0 
                    ? `You both share ${overlapData.similarInterests.length} interests, including ${overlapData.similarInterests.slice(0, 2).join(' and ')}${overlapData.similarInterests.length > 2 ? '...' : '!'}`
                    : "You have different interests, which creates an opportunity to learn from each other!"}
                </p>
                <p className="text-sm">
                  {overlapData.commonIdentities.length > 0 
                    ? `You have ${overlapData.commonIdentities.length} identity traits in common, creating a solid foundation for connection.`
                    : "Your diverse backgrounds offer a rich opportunity for cultural exchange!"}
                </p>
              </div>
              
              {/* One-line Overview */}
              <div className="mt-4 text-center">
                <p className="text-sm font-medium italic">
                  {overlapData.overlapScore > 0.7 
                    ? "Your profiles suggest a strong synergy of shared experiences and interests!" 
                    : overlapData.overlapScore > 0.4 
                      ? "You have a balanced mix of similarities and differences - perfect for meaningful exchange!" 
                      : "Your diverse backgrounds create unique opportunities for learning from each other!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaboration Suggestions Card */}
      {overlapData && (
        <Card className="mb-8 border-2 border-primary/10">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Project Ideas
            </CardTitle>
            <CardDescription>
              Potential collaborations based on your shared interests
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Project Card with gradient border */}
              <div className="p-5 rounded-lg bg-card border-2 border-gradient-to-r from-primary/40 to-secondary/40 shadow-sm">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  {overlapData.similarInterests.length > 0 
                    ? `${overlapData.similarInterests[0]} ${overlapData.similarInterests.length > 1 ? '+ ' + overlapData.similarInterests[1] : ''} Project`
                    : 'Cross-Cultural Exchange'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {overlapData.similarInterests.length > 0
                    ? `Collaborate on a ${overlapData.similarInterests[0]} project that leverages both your skills and perspectives${targetUserBio ? ` — ${targetUserBio.split('.')[0]}.` : '.'}`
                    : `Create a cultural exchange project drawing on your diverse backgrounds and interests${targetUserBio ? ` with ${targetUser.displayName || targetUser.username}'s experience in ${targetUserBio.split(' ').slice(0, 5).join(' ')}...` : '.'}`}
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    {overlapData.overlapScore > 0.5 ? 'High Compatibility' : 'Complementary Skills'}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Propose
                  </Button>
                </div>
              </div>

              {/* Second Project Card */}
              <div className="p-5 rounded-lg bg-card border border-primary/10 shadow-sm">
                <h3 className="text-lg font-medium mb-2">
                  {overlapData.commonIdentities.length > 1 
                    ? `${overlapData.commonIdentities[0]} Workshop`
                    : overlapData.similarInterests.length > 0 
                      ? `${overlapData.similarInterests[0]} Research`
                      : 'Skill-Share Session'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {overlapData.commonIdentities.length > 1
                    ? `Co-host a workshop focused on ${overlapData.commonIdentities[0]} experiences and knowledge sharing${currentUserBio && targetUserBio ? ` combining both your backgrounds.` : '.'}`
                    : overlapData.similarInterests.length > 0
                      ? `Conduct joint research or exploration on evolving trends in ${overlapData.similarInterests[0]}${targetUserBio ? ` that could benefit from ${targetUser.displayName || targetUser.username}'s perspective.` : '.'}`
                      : `Exchange skills: you can teach about ${overlapData.uniqueCurrentUserInterests[0] || 'your expertise'}, and learn about ${overlapData.uniqueTargetUserInterests[0] || 'their specialties'}${targetUserBio ? ` — draw inspiration from their experience with "${targetUserBio.substring(0, 40)}${targetUserBio.length > 40 ? '...' : ''}"` : '.'}`}
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    {overlapData.overlapScore > 0.7 ? 'Perfect Match' : 'Growth Opportunity'}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Propose
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Starters Card */}
      {overlapData && (
        <Card className="mb-8 border-2 border-primary/10">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Conversation Starters
            </CardTitle>
            <CardDescription>
              Break the ice with personalized conversation topics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overlapData.similarInterests.length > 0 ? (
                <>
                  <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                    <p className="font-medium mb-1">
                      {`Ask about ${overlapData.similarInterests[0]}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {`What got you interested in ${overlapData.similarInterests[0]}? I'd love to hear about your experience.`}
                    </p>
                  </div>
                  
                  {overlapData.similarInterests.length > 1 && (
                    <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                      <p className="font-medium mb-1">
                        {`Share your ${overlapData.similarInterests[1]} stories`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {`I noticed we both enjoy ${overlapData.similarInterests[1]}! What's your favorite thing about it?`}
                      </p>
                    </div>
                  )}
                  
                  {Object.keys(overlapData.differentIdentities).length > 0 && (
                    <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                      <p className="font-medium mb-1">
                        {`Learn about ${Object.keys(overlapData.differentIdentities)[0] === 'countryOfOrigin' 
                          ? 'your country' 
                          : Object.keys(overlapData.differentIdentities)[0]}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {`I'd love to hear more about your experience ${Object.keys(overlapData.differentIdentities)[0] === 'countryOfOrigin' 
                          ? `in ${Object.values(overlapData.differentIdentities)[0].target}` 
                          : `with ${Object.values(overlapData.differentIdentities)[0].target}`}!`}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                    <p className="font-medium mb-1">Ask about unique perspectives</p>
                    <p className="text-sm text-muted-foreground">
                      I'd love to learn more about your experiences. What's something you're passionate about?
                    </p>
                  </div>
                  
                  {overlapData.uniqueTargetUserInterests.length > 0 && (
                    <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                      <p className="font-medium mb-1">
                        {`Ask about ${overlapData.uniqueTargetUserInterests[0]}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {`I noticed you're interested in ${overlapData.uniqueTargetUserInterests[0]}. What draws you to that?`}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer">
                    <p className="font-medium mb-1">Share a learning opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Our different backgrounds could be a great opportunity to learn from each other!
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>AI Analysis</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={regenerateAnalysis}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Regenerate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overlapData?.analysis ? (
            <div className="prose max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:scroll-m-20">
              {overlapData.analysis.split('\n').map((paragraph, idx) => 
                paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />
              <p>Generating comparison...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared Attributes Section */}
      {overlapData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Common Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>
                <ThumbsUp className="inline-block mr-2 h-5 w-5 text-green-500" />
                Similarities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Shared Identities */}
              {overlapData.commonIdentities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Common Identity Traits</h3>
                  <div className="flex flex-wrap gap-1">
                    {overlapData.commonIdentities.map((identity, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-300">
                        {identity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Interests */}
              {overlapData.similarInterests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Shared Interests</h3>
                  <div className="flex flex-wrap gap-1">
                    {overlapData.similarInterests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {overlapData.commonIdentities.length === 0 && overlapData.similarInterests.length === 0 && (
                <p className="text-muted-foreground">No common traits found</p>
              )}
            </CardContent>
          </Card>

          {/* Different Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>
                <ThumbsDown className="inline-block mr-2 h-5 w-5 text-amber-500" />
                Differences
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Different Identities */}
              {Object.keys(overlapData.differentIdentities).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Different Identity Traits</h3>
                  <div className="space-y-3">
                    {Object.entries(overlapData.differentIdentities).map(([key, values], idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          {values.current}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {key === 'countryOfOrigin' ? 'Country' : key}
                        </span>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300">
                          {values.target}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Different Interests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Your Unique Interests</h3>
                  <div className="flex flex-wrap gap-1">
                    {overlapData.uniqueCurrentUserInterests.length > 0 ? (
                      overlapData.uniqueCurrentUserInterests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Their Unique Interests</h3>
                  <div className="flex flex-wrap gap-1">
                    {overlapData.uniqueTargetUserInterests.length > 0 ? (
                      overlapData.uniqueTargetUserInterests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-300">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">None</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}