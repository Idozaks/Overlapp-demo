import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface InterestSuggestion {
  name: string;
  emoji: string;
}

interface InterestSuggestionsProps {
  userId: number;
  currentInterests: string[];
  onInterestsSelected: (interests: string[]) => void;
}

export default function InterestSuggestions({
  userId,
  currentInterests,
  onInterestsSelected
}: InterestSuggestionsProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [suggestedInterests, setSuggestedInterests] = useState<InterestSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);

  // Initialize animations and UI state
  useEffect(() => {
    setShowAiThinking(true);
    const timer = setTimeout(() => setShowAiThinking(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const enrichInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const response = await apiRequest('/api/interests/enrich', {
        method: 'POST',
        body: JSON.stringify({ interests })
      });

      if (!response.ok) {
        throw new Error('Failed to enrich interests');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Received enriched interests:', data);
      
      if (!data.suggestions) {
        console.error('No suggestions property in response:', data);
        toast({
          title: t("profile.enrichError"),
          description: "Missing suggestions in AI response",
          variant: "destructive"
        });
        return;
      }
      
      if (!Array.isArray(data.suggestions)) {
        console.error('Suggestions is not an array:', data.suggestions);
        toast({
          title: t("profile.enrichError"),
          description: "Invalid suggestions format from AI",
          variant: "destructive"
        });
        return;
      }
      
      // Additional validation for each suggestion item
      const validSuggestions = data.suggestions.map(suggestion => {
        // Ensure both name and emoji exist and are strings
        return {
          name: typeof suggestion.name === 'string' ? suggestion.name.trim() : 'Unknown Interest',
          emoji: typeof suggestion.emoji === 'string' ? suggestion.emoji.trim() : '🔍'
        };
      }).filter(suggestion => suggestion.name.length > 0);
      
      console.log('Processed suggestions:', validSuggestions);
      
      if (validSuggestions.length === 0) {
        toast({
          title: t("profile.enrichError"),
          description: t("profile.noSuggestionsFound"),
          variant: "destructive"
        });
        return;
      }

      setSuggestedInterests(validSuggestions);
      setIsLoading(false);
      toast({
        title: t("profile.enrichSuccess"),
        description: t("profile.enrichSuccessMessage")
      });
    },
    onError: (error: Error) => {
      setIsLoading(false);
      toast({
        title: t("profile.enrichError"),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (currentInterests.length > 0) {
      setIsLoading(true);
      enrichInterestsMutation.mutate(currentInterests);
    } else {
      toast({
        title: t("profile.enrichError"),
        description: t("profile.selectInterestsFirst"),
        variant: "destructive"
      });
      // Navigate back if no interests to enrich
      setLocation(`/profile/${userId}/edit`);
    }
  }, []);

  const toggleSuggestion = (suggestion: string) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestion)) {
        newSet.delete(suggestion);
      } else {
        newSet.add(suggestion);
      }
      return newSet;
    });
  };

  const handleSaveSelections = () => {
    onInterestsSelected(Array.from(selectedSuggestions));
    setLocation(`/profile/${userId}/edit`);
  };

  const handleGoBack = () => {
    setLocation(`/profile/${userId}/edit`);
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={handleGoBack} className="self-start">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <CardTitle className="text-xl">{t("profile.aiSuggestions")}</CardTitle>
              <CardDescription>
                {t("profile.aiSuggestionsDescription")}
              </CardDescription>
            </div>
            <div className="w-8"></div> {/* Spacer to balance the back button */}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || showAiThinking ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <p className="text-lg font-medium">{t("profile.aiThinking")}</p>
              </div>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {t("profile.tapToSelectInterests")}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {suggestedInterests.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant={selectedSuggestions.has(suggestion.name) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3 hover:shadow-sm transition-all"
                    onClick={() => toggleSuggestion(suggestion.name)}
                  >
                    {suggestion.emoji} {suggestion.name}
                  </Badge>
                ))}
                
                {suggestedInterests.length === 0 && !isLoading && (
                  <p className="text-sm text-muted-foreground">
                    {t("profile.noSuggestionsFound")}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleGoBack}>
            {t("common.cancel")}
          </Button>
          <Button 
            onClick={handleSaveSelections}
            disabled={selectedSuggestions.size === 0 || isLoading}
          >
            {t("common.save")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}