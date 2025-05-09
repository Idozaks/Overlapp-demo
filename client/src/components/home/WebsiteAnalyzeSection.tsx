import { FC, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  GlobeIcon, Loader2, SparklesIcon, ArrowRightIcon, 
  MessageCircleIcon, ShoppingCartIcon, UsersIcon, 
  NewspaperIcon, GraduationCapIcon, HeartIcon, 
  MusicIcon, PlayIcon, BookIcon, CameraIcon,
  RefreshCcw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type WebsiteAnalysisRequest = {
  url: string;
  userInterests: string[];
};

type WebsiteAnalysisResult = {
  websiteName: string;
  url: string;
  overlapScore: number;
  analysisReasoning: string;
  matchingInterests: string[];
  recommendations: string[];
  category?: string;
  description?: string;
};

type WebsiteOption = {
  id: number;
  name: string;
  url: string;
  category: string;
  icon: JSX.Element;
};

export const WebsiteAnalyzeSection: FC = () => {
  const [selectedWebsite, setSelectedWebsite] = useState<WebsiteOption | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysisResult | null>(null);
  
  // Load cached analyses from localStorage on component mount
  const [preloadedAnalyses, setPreloadedAnalyses] = useState<Record<number, WebsiteAnalysisResult>>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('website-analyses');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error('Failed to parse cached analyses', e);
          return {};
        }
      }
    }
    return {};
  });
  
  const [activePreloads, setActivePreloads] = useState<Set<number>>(new Set());
  
  // Save analyses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('website-analyses', JSON.stringify(preloadedAnalyses));
      console.log('Saved analyses to localStorage:', Object.keys(preloadedAnalyses).length);
    } catch (e) {
      console.error('Failed to save analyses to localStorage', e);
    }
  }, [preloadedAnalyses]);
  
  // Mock user interests for MVP demo
  const mockUserInterests = [
    "Technology", "Programming", "Web Development", 
    "Artificial Intelligence", "Machine Learning", 
    "Data Science", "UX/UI Design", "Startups",
    "Music", "Movies", "Education", "Shopping",
    "Photography", "Literature", "Social Media"
  ];

  // Predefined website options
  const websiteOptions: WebsiteOption[] = [
    {
      id: 1,
      name: "GitHub",
      url: "https://github.com",
      category: "Technology",
      icon: <GlobeIcon className="w-5 h-5" />
    },
    {
      id: 2,
      name: "Amazon",
      url: "https://amazon.com",
      category: "Shopping",
      icon: <ShoppingCartIcon className="w-5 h-5" />
    },
    {
      id: 3,
      name: "LinkedIn",
      url: "https://linkedin.com",
      category: "Social",
      icon: <UsersIcon className="w-5 h-5" />
    },
    {
      id: 4,
      name: "TechCrunch",
      url: "https://techcrunch.com",
      category: "News",
      icon: <NewspaperIcon className="w-5 h-5" />
    },
    {
      id: 5,
      name: "Coursera",
      url: "https://coursera.org",
      category: "Education",
      icon: <GraduationCapIcon className="w-5 h-5" />
    },
    {
      id: 6,
      name: "Etsy",
      url: "https://etsy.com",
      category: "Shopping",
      icon: <ShoppingCartIcon className="w-5 h-5" />
    },
    {
      id: 7,
      name: "Spotify",
      url: "https://spotify.com",
      category: "Music",
      icon: <MusicIcon className="w-5 h-5" />
    },
    {
      id: 8,
      name: "Netflix",
      url: "https://netflix.com",
      category: "Entertainment",
      icon: <PlayIcon className="w-5 h-5" />
    },
    {
      id: 9,
      name: "Goodreads",
      url: "https://goodreads.com",
      category: "Books",
      icon: <BookIcon className="w-5 h-5" />
    },
    {
      id: 10,
      name: "Unsplash",
      url: "https://unsplash.com",
      category: "Photography",
      icon: <CameraIcon className="w-5 h-5" />
    },
    {
      id: 11,
      name: "Medium",
      url: "https://medium.com",
      category: "Content",
      icon: <NewspaperIcon className="w-5 h-5" />
    },
    {
      id: 12,
      name: "Pinterest",
      url: "https://pinterest.com",
      category: "Social",
      icon: <HeartIcon className="w-5 h-5" />
    },
  ];

  const analyzeWebsite = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest({
        url: "/api/website/analyze",
        method: "POST",
        data: {
          url,
          userInterests: mockUserInterests,
        } as WebsiteAnalysisRequest,
      });
      return response as WebsiteAnalysisResult;
    },
    onSuccess: (data, variables) => {
      // Only open the dialog if this is the selected website
      const website = websiteOptions.find(w => w.url === variables);
      if (website && selectedWebsite && website.id === selectedWebsite.id) {
        setAnalysis(data);
        setAnalysisOpen(true);
      }
      
      // Store the preloaded analysis
      if (website) {
        setPreloadedAnalyses(prev => ({
          ...prev,
          [website.id]: data
        }));
        
        // Remove from active preloads
        setActivePreloads(prev => {
          const newSet = new Set(prev);
          newSet.delete(website.id);
          return newSet;
        });
      }
    }
  });

  // Preload analyses in the background
  useEffect(() => {
    // Get random websites to preload (3 at a time)
    const preloadCount = 3;
    const websitesToPreload = [...websiteOptions]
      .filter(w => !preloadedAnalyses[w.id] && !activePreloads.has(w.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, preloadCount);
    
    if (websitesToPreload.length === 0) return;
    
    // Mark these as active preloads
    const newActivePreloads = new Set(activePreloads);
    websitesToPreload.forEach(website => {
      newActivePreloads.add(website.id);
      // Start preloading
      analyzeWebsite.mutate(website.url);
    });
    
    setActivePreloads(newActivePreloads);
  }, [preloadedAnalyses, activePreloads]);

  const handleSelectWebsite = (website: WebsiteOption) => {
    setSelectedWebsite(website);
    
    // If analysis is already preloaded, show it immediately
    if (preloadedAnalyses[website.id]) {
      setAnalysis(preloadedAnalyses[website.id]);
      setAnalysisOpen(true);
    } else {
      // Otherwise start analysis and open dialog to show loading
      analyzeWebsite.mutate(website.url);
      setAnalysisOpen(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };
  
  // Reset all cached analyses
  const handleResetAnalyses = () => {
    console.log('Resetting all analyses...');
    // Clear localStorage and state
    localStorage.removeItem('website-analyses');
    setPreloadedAnalyses({});
    
    // Reset active preloads
    const currentActivePreloads = new Set(activePreloads);
    setActivePreloads(new Set());
    
    // Force refresh - we need to force fresh analyses from the server
    // by invalidating the mutations
    analyzeWebsite.reset();
    
    // Immediately start preloading 3 random websites with fresh data
    const websitesToPreload = [...websiteOptions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    console.log('Starting fresh preloads for:', websitesToPreload.map(w => w.name).join(', '));
    
    const newActivePreloads = new Set<number>();
    websitesToPreload.forEach(website => {
      newActivePreloads.add(website.id);
      // Use a timeout to ensure React has time to process the previous state updates
      setTimeout(() => {
        analyzeWebsite.mutate(website.url);
      }, 50);
    });
    
    setTimeout(() => {
      setActivePreloads(newActivePreloads);
    }, 50);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Website Interest Analysis</h2>
          <p className="text-muted-foreground">
            Discover how these popular websites align with your interests
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleResetAnalyses}
          className="h-8 text-xs"
        >
          <RefreshCcw className="w-3 h-3 mr-1" />
          Reset Analyses
        </Button>
      </div>

      {/* Website grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {websiteOptions.map((website) => {
          const isPreloaded = !!preloadedAnalyses[website.id];
          const isLoading = activePreloads.has(website.id);
          
          return (
            <Button
              key={website.id}
              variant="outline"
              className={`h-auto p-3 flex flex-col items-center justify-center gap-2 hover:bg-muted relative ${
                selectedWebsite?.id === website.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectWebsite(website)}
            >
              {/* Status indicator */}
              {isPreloaded && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" 
                  title="Analysis ready"></div>
              )}
              {isLoading && (
                <div className="absolute top-1 right-1 w-2 h-2">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                </div>
              )}
                
              <div className="p-2 rounded-full bg-primary/10">
                {website.icon}
              </div>
              <span className="text-xs font-medium">{website.name}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {website.category}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-teal-500" />
              Website Analysis
            </DialogTitle>
            <DialogDescription>
              {selectedWebsite && (
                <div className="flex items-center">
                  <span>Analysis for </span>
                  <a 
                    href={selectedWebsite.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center ml-1"
                  >
                    {selectedWebsite.name}
                    <ArrowRightIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {!analysis ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Analyzing website content and interests...</p>
            </div>
          ) : (
            <ScrollArea className="flex-grow my-2 pr-4">
              <div className="space-y-4">
                {/* Overlap Score */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Match Score</span>
                    <Badge 
                      className={getScoreColor(analysis.overlapScore)}
                    >
                      {analysis.overlapScore}%
                    </Badge>
                  </div>
                  <Progress 
                    value={analysis.overlapScore} 
                    className="h-2 mb-3"
                  />
                  <p className="text-sm text-muted-foreground break-words">
                    {analysis.analysisReasoning}
                  </p>
                </div>
                
                {/* Matching Interests */}
                {analysis.matchingInterests && analysis.matchingInterests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Matching Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchingInterests.map((interest, i) => (
                        <Badge key={i} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <MessageCircleIcon className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                          <span className="break-words">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="flex-shrink-0 mt-2 pt-2 border-t">
            <Button className="w-full" onClick={() => setAnalysisOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebsiteAnalyzeSection;