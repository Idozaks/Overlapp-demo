import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TTSPlayer } from '@/components/ui/tts-player';
import { ThoughtStream } from '@/components/ui/thought-stream';

import {
  ArrowLeft,
  Loader2,
  User,
  Users,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Brain,
  RefreshCw,
  MessageCircle,
  Volume2,
  Braces,
} from 'lucide-react';

import { generateStreamingUrl, startAiAnalysisStream } from '@/lib/streaming-service';

export function UserOverlapSimple() {
  const { user: currentUser } = useAuth();
  const [location] = useLocation();
  const params = useParams<{ id: string }>();
  const targetUserId = params.id;
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTTS, setShowTTS] = useState(false);
  const [showThoughtStream, setShowThoughtStream] = useState(false);
  const [streamingThoughts, setStreamingThoughts] = useState("");
  const [streamingAnalysis, setStreamingAnalysis] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  
  // Function to start streaming analysis
  const startStreamingAnalysis = () => {
    // Reset states
    setIsStreaming(true);
    setStreamingThoughts("");
    setStreamingAnalysis(null);
    
    // Cancel any existing stream
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
    }
    
    // Create the streaming URL
    const streamingUrl = generateStreamingUrl(`/api/users/${targetUserId}/streaming-overlap`, {});
    
    // Start the streaming connection
    const controller = startAiAnalysisStream(streamingUrl, {
      onAnalysis: (analysisData) => {
        setStreamingAnalysis(analysisData);
      },
      onThought: (thoughtData) => {
        setStreamingThoughts(prev => prev + thoughtData);
      },
      onError: (error: Error | string) => {
        toast({
          title: "Streaming Error",
          description: typeof error === 'string' ? error : error.message,
          variant: "destructive"
        });
        setIsStreaming(false);
      },
      onComplete: () => {
        setIsStreaming(false);
      }
    });
    
    // Store the controller for potential cancellation
    streamControllerRef.current = controller;
  };
  
  // Function to stop streaming
  const stopStreamingAnalysis = () => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort();
      streamControllerRef.current = null;
    }
    setIsStreaming(false);
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
            <p>{userError ? "User not found or no longer available." : "There was a problem loading the comparison data. Please try again later."}</p>
            <div className="flex gap-3 mt-4">
              <Link href="/engage">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Engage
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
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
            <Link href="/engage">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Engage
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
        <Link href={`/engage`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Engage
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

      {/* Detailed Analysis Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Detailed Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowTTS(!showTTS)}
                className={`gap-1 ${showTTS ? 'bg-primary/10' : ''}`}
              >
                <Volume2 className="h-4 w-4" />
                {showTTS ? 'Hide Audio' : 'Read Aloud'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowThoughtStream(!showThoughtStream)}
                className={`gap-1 ${showThoughtStream ? 'bg-primary/10' : ''}`}
              >
                <Brain className="h-4 w-4" />
                {showThoughtStream ? 'Hide AI Process' : 'Show AI Process'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thought Stream (conditionally shown) */}
          {showThoughtStream && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Braces className="h-4 w-4 text-primary" />
                <h3 className="font-medium">AI Reasoning Process</h3>
              </div>
              
              {isStreaming ? (
                <>
                  <ThoughtStream targetText={streamingThoughts} />
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={stopStreamingAnalysis}
                      className="gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : streamingThoughts ? (
                <ThoughtStream targetText={streamingThoughts} />
              ) : (
                <div className="p-4 border rounded-md bg-muted/30 mb-4">
                  <div className="text-center mb-4">
                    <Brain className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">See the AI's reasoning process in real-time</p>
                  </div>
                  <Button 
                    onClick={startStreamingAnalysis} 
                    variant="outline" 
                    className="w-full"
                  >
                    Start AI Analysis Stream
                  </Button>
                </div>
              )}
            </div>
          )}
        
          {/* Regular Analysis Content */}
          {loadingOverlap ? (
            <div className="text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />
              <p>Generating comparison...</p>
            </div>
          ) : overlapData?.analysis && overlapData.analysis.trim() !== "" && overlapData.analysis !== "Detailed analysis not available" ? (
            <>
              <div className="prose max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:scroll-m-20">
                {overlapData.analysis.split('\n').map((paragraph, idx) => 
                  paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                )}
              </div>
              
              {showTTS && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Text-to-Speech Player
                  </h3>
                  <TTSPlayer 
                    text={overlapData.analysis}
                    onPlay={() => {
                      toast({
                        title: "Audio started",
                        description: "Playing analysis with AI voice",
                      });
                    }}
                    onError={(error) => {
                      toast({
                        title: "Audio error",
                        description: "Failed to play audio: " + error.message,
                        variant: "destructive"
                      });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-medium mb-2">Personalized Analysis</h3>
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const score = overlapData?.overlapScore ? Math.round(overlapData.overlapScore * 100) : 0;
                  const interests = overlapData?.similarInterests?.length || 0;
                  const name = targetUser?.displayName || targetUser?.username || "this user";
                  
                  if (score > 75) {
                    return `You have a strong compatibility with ${name}. With ${interests} shared interests, you have many topics to explore together. This high level of common ground creates an excellent foundation for meaningful interaction and collaboration.`;
                  } else if (score > 50) {
                    return `You have a moderate compatibility with ${name}. The ${interests} shared interests provide good conversation starters. While you have similarities, your differences present opportunities to learn from each other and expand your horizons.`;
                  } else {
                    return `You have unique perspectives compared to ${name}. While you may not share many common interests (${interests} found), this diversity offers valuable opportunities for learning and growth. Consider exploring their interests to broaden your knowledge and experience.`;
                  }
                })()}
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={regenerateAnalysis}
                  className="gap-2"
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate Detailed Analysis'}
                </Button>
              </div>
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

export default UserOverlapSimple;