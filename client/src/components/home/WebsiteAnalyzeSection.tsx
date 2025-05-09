import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { GlobeIcon, Loader2, SparklesIcon, ArrowRightIcon, MessageCircleIcon } from "lucide-react";
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

export const WebsiteAnalyzeSection: FC = () => {
  const [url, setUrl] = useState("");
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysisResult | null>(null);
  
  // Mock user interests for MVP demo
  const mockUserInterests = [
    "Technology", "Programming", "Web Development", 
    "Artificial Intelligence", "Machine Learning", 
    "Data Science", "UX/UI Design", "Startups"
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
    onSuccess: (data) => {
      setAnalysis(data);
      setAnalysisOpen(true);
    }
  });

  const handleAnalyze = () => {
    if (url) {
      analyzeWebsite.mutate(url);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analyze Website</h2>
      <p className="text-muted-foreground">
        Enter a website URL to discover how it aligns with your interests
      </p>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <GlobeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL"
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={!url || analyzeWebsite.isPending}
              className={`bg-teal-500 hover:bg-teal-600 text-white ${
                analyzeWebsite.isPending ? 'bg-amber-500 hover:bg-amber-600' : ''
              }`}
            >
              {analyzeWebsite.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" /> 
                  Analyze Overlap
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-teal-500" />
              Website Analysis
            </DialogTitle>
            <DialogDescription>
              {analysis && (
                <div className="flex items-center">
                  <span>Analysis for </span>
                  <a 
                    href={analysis.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center ml-1"
                  >
                    {analysis.websiteName}
                    <ArrowRightIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {analysis && (
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