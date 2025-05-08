import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobeIcon, SearchIcon, UserIcon, RefreshCw, ArrowRightIcon, Share2, PlusIcon, ChevronRightIcon } from "lucide-react";

type Website = {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  overlapScore?: number;
  matchingInterests?: string[];
}

const WebsiteOverlap: FC = () => {
  const [url, setUrl] = useState<string>("");
  const [submittedUrl, setSubmittedUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("results");

  // Query for website overlap results
  const { 
    data: websiteData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<{website: Website, recommendations: Website[]}>({
    queryKey: ['/api/website/overlap', submittedUrl],
    enabled: !!submittedUrl,
  });

  // Simulated website data
  const mockWebsite: Website = {
    id: 1,
    name: "TechCrunch",
    url: "https://techcrunch.com",
    description: "TechCrunch is an American online newspaper focusing on high tech and startup companies.",
    category: "Technology News",
    tags: ["Technology", "Startups", "Business", "Innovation", "Venture Capital"],
    overlapScore: 85,
    matchingInterests: ["Technology", "Startups", "Business", "Innovation"]
  };

  const mockRecommendations: Website[] = [
    {
      id: 2,
      name: "The Verge",
      url: "https://theverge.com",
      description: "The Verge is an American technology news website operated by Vox Media.",
      category: "Technology News",
      tags: ["Technology", "Gadgets", "Reviews", "Science", "Entertainment"],
      overlapScore: 78,
      matchingInterests: ["Technology", "Gadgets", "Science"]
    },
    {
      id: 3,
      name: "Wired",
      url: "https://wired.com",
      description: "Wired is a monthly American magazine that focuses on emerging technologies and how they affect culture, economy, and politics.",
      category: "Technology Magazine",
      tags: ["Technology", "Culture", "Science", "Business", "Design"],
      overlapScore: 72,
      matchingInterests: ["Technology", "Culture", "Business"]
    },
    {
      id: 4,
      name: "Hacker News",
      url: "https://news.ycombinator.com",
      description: "Hacker News is a social news website focusing on computer science and entrepreneurship.",
      category: "Technology Community",
      tags: ["Programming", "Startups", "Technology", "Computer Science"],
      overlapScore: 68,
      matchingInterests: ["Programming", "Startups", "Technology"]
    },
    {
      id: 5,
      name: "Product Hunt",
      url: "https://producthunt.com",
      description: "Product Hunt is a website that lets users share and discover new products.",
      category: "Product Discovery",
      tags: ["Startups", "Product", "Technology", "Innovation"],
      overlapScore: 65,
      matchingInterests: ["Startups", "Technology", "Innovation"]
    }
  ];

  // For demo purposes, use mock data
  const website = websiteData?.website || mockWebsite;
  const recommendations = websiteData?.recommendations || mockRecommendations;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      setSubmittedUrl(url);
      setActiveTab("results");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Website Overlap Analysis</h1>
        <p className="text-muted-foreground mb-6">
          Enter a website URL to analyze how it overlaps with your interests and discover similar sites
        </p>
        
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <GlobeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={!url}>
            <SearchIcon className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </form>
      </div>

      {submittedUrl && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
            <TabsTrigger value="recommendations">Similar Websites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : isError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Error Analyzing Website</CardTitle>
                  <CardDescription>
                    We couldn't analyze the website you provided. Please check the URL and try again.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => refetch()}>Try Again</Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{website.name}</CardTitle>
                      <CardDescription>
                        <a 
                          href={website.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {website.url}
                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </a>
                      </CardDescription>
                    </div>
                    <Badge>{website.category}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="mb-6">{website.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overlap with your interests</span>
                      <span className="text-sm font-bold">{website.overlapScore}%</span>
                    </div>
                    <Progress value={website.overlapScore} className="h-2" />
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Website Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {website.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Matching Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {website.matchingInterests?.map((interest, i) => (
                        <Badge key={i} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add to Favorites
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoading ? (
                Array(4).fill(null).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                recommendations.map((site) => (
                  <Card key={site.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{site.name}</CardTitle>
                          <CardDescription>
                            <a 
                              href={site.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center text-xs"
                            >
                              {site.url}
                              <ArrowRightIcon className="w-3 h-3 ml-1" />
                            </a>
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{site.overlapScore}% match</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <p className="text-sm mb-4">{site.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="text-xs font-medium mb-1">Matching Interests</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {site.matchingInterests?.map((interest, i) => (
                            <Badge key={i} variant="secondary" className="text-xs py-0">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button size="sm" variant="ghost" className="ml-auto">
                        Visit Site <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default WebsiteOverlap;
