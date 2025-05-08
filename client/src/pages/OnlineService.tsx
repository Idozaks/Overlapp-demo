import { FC, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  SearchIcon, 
  GlobeIcon, 
  ExternalLinkIcon, 
  SettingsIcon, 
  StarIcon, 
  TagIcon, 
  SparklesIcon, 
  Loader2, 
  ArrowRightIcon,
  BookmarkIcon,
  ThumbsUpIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type OnlineService = {
  id: number;
  name: string;
  description: string;
  category: string;
  url: string;
  rating?: number;
  tags: string[];
  features: string[];
  matchScore?: number;
  iconUrl?: string;
}

interface ServiceAnalysis {
  matchScore: number;
  analysisReasoning: string;
  matchingInterests: string[];
  alternatives: {
    name: string;
    url: string;
    matchScore: number;
  }[];
  recommendations: string[];
}

const OnlineService: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedService, setSelectedService] = useState<OnlineService | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState<boolean>(false);
  const [serviceAnalysis, setServiceAnalysis] = useState<ServiceAnalysis | null>(null);
  const { toast } = useToast();
  
  // Get online services
  const { data: servicesData, isLoading, refetch } = useQuery<{services: OnlineService[]}>({
    queryKey: ['/api/services', searchQuery],
    enabled: true,
  });
  
  // Mutation for service analysis
  const analyzeService = useMutation({
    mutationFn: async (service: OnlineService) => {
      try {
        console.log("Sending service analysis request for:", service.name);
        
        const response = await apiRequest('/api/services/analyze', {
          method: 'POST',
          body: {
            serviceId: service.id
          }
        });
        
        console.log("Service analysis response:", response);
        return response as ServiceAnalysis;
      } catch (error) {
        console.error("Service analysis error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setServiceAnalysis(data);
      setAnalysisOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Service analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze service",
        variant: "destructive"
      });
    }
  });
  
  // Simulated online services data
  const mockServices: OnlineService[] = [
    {
      id: 1,
      name: "Spotify",
      description: "Digital music streaming service offering access to millions of songs and podcasts.",
      category: "Entertainment",
      url: "https://spotify.com",
      rating: 4.7,
      tags: ["Music", "Streaming", "Podcasts", "Audio"],
      features: ["Personalized Playlists", "Offline Listening", "Podcast Library"],
      matchScore: 85,
      iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><circle cx='50' cy='50' r='45' fill='%231DB954'/><circle cx='50' cy='50' r='20' fill='%23191414'/></svg>"
    },
    {
      id: 2,
      name: "Notion",
      description: "All-in-one workspace for notes, tasks, wikis, and databases with customizable templates.",
      category: "Productivity",
      url: "https://notion.so",
      rating: 4.8,
      tags: ["Productivity", "Notes", "Tasks", "Collaboration"],
      features: ["Rich Text Editor", "Database Views", "Team Collaboration"],
      matchScore: 78,
      iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='10' fill='%23FFFFFF'/><rect x='20' y='20' width='60' height='60' rx='5' fill='%23000000'/></svg>"
    },
    {
      id: 3,
      name: "Figma",
      description: "Cloud-based design tool for interface design, prototyping, and collaboration.",
      category: "Design",
      url: "https://figma.com",
      rating: 4.9,
      tags: ["Design", "UI/UX", "Prototyping", "Collaboration"],
      features: ["Real-time Collaboration", "Component Libraries", "Prototyping"],
      matchScore: 92,
      iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='10' fill='%23F24E1E'/><circle cx='50' cy='50' r='20' fill='%23FFFFFF'/></svg>"
    },
    {
      id: 4,
      name: "Canva",
      description: "Graphic design platform for creating social media graphics, presentations, and more.",
      category: "Design",
      url: "https://canva.com",
      rating: 4.7,
      tags: ["Design", "Graphics", "Templates", "Social Media"],
      features: ["Template Library", "Photo Editing", "Brand Kit"],
      matchScore: 75,
      iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='10' fill='%2300C4CC'/><path d='M30,30 L70,30 L70,70 L30,70 Z' fill='%23FFFFFF'/></svg>"
    },
    {
      id: 5,
      name: "Duolingo",
      description: "Language learning platform with gamified lessons for multiple languages.",
      category: "Education",
      url: "https://duolingo.com",
      rating: 4.6,
      tags: ["Education", "Languages", "Learning", "Mobile"],
      features: ["Gamified Learning", "Progress Tracking", "Multiple Languages"],
      matchScore: 68,
      iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='10' fill='%2358CC02'/><circle cx='50' cy='50' r='25' fill='%23FFFFFF'/></svg>"
    }
  ];
  
  // Filter services based on search query
  const filterServices = (services: OnlineService[], query: string) => {
    if (!query) return services;
    
    const lowerQuery = query.toLowerCase();
    return services.filter(service => 
      service.name.toLowerCase().includes(lowerQuery) || 
      service.description.toLowerCase().includes(lowerQuery) ||
      service.category.toLowerCase().includes(lowerQuery) ||
      service.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };
  
  // For demo purposes, use mock data
  const displayedServices = filterServices(servicesData?.services || mockServices, searchQuery);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Find Online Services</h1>
        <p className="text-muted-foreground mb-6">
          Discover digital tools and services that match your interests and needs
        </p>
        
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or feature"
              className="pl-10"
            />
          </div>
          <Button type="submit">
            Search
          </Button>
        </form>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-36 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-2 w-full mt-6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayedServices.length === 0 ? (
        <div className="text-center py-12">
          <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-muted-foreground mb-4">
            Try searching for different terms or categories.
          </p>
          <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedServices.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {service.iconUrl ? (
                      <img 
                        src={service.iconUrl} 
                        alt={service.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <TagIcon className="w-3 h-3 mr-1" />
                      <span>{service.category}</span>
                      
                      {service.rating && (
                        <>
                          <span className="mx-1">•</span>
                          <StarIcon className="w-3 h-3 text-yellow-500 mr-1" />
                          <span>{service.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <a 
                    href={service.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    <GlobeIcon className="w-3 h-3" />
                    Visit
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
                
                <p className="text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">Key Features</div>
                  <ul className="text-sm">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 mb-1">
                        <ArrowRightIcon className="w-3 h-3 mt-1 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Match with Your Interests</span>
                    <div className="flex items-center mt-1">
                      <Progress value={service.matchScore} className="h-1.5 w-32 mr-2" />
                      <span className="text-xs font-semibold">{service.matchScore}%</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <BookmarkIcon className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedService(service);
                        analyzeService.mutate(service);
                      }}
                      disabled={analyzeService.isPending && selectedService?.id === service.id}
                    >
                      {analyzeService.isPending && selectedService?.id === service.id ? (
                        <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Analyzing</>
                      ) : (
                        <><SparklesIcon className="w-3 h-3 mr-2" /> Analyze Fit</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Service Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              Service Analysis
            </DialogTitle>
            <DialogDescription>
              {selectedService && (
                <span>How {selectedService.name} fits your interests and needs</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {serviceAnalysis && (
            <div className="space-y-4 my-2 overflow-y-auto pr-2 flex-grow">
              {/* Match Score */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Match Score</span>
                  <Badge 
                    className={
                      (serviceAnalysis.matchScore || 0) >= 80 
                        ? "bg-green-500" 
                        : (serviceAnalysis.matchScore || 0) >= 60 
                        ? "bg-amber-500" 
                        : "bg-red-500"
                    }
                  >
                    {serviceAnalysis.matchScore || 0}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {serviceAnalysis.analysisReasoning || "Analysis in progress. Try again in a moment."}
                </p>
              </div>
              
              {/* Matching Interests */}
              {serviceAnalysis.matchingInterests && serviceAnalysis.matchingInterests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Matching Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {serviceAnalysis.matchingInterests.map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              {serviceAnalysis.recommendations && serviceAnalysis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">How to Get the Most out of This Service</h3>
                  <ul className="space-y-2">
                    {serviceAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <ThumbsUpIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Alternatives */}
              {serviceAnalysis.alternatives && serviceAnalysis.alternatives.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Similar Alternatives</h3>
                  <div className="space-y-3">
                    {serviceAnalysis.alternatives.map((alt, i) => (
                      <div key={i} className="bg-background rounded-md p-3 border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{alt.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {alt.matchScore}% match
                          </Badge>
                        </div>
                        <a 
                          href={alt.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          {alt.url}
                          <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

export default OnlineService;