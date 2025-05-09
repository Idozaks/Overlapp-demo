import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GptButton } from "@/components/ui/gpt-button";
import { 
  Loader2, 
  ArrowLeft, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Volume2, 
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
  BookOpen,
  Calendar,
  Heart,
  Globe,
  Puzzle,
  Stars,
  Sprout
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { TTSPlayer } from "@/components/ui/tts-player";
import { ThoughtStream } from "@/components/ui/thought-stream";
import { startAiAnalysisStream, generateStreamingUrl } from "@/lib/streaming-service";
import { useToast } from "@/hooks/use-toast";

export default function UserOverlap() {
  const [location] = useLocation();
  // Make sure to handle URL parameters correctly
  const searchParams = new URLSearchParams(window.location.search);
  const targetUserId = searchParams.get('targetUserId') || 
                      localStorage.getItem('pendingOverlapUserId') || 
                      sessionStorage.getItem('pendingOverlapUserId');
  
  // Get current user from auth context or localStorage
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(authUser);
  
  // Load user from localStorage if auth context user is not available
  useEffect(() => {
    // If we already have a user from auth context, use it
    if (authUser) {
      setCurrentUser(authUser);
      return;
    }
    
    // Try to load from localStorage as fallback
    try {
      const storedUserString = localStorage.getItem('currentUser');
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        console.log('DEBUG-OVERLAP: Using stored user data:', storedUser.id);
        setCurrentUser(storedUser);
      }
    } catch (e) {
      console.error('DEBUG-OVERLAP: Failed to parse stored user data:', e);
    }
  }, [authUser]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTTS, setShowTTS] = useState(false);
  const [showThoughtStream, setShowThoughtStream] = useState(false);
  const [streamingThoughts, setStreamingThoughts] = useState("");
  const [streamingAnalysis, setStreamingAnalysis] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State for collapsible analysis section (collapsed by default)
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

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
      onError: (error) => {
        toast({
          title: "Streaming Error",
          description: error,
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
              <Link href="/social">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Social
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
  
  // Generate personalized conversation starters based on overlap data and bio information
  const generateConversationStarters = () => {
    if (!overlapData) return [];
    
    const starters = [];
    
    // Bio-derived starters (prioritize these when available)
    if (targetUserBio) {
      // Extract meaningful phrases from the bio
      const bioSegments = targetUserBio.split(/[.!?]/).filter((segment: string) => segment.trim().length > 20);
      
      if (bioSegments.length > 0) {
        // Use the first meaningful segment for a conversation starter
        const firstSegment = bioSegments[0].trim();
        starters.push(`I was reading in your bio about "${firstSegment.substring(0, 60)}${firstSegment.length > 60 ? '...' : ''}" - could you tell me more about that?`);
        
        // If there's a second segment, use it too
        if (bioSegments.length > 1) {
          const secondSegment = bioSegments[1].trim();
          const words = secondSegment.split(' ');
          const keyPhrase = words.length > 5 ? words.slice(0, 5).join(' ') : secondSegment;
          starters.push(`I'm intrigued by your mention of "${keyPhrase}..." in your bio - what's the story behind that?`);
        }
      }
      
      // Look for key professional terms in the bio
      const professionalTerms = ['work', 'career', 'professional', 'industry', 'business', 'startup', 'project', 'company', 'build', 'create', 'develop'];
      const foundProfessionalTerm = professionalTerms.find(term => targetUserBio.toLowerCase().includes(term));
      
      if (foundProfessionalTerm) {
        starters.push(`Your bio mentions your ${foundProfessionalTerm}. What aspects of it are you most passionate about right now?`);
      }
    }
    
    // Shared interests starters
    if (overlapData.similarInterests.length > 0 && starters.length < 5) {
      const interest1 = overlapData.similarInterests[0];
      starters.push(`I noticed we both enjoy ${interest1}! What first got you interested in it?`);
      
      if (overlapData.similarInterests.length > 1 && starters.length < 5) {
        const interest2 = overlapData.similarInterests[1];
        starters.push(`Have you attended any events or gatherings related to ${interest2}? I'd love to hear about your experiences.`);
      }
    }
    
    // Different identity traits starters
    if (Object.keys(overlapData.differentIdentities).length > 0 && starters.length < 5) {
      const trait = Object.entries(overlapData.differentIdentities)[0];
      const traitName = trait[0];
      const traitValue = trait[1].target;
      
      if (traitName === 'countryOfOrigin') {
        starters.push(`I'm curious about your experiences in ${traitValue}. What's something about it that most people wouldn't know?`);
      } else if (traitName === 'profession' || traitName === 'occupation' || traitName === 'professionalField') {
        starters.push(`I'd love to hear more about your work in ${traitValue}. What aspects of it do you find most fulfilling?`);
      } else {
        starters.push(`I'd love to hear your perspective on ${traitName} based on your experience with ${traitValue}.`);
      }
    }
    
    // Unique interest starters
    if (overlapData.uniqueTargetUserInterests.length > 0 && starters.length < 5) {
      const uniqueInterest = overlapData.uniqueTargetUserInterests[0];
      starters.push(`I see you're interested in ${uniqueInterest}, which is new to me. What would you recommend to someone just getting started with it?`);
    }
    
    // If we have too few starters, add some generic ones
    if (starters.length < 3) {
      starters.push("What's something you're working on or learning right now that excites you?");
      starters.push("If we were to collaborate on a project, what kind of contribution would you most enjoy making?");
    }
    
    return starters.slice(0, 4); // Return at most 4 conversation starters
  };
  
  // Generate recommended activities based on interests, traits, and bio information
  const generateRecommendedActivities = () => {
    if (!overlapData) return [];
    
    const activities = [];
    
    // Bio-derived activity suggestions
    if (targetUserBio && targetUserBio.length > 20) {
      // Look for keywords that might suggest interesting activities
      const creativityKeywords = ['create', 'build', 'design', 'craft', 'art', 'paint', 'draw', 'write', 'music', 'play'];
      const technologyKeywords = ['tech', 'code', 'program', 'develop', 'software', 'app', 'digital', 'AI', 'data'];
      const outdoorKeywords = ['hike', 'travel', 'outdoor', 'nature', 'sport', 'run', 'bike', 'climb', 'adventure'];
      const businessKeywords = ['business', 'startup', 'entrepreneur', 'company', 'industry', 'market', 'strategy'];
      
      const bioLower = targetUserBio.toLowerCase();
      
      // Check for activity keywords in bio
      const hasCreativeElements = creativityKeywords.some(word => bioLower.includes(word));
      const hasTechElements = technologyKeywords.some(word => bioLower.includes(word));
      const hasOutdoorElements = outdoorKeywords.some(word => bioLower.includes(word));
      const hasBusinessElements = businessKeywords.some(word => bioLower.includes(word));
      
      if (hasCreativeElements) {
        activities.push(`Plan a creative session inspired by ${targetUser.displayName || targetUser.username}'s background - perhaps a collaborative art or design project.`);
      }
      
      if (hasTechElements) {
        activities.push(`Explore a tech-focused project together, drawing on their experience with digital tools and development.`);
      }
      
      if (hasOutdoorElements) {
        activities.push(`Schedule an outdoor activity that allows you to connect while enjoying nature and active experiences.`);
      }
      
      if (hasBusinessElements) {
        activities.push(`Organize a brainstorming session on a business concept or entrepreneurial idea that combines both your perspectives.`);
      }
    }
    
    // Shared interest activities
    if (overlapData.similarInterests.length > 0 && activities.length < 4) {
      const interest = overlapData.similarInterests[0];
      activities.push(`Attend a ${interest} workshop or event together to deepen your shared knowledge.`);
      
      if (overlapData.similarInterests.length > 1 && activities.length < 4) {
        const interest2 = overlapData.similarInterests[1];
        activities.push(`Start a mini-project combining elements of ${interest} and ${interest2}.`);
      }
    }
    
    // Activity based on different interests - learning opportunity
    if (overlapData.uniqueTargetUserInterests.length > 0 && overlapData.uniqueCurrentUserInterests.length > 0 && activities.length < 4) {
      const theirInterest = overlapData.uniqueTargetUserInterests[0];
      const yourInterest = overlapData.uniqueCurrentUserInterests[0];
      activities.push(`Set up a skill exchange: you teach them about ${yourInterest} while they introduce you to ${theirInterest}.`);
    } else if (overlapData.uniqueTargetUserInterests.length > 0 && activities.length < 4) {
      activities.push(`Ask them to introduce you to ${overlapData.uniqueTargetUserInterests[0]} through a beginner-friendly activity.`);
    }
    
    // General recommendation based on compatibility score
    if (activities.length < 4) {
      if (overlapData.overlapScore > 0.7) {
        activities.push("Schedule a collaborative brainstorming session to explore projects that leverage your strong compatibility.");
      } else if (overlapData.overlapScore > 0.4) {
        activities.push("Arrange an informal meetup in a neutral setting to explore your balanced mix of similarities and differences.");
      } else {
        activities.push("Plan a cultural exchange activity where you can both share unique perspectives from your diverse backgrounds.");
      }
    }
    
    return activities.slice(0, 4); // Limit to 4 activities
  };
  
  // Generate compatibility badges based on overlap metrics including bio information
  const generateCompatibilityBadges = () => {
    if (!overlapData) return [];
    
    const badges = [];
    
    // Bio-based compatibility badges
    if (targetUserBio && targetUserBio.length > 100 && currentUserBio && currentUserBio.length > 100) {
      // Check for shared themes in bios
      const bioKeywordSets = [
        { 
          name: "Creative Mind", 
          description: "Both your bios show creative inclinations", 
          keywords: ['create', 'design', 'art', 'creative', 'craft', 'build', 'make', 'music', 'draw', 'paint'],
          iconType: "Lightbulb",
          color: "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-600/50"
        },
        {
          name: "Tech Explorers",
          description: "You both show interest in technology",
          keywords: ['tech', 'code', 'software', 'program', 'develop', 'engineering', 'digital', 'ai', 'app', 'data'],
          iconType: "Zap",
          color: "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-600/50"
        },
        {
          name: "Knowledge Seekers",
          description: "You both value learning and growth",
          keywords: ['learn', 'study', 'read', 'book', 'knowledge', 'education', 'curious', 'explore', 'discover', 'growth'],
          iconType: "BookOpen",
          color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600/50"
        },
        {
          name: "Social Connectors",
          description: "You both value community and relationships",
          keywords: ['people', 'connect', 'community', 'social', 'team', 'collaborate', 'together', 'relation', 'network', 'group'],
          iconType: "Users",
          color: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-600/50"
        }
      ];
      
      const currentUserBioLower = currentUserBio.toLowerCase();
      const targetUserBioLower = targetUserBio.toLowerCase();
      
      for (const set of bioKeywordSets) {
        const userHasKeywords = set.keywords.some(word => currentUserBioLower.includes(word));
        const targetHasKeywords = set.keywords.some(word => targetUserBioLower.includes(word));
        
        if (userHasKeywords && targetHasKeywords) {
          badges.push({
            name: set.name,
            description: set.description,
            iconType: set.iconType,
            color: set.color
          });
          break; // Only add one bio-based badge to avoid overwhelming
        }
      }
    }
    
    // Bio-complementary badge (different yet complementary backgrounds)
    if (currentUserBio && targetUserBio && currentUserBio.length > 50 && targetUserBio.length > 50) {
      const professionalTerms = ['work', 'career', 'job', 'professional', 'business'];
      const creativeTerms = ['art', 'music', 'creative', 'design'];
      
      const userHasProfessional = professionalTerms.some(term => currentUserBio.toLowerCase().includes(term));
      const targetHasCreative = creativeTerms.some(term => targetUserBio.toLowerCase().includes(term));
      
      const userHasCreative = creativeTerms.some(term => currentUserBio.toLowerCase().includes(term));
      const targetHasProfessional = professionalTerms.some(term => targetUserBio.toLowerCase().includes(term));
      
      if ((userHasProfessional && targetHasCreative) || (userHasCreative && targetHasProfessional)) {
        badges.push({
          name: "Complementary Mindsets",
          description: "Your backgrounds balance practicality and creativity",
          iconType: "Puzzle",
          color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600/50"
        });
      }
    }
    
    // Common interests badge
    if (overlapData.similarInterests.length >= 3 && badges.length < 4) {
      badges.push({
        name: "Interest Aligned",
        description: "You share multiple common interests",
        iconType: "Heart",
        color: "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-600/50"
      });
    }
    
    // Common identity traits badge
    if (overlapData.commonIdentities.length >= 2 && badges.length < 4) {
      badges.push({
        name: "Identity Match",
        description: "You share important background traits",
        iconType: "Globe",
        color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600/50"
      });
    }
    
    // High overall compatibility badge
    if (overlapData.overlapScore > 0.7 && badges.length < 4) {
      badges.push({
        name: "Strong Synergy",
        description: "Your profiles have high overall compatibility",
        iconType: "Stars",
        color: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600/50"
      });
    }
    
    // Complementary skills badge (different interests)
    if (overlapData.uniqueCurrentUserInterests.length >= 2 && overlapData.uniqueTargetUserInterests.length >= 2 && badges.length < 4) {
      badges.push({
        name: "Skill Diversity",
        description: "You bring complementary interests to the table",
        iconType: "Puzzle",
        color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600/50"
      });
    }
    
    // Different but compatible badge
    if (Object.keys(overlapData.differentIdentities).length > 0 && overlapData.similarInterests.length > 0 && badges.length < 4) {
      badges.push({
        name: "Bridge Builder",
        description: "You connect across different backgrounds",
        iconType: "Zap",
        color: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-600/50"
      });
    }
    
    // Innovation potential badge
    if (overlapData.uniqueCurrentUserInterests.length > 0 && overlapData.uniqueTargetUserInterests.length > 0 && overlapData.similarInterests.length > 0 && badges.length < 4) {
      badges.push({
        name: "Innovation Potential",
        description: "Your diverse yet compatible perspectives foster creativity",
        iconType: "Lightbulb",
        color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600/50"
      });
    }
    
    // Growth opportunity badge for low overlap
    if (overlapData.overlapScore < 0.4 && badges.length < 4) {
      badges.push({
        name: "Growth Catalyst",
        description: "Your differences offer opportunities for mutual growth",
        iconType: "Sprout",
        color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600/50"
      });
    }
    
    return badges.slice(0, 3); // Return at most 3 badges
  };
  
  const conversationStarters = generateConversationStarters();
  const recommendedActivities = generateRecommendedActivities();
  const compatibilityBadges = generateCompatibilityBadges();
  
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
                <p className="text-sm mb-3">
                  {overlapData.commonIdentities.length > 0 
                    ? `You have ${overlapData.commonIdentities.length} identity traits in common, creating a solid foundation for connection.`
                    : "Your diverse backgrounds offer a rich opportunity for cultural exchange!"}
                </p>
                
                {/* Bio-derived insights */}
                {(currentUserBio || targetUserBio) && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center">
                      <Lightbulb className="h-3.5 w-3.5 mr-1" /> Bio-Based Insights
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-200">
                      {targetUserBio 
                        ? `${targetUser.displayName || targetUser.username}'s bio reveals ${targetUserBio.length > 100 
                          ? 'rich detail about their personal journey' 
                          : 'key aspects of their interests'} that might complement your own background.`
                        : currentUserBio 
                          ? "Your detailed bio provides rich context about your interests and experiences." 
                          : "Add more to your bio to unlock deeper connection insights!"
                      }
                    </p>
                  </div>
                )}
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

      {/* Compatibility Badges Section */}
      {overlapData && compatibilityBadges.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Compatibility Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {compatibilityBadges.map((badge, idx) => {
                // Render the appropriate icon based on badge type
                return (
                  <div 
                    key={idx}
                    className={`${badge.color} rounded-lg p-4 border flex flex-col items-center text-center transition-transform hover:scale-105`}
                  >
                    <div className="mb-2">
                      {badge.iconType === "Heart" && <Heart className="h-8 w-8" />}
                      {badge.iconType === "Globe" && <Globe className="h-8 w-8" />}
                      {badge.iconType === "Puzzle" && <Puzzle className="h-8 w-8" />}
                      {badge.iconType === "Stars" && <Stars className="h-8 w-8" />}
                      {badge.iconType === "Zap" && <Zap className="h-8 w-8" />}
                      {badge.iconType === "Lightbulb" && <Lightbulb className="h-8 w-8" />}
                      {badge.iconType === "Sprout" && <Sprout className="h-8 w-8" />}
                      {badge.iconType === "BookOpen" && <BookOpen className="h-8 w-8" />}
                      {badge.iconType === "Users" && <Users className="h-8 w-8" />}
                    </div>
                    <h3 className="font-semibold text-base mb-1">{badge.name}</h3>
                    <p className="text-xs">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Starters Section */}
      {overlapData && conversationStarters.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>Conversation Starters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversationStarters.map((starter, idx) => (
                <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm">{starter}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Activities Section */}
      {overlapData && recommendedActivities.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <span>Recommended Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedActivities.map((activity, idx) => (
                <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm">{activity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* What You Can Learn From Each Other */}
      {overlapData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <span>What You Can Learn From Each Other</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold mb-2">What you can teach them:</h3>
                <div className="space-y-2">
                  {overlapData.uniqueCurrentUserInterests.length > 0 ? (
                    overlapData.uniqueCurrentUserInterests.slice(0, 3).map((interest, idx) => (
                      <p key={idx} className="text-sm">{interest}</p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">You have similar interests!</p>
                  )}
                  
                  {/* Bio-derived insights for teaching */}
                  {currentUserBio && currentUserBio.length > 20 && (
                    <div className="mt-3 border-t border-blue-200 dark:border-blue-800 pt-2">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" /> From your bio:
                      </p>
                      <p className="text-xs mt-1 text-blue-600/80 dark:text-blue-400/90 italic line-clamp-2">
                        "{currentUserBio}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold mb-2">What you can learn from them:</h3>
                <div className="space-y-2">
                  {overlapData.uniqueTargetUserInterests.length > 0 ? (
                    overlapData.uniqueTargetUserInterests.slice(0, 3).map((interest, idx) => (
                      <p key={idx} className="text-sm">{interest}</p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">They have similar interests to yours!</p>
                  )}
                  
                  {/* Bio-derived insights for learning */}
                  {targetUserBio && targetUserBio.length > 20 && (
                    <div className="mt-3 border-t border-purple-200 dark:border-purple-800 pt-2">
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-medium flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" /> From their bio:
                      </p>
                      <p className="text-xs mt-1 text-purple-600/80 dark:text-purple-400/90 italic line-clamp-2">
                        "{targetUserBio}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Card (Collapsible) */}
      <Card className="mb-8">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
        >
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Detailed Analysis</span>
            </div>
            <div className="text-muted-foreground">
              {isAnalysisExpanded ? 
                <ChevronUp className="h-5 w-5" /> : 
                <ChevronDown className="h-5 w-5" />
              }
            </div>
          </CardTitle>
        </CardHeader>
        {isAnalysisExpanded && (
          <CardContent className="space-y-6">
            {/* Analysis Content */}
            {loadingOverlap ? (
              <div className="text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />
                <p>Generating comparison...</p>
              </div>
            ) : overlapData?.analysis && overlapData.analysis.trim() !== "" && overlapData.analysis !== "Detailed analysis not available" ? (
              <div className="prose max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:scroll-m-20">
                {overlapData.analysis.split('\n').map((paragraph, idx) => 
                  paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                )}
              </div>
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
                  <GptButton
                    size="sm"
                    variant="outline"
                    onClick={regenerateAnalysis}
                    className="gap-2"
                    isLoading={isGenerating}
                    loadingText="Generating..."
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate Detailed Analysis
                  </GptButton>
                </div>
              </div>
            )}
            
            {/* AI Thought Stream Section */}
            {showThoughtStream && (
              <div className="p-4 bg-muted/30 rounded-md border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-primary" />
                    AI Reasoning Process
                  </h3>
                  <div className="flex gap-2">
                    {!isStreaming ? (
                      <GptButton 
                        size="sm" 
                        variant="outline"
                        onClick={startStreamingAnalysis}
                        isLoading={false}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Start Streaming
                      </GptButton>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={stopStreamingAnalysis}
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* ThoughtStream Component */}
                <ThoughtStream
                  targetText={streamingThoughts}
                  isLoading={isStreaming && streamingThoughts.length === 0}
                  className="text-xs"
                />
                
                {/* Streaming Results */}
                {streamingAnalysis && (
                  <div className="mt-4 p-3 bg-primary/5 rounded border border-primary/20">
                    <h4 className="text-sm font-medium mb-2">Stream Results:</h4>
                    <p className="text-xs text-muted-foreground">
                      Overall Score: {Math.round((streamingAnalysis.overallScore || 0) * 100)}%
                    </p>
                    {streamingAnalysis.keyInsights && streamingAnalysis.keyInsights.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Key Insights:</p>
                        <ul className="text-xs mt-1 space-y-1">
                          {streamingAnalysis.keyInsights.slice(0, 3).map((insight: string, i: number) => (
                            <li key={i} className="text-muted-foreground">• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
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