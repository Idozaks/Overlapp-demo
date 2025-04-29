import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  BarChart2, 
  RefreshCw, 
  Share2, 
  Download, 
  Save, 
  Sparkles, 
  MessageCircle,
  Globe,
  MapPin,
  User,
  Clock,
  Check,
  Zap,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// This is a flexible overlap analysis page that works with all three entity types
export function AnalyzeOverlap() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('visualization');
  
  // Get entity type and ID from the URL
  const entityType = params.type || 'persona'; // Default to persona if not specified
  const entityId = params.id ? parseInt(params.id) : 0;
  
  // State for the compatibility scores
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [uniqueInterests, setUniqueInterests] = useState<string[]>([]);
  const [conversationStarters, setConversationStarters] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Animation effect for the compatibility score
  useEffect(() => {
    // Generate a sample score between 65 and 95 for demo purposes
    const score = Math.floor(Math.random() * 30) + 65;
    
    // Animate the score counting up
    let currentScore = 0;
    const interval = setInterval(() => {
      currentScore += 1;
      setCompatibilityScore(currentScore);
      if (currentScore >= score) {
        clearInterval(interval);
      }
    }, 20);
    
    return () => clearInterval(interval);
  }, [entityId, entityType]);
  
  // Fetch entity data using the enhanced overlap analysis API
  const { data, isLoading } = useQuery({
    queryKey: [`/api/analyze/${entityType}/${entityId}`],
    enabled: !!entityId && !!user?.id,
    queryFn: async () => {
      console.log(`Fetching real entity data for ${entityType}/${entityId}`);
      
      const response = await fetch(`/api/analyze/${entityType}/${entityId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Entity overlap API error:", errorText);
        throw new Error('Failed to fetch entity overlap analysis: ' + errorText);
      }
      
      return response.json();
    }
  });
  
  // When data is loaded, update the state
  useEffect(() => {
    if (data?.overlap) {
      setSharedInterests(data.overlap.sharedInterests);
      setUniqueInterests(data.overlap.uniqueInterests);
      setConversationStarters(data.overlap.conversationStarters);
    }
  }, [data]);
  
  // Enhanced analysis is already performed by the API endpoint,
  // so this function just enables the UI to show it
  const generateAIAnalysis = async () => {
    if (!data?.entity || !data?.overlap) return;
    
    setIsGeneratingAI(true);
    try {
      // We already have the enhanced analysis data from the API response
      // Just update the UI with the relevant information
      
      // Create analysis from the overlap data
      const enhancedAnalysis = {
        compatibilityScore: data.overlap.score,
        compatibilityReasoning: data.overlap.summary || "Based on your shared interests and values, we've analyzed your compatibility with this entity.",
        topMatchCategories: [
          { 
            category: "Interests Alignment", 
            score: data.overlap.dimensionalScores?.interests ? Math.round(data.overlap.dimensionalScores.interests * 100) : 85
          },
          { 
            category: "Relevance", 
            score: data.overlap.dimensionalScores?.relevance ? Math.round(data.overlap.dimensionalScores.relevance * 100) : 80
          },
          { 
            category: "Engagement Value", 
            score: data.overlap.dimensionalScores?.engagement ? Math.round(data.overlap.dimensionalScores.engagement * 100) : 75
          }
        ],
        conversationStarters: data.overlap.conversationStarters || [],
        insightSummary: data.overlap.detailedAnalysis || "You share several key interests that provide a strong foundation for meaningful engagement.",
        keyInsights: data.overlap.keyInsights || []
      };
      
      setAiAnalysis(enhancedAnalysis);
      
      // Update the compatibility score with the data from API
      if (data.overlap.score) {
        // Animate to the new score
        let currentScore = compatibilityScore;
        const targetScore = Math.round(data.overlap.score);
        const step = currentScore < targetScore ? 1 : -1;
        
        const interval = setInterval(() => {
          currentScore += step;
          setCompatibilityScore(currentScore);
          if ((step > 0 && currentScore >= targetScore) || 
              (step < 0 && currentScore <= targetScore)) {
            clearInterval(interval);
            setCompatibilityScore(targetScore);
          }
        }, 20);
      }
      
      // Update conversation starters if available
      if (data.overlap.conversationStarters && data.overlap.conversationStarters.length > 0) {
        setConversationStarters(data.overlap.conversationStarters);
      }
      
      // Always switch to the AI analysis tab
      setActiveTab('ai-analysis');
      
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: "Analysis Error",
        description: "We couldn't display the AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // Helper function to get the right icon for entity type
  const getEntityIcon = () => {
    switch (entityType) {
      case 'persona':
        return <User className="h-5 w-5" />;
      case 'online':
        return <Globe className="h-5 w-5" />;
      case 'physical':
        return <MapPin className="h-5 w-5" />;
      default:
        return <BarChart2 className="h-5 w-5" />;
    }
  };
  
  // Helper function to get back path based on entity type
  const getBackPath = () => {
    switch (entityType) {
      case 'persona':
        return '/engage/persona';
      case 'online':
        return '/engage/online';
      case 'physical':
        return '/engage/offline';
      default:
        return '/engage';
    }
  };
  
  // Helper function to generate fallback analysis when detailed analysis is missing
  const generateFallbackAnalysis = (data: any) => {
    if (!data || !data.entity || !data.overlap) {
      return "Analysis data is currently unavailable. Please try regenerating the analysis.";
    }
    
    const { entity, overlap } = data;
    const name = entity.name || "this user";
    const score = overlap.score || 0;
    const sharedInterestsCount = (overlap.sharedInterests || []).length;
    
    if (score > 75) {
      return `You have a strong compatibility with ${name}. With ${sharedInterestsCount} shared interests, you have many topics to explore together. This high level of common ground creates an excellent foundation for meaningful interaction and collaboration.`;
    } else if (score > 50) {
      return `You have a moderate compatibility with ${name}. The ${sharedInterestsCount} shared interests provide good conversation starters. While you have similarities, your differences present opportunities to learn from each other and expand your horizons.`;
    } else {
      return `You have unique perspectives compared to ${name}. While you may not share many common interests (${sharedInterestsCount} found), this diversity offers valuable opportunities for learning and growth. Consider exploring their interests to broaden your knowledge and experience.`;
    }
  };
  
  // Dynamic rendering for the entity header
  const renderEntityHeader = () => {
    if (!data?.entity) return null;
    
    if (entityType === 'persona') {
      return (
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={data.entity.avatar} alt={data.entity.name} />
            <AvatarFallback>{data.entity.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{data.entity.name}</h2>
            <div className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> 
              {data.entity.occupation} • {data.entity.location}
            </div>
          </div>
        </div>
      );
    } else if (entityType === 'online') {
      return (
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Globe className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{data.entity.name}</h2>
            <div className="text-muted-foreground flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">{data.entity.category}</Badge>
              <span>•</span>
              <span className="text-sm">{data.entity.description}</span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{data.entity.name}</h2>
            <div className="text-muted-foreground flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">{data.entity.category}</Badge>
              <span>•</span>
              <span className="text-sm">{data.entity.address}</span>
            </div>
          </div>
        </div>
      );
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Analyzing Overlap</h2>
        <p className="text-muted-foreground">Please wait while we analyze your compatibility...</p>
      </div>
    );
  }
  
  // Error state - entity not found
  if (!data?.entity) {
    return (
      <div className="container py-12 text-center max-w-lg mx-auto">
        <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Entity Not Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't find the entity you're looking for. It may have been removed or you may not have access.
        </p>
        <Button onClick={() => setLocation('/engage')}>
          Return to Engage
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link href={getBackPath()}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {getEntityIcon()}
            <span className="ml-1 capitalize">{entityType} Analysis</span>
          </Badge>
          
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Entity Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Overlap Analysis
                </CardTitle>
                <CardDescription>
                  Analyzing compatibility between you and {data.entity.name}
                </CardDescription>
              </div>
              <div className="text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <div className="text-2xl font-bold">{compatibilityScore}%</div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground mt-2 block">Compatibility</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="visualization" className="flex-1">Visualization</TabsTrigger>
                <TabsTrigger value="interests" className="flex-1">Shared Interests</TabsTrigger>
                <TabsTrigger value="convo" className="flex-1">Conversation Starters</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="flex-1">AI Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="visualization" className="mt-6">
                <div className="flex flex-col items-center">
                  {/* Venn Diagram Visualization */}
                  <div className="relative w-full max-w-lg h-64 mb-6">
                    {/* Left Circle - Your Interests */}
                    <div className="absolute left-12 w-56 h-56 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <span className="font-semibold text-blue-700">Your Interests</span>
                    </div>
                    
                    {/* Right Circle - Entity's Interests */}
                    <div className="absolute right-12 w-56 h-56 rounded-full bg-green-500/30 flex items-center justify-center">
                      <span className="font-semibold text-green-700">
                        {data.entity.name.split(' ')[0]}'s Interests
                      </span>
                    </div>
                    
                    {/* Overlapping section */}
                    <div className="absolute left-0 right-0 mx-auto w-40 h-40 top-8 rounded-full bg-primary/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-bold text-lg text-primary">{sharedInterests.length}</div>
                        <div className="text-xs text-primary/90">Shared Interests</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 w-full mt-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-center">Your Identity Facets</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Technology Enthusiast</span>
                        </li>
                        <li className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Outdoor Adventurer</span>
                        </li>
                        <li className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Creative Explorer</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2 text-center">Matching Identity Facets</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 p-2 bg-primary/10 rounded">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>Technology Enthusiast</span>
                        </li>
                        <li className="flex items-center gap-2 p-2 bg-primary/10 rounded">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>Creative Explorer</span>
                        </li>
                        <li className="flex items-center gap-2 p-2 bg-muted/50 rounded opacity-50">
                          <span className="ml-6">Outdoor Adventurer</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="interests" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <div className="bg-primary/20 p-1 rounded">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      Shared Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sharedInterests.map((interest: string, index: number) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <div className="bg-blue-500/20 p-1 rounded">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        Your Unique Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueInterests.map((interest: string, index: number) => (
                          <Badge key={index} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <div className="bg-green-500/20 p-1 rounded">
                          {entityType === 'persona' ? (
                            <User className="h-4 w-4 text-green-600" />
                          ) : entityType === 'online' ? (
                            <Globe className="h-4 w-4 text-green-600" />
                          ) : (
                            <MapPin className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        {data.entity.name.split(' ')[0]}'s Unique Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Design</Badge>
                        <Badge variant="outline">Marketing</Badge>
                        <Badge variant="outline">Entrepreneurship</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Compatibility by Category</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Technology</span>
                          <span className="font-medium">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Creative Pursuits</span>
                          <span className="font-medium">82%</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Outdoor Activities</span>
                          <span className="font-medium">70%</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="convo" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-muted/20 p-4 rounded-lg border border-muted">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">AI-Generated Conversation Starters</h3>
                        <p className="text-sm text-muted-foreground">
                          Based on your shared interests, here are some conversation topics
                        </p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 pl-12">
                      {conversationStarters.map((starter: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-primary">{index + 1}</span>
                          </div>
                          <p className="text-sm">{starter}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <Button className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Start Conversation
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ai-analysis" className="mt-6">
                {aiAnalysis ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">AI-Powered Compatibility Analysis</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={generateAIAnalysis}
                        disabled={isGeneratingAI}
                        className="gap-2"
                      >
                        {isGeneratingAI ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Refresh Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">Compatibility Assessment</h3>
                          <p className="text-sm text-muted-foreground">
                            {aiAnalysis.compatibilityReasoning || data.overlap.summary || "Based on your shared interests and values, we've analyzed your compatibility."}
                          </p>
                        </div>
                      </div>
                    </div>
                      
                    {/* Top Match Categories */}
                    <div>
                      <h3 className="font-medium mb-3">Compatibility Dimensions</h3>
                      <div className="space-y-3">
                        {Array.isArray(aiAnalysis.topMatchCategories) && aiAnalysis.topMatchCategories.length > 0 ? (
                          aiAnalysis.topMatchCategories.map((category: {category: string, score: number}, index: number) => (
                            <div key={index}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>{category.category}</span>
                                <span className="font-medium">{category.score}%</span>
                              </div>
                              <Progress value={category.score} className="h-2" />
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No match categories available.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Key Insights */}
                    {Array.isArray(aiAnalysis.keyInsights) && aiAnalysis.keyInsights.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Key Insights</h3>
                        <ul className="space-y-2">
                          {aiAnalysis.keyInsights.map((insight: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="mt-0.5"><Check className="h-4 w-4 text-primary" /></div>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Insight Summary */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h3 className="font-medium mb-2">Detailed Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        {aiAnalysis?.insightSummary || data?.overlap?.detailedAnalysis || "You share several key interests that provide a strong foundation for meaningful engagement."}
                      </p>
                    </div>
                    
                    {/* Recommended Activities */}
                    {data.overlap.recommendedActivities && (
                      <div>
                        <h3 className="font-medium mb-2">Recommended Activities</h3>
                        
                        {data.overlap.recommendedActivities.quick && data.overlap.recommendedActivities.quick.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Quick Wins
                            </h4>
                            <ul className="space-y-1">
                              {data.overlap.recommendedActivities.quick.map((activity: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground pl-5 relative">
                                  <span className="absolute left-0 top-1.5 w-3 h-0.5 bg-primary"></span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {data.overlap.recommendedActivities.projects && data.overlap.recommendedActivities.projects.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Projects
                            </h4>
                            <ul className="space-y-1">
                              {data.overlap.recommendedActivities.projects.map((activity: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground pl-5 relative">
                                  <span className="absolute left-0 top-1.5 w-3 h-0.5 bg-primary"></span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {data.overlap.recommendedActivities.learning && data.overlap.recommendedActivities.learning.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> Learning
                            </h4>
                            <ul className="space-y-1">
                              {data.overlap.recommendedActivities.learning.map((activity: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground pl-5 relative">
                                  <span className="absolute left-0 top-1.5 w-3 h-0.5 bg-primary"></span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mb-4">
                      <Sparkles className="h-10 w-10 text-primary/40 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">AI Analysis Not Generated Yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      View enhanced AI analysis of your compatibility with {data.entity.name}, 
                      including personalized insights and recommendations.
                    </p>
                    <Button 
                      onClick={generateAIAnalysis} 
                      disabled={isGeneratingAI}
                      className="gap-2"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Show Enhanced Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Analysis performed {new Date().toLocaleString()}
            </div>
            
            <div className="flex items-center gap-2">
              {!aiAnalysis && (
                <Button 
                  onClick={generateAIAnalysis} 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {isGeneratingAI ? 'Generating...' : 'AI Analysis'}
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1">
                <Save className="h-3 w-3" /> Save Analysis
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Entity Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getEntityIcon()}
              <span className="capitalize">{entityType} Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderEntityHeader()}
            
            <Separator className="my-6" />
            
            <div className="space-y-6">
              {entityType === 'persona' && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.entity.bio}
                  </p>
                </div>
              )}
              
              {entityType === 'online' && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.entity.description}
                  </p>
                  
                  <div className="mt-4">
                    <Button variant="outline" className="gap-2 text-sm" size="sm">
                      <Globe className="h-3 w-3" />
                      Visit Website
                    </Button>
                  </div>
                </div>
              )}
              
              {entityType === 'physical' && (
                <div>
                  <h3 className="text-sm font-medium mb-2">About this location</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.entity.description}
                  </p>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="gap-2 text-sm" size="sm">
                      <MapPin className="h-3 w-3" />
                      Get Directions
                    </Button>
                    
                    <Button variant="outline" className="gap-2 text-sm" size="sm">
                      <Calendar className="h-3 w-3" />
                      View Events
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyzeOverlap;