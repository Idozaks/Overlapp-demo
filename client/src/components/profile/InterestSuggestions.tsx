import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface InterestSuggestion {
  name: string;
  emoji: string;
  isFallback?: boolean;
  reason?: string;
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
  const [usingFallbacks, setUsingFallbacks] = useState(false);
  // Emoji generation progress no longer needed as we removed emojis
  // const [progress, setProgress] = useState(0); // Added progress state

  // Initialize animations and UI state
  useEffect(() => {
    setShowAiThinking(true);
    const timer = setTimeout(() => setShowAiThinking(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const [suggestions, setSuggestions] = useState<Array<{name: string, emoji?: string}>>([]);

  useEffect(() => {
    setSuggestions(suggestedInterests.map(interest => ({
      name: interest.name,
      emoji: interest.emoji
    })));
  }, [suggestedInterests]);

  const generateEmojisMutation = useMutation({
    mutationFn: async () => {
      const totalInterests = suggestions.length;
      // Emoji generation no longer needed
      
      // First get all existing interests
      const interestsResponse = await fetch('/api/interests');
      const interestsData = await interestsResponse.json();
      const existingInterests = interestsData.interests || [];
      
      // Map names to IDs
      const interestMap = new Map();
      existingInterests.forEach(interest => {
        interestMap.set(interest.name, interest.id);
      });
      
      // Get IDs for our suggestions
      const interestIds = suggestions
        .map(suggestion => interestMap.get(suggestion))
        .filter(id => id !== undefined);

      const response = await apiRequest('/api/interests/generate-emojis', {
        method: 'POST',
        body: { 
          interests: suggestions.map(s => ({
            id: 0,
            name: s.name
          }))
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate emojis');
      }

      const data = await response.json();
      
      // Emoji generation removed
      return data.interests;
    },
    onMutate: () => {
      // Progress tracking removed
    },
    onSettled: () => {
      // Progress tracking removed
    },
    onSuccess: (data) => {
      // Progress tracking removed
      setSuggestions(prev => 
        prev.map(suggestion => {
          const match = data.find(d => d.name === suggestion.name);
          return match ? { ...suggestion, emoji: match.emoji } : suggestion;
        })
      );
      toast({
        title: "Success",
        description: "Added emojis to interests",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const enrichInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      try {
        const cleanedInterests = interests.map(interest => 
          typeof interest === 'string' ? interest.trim() : interest
        ).filter(Boolean);

        if (!cleanedInterests.length) {
          throw new Error('No valid interests provided');
        }

        const response = await apiRequest('/api/interests/enrich', {
          method: 'POST',
          body: { interests: cleanedInterests }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to enrich interests');
        }

        const data = await response.json();
        return data?.suggestions || [];
      } catch (error) {
        console.error('Interest enrichment error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Received enriched interests:', data);

      // Process suggestions differently based on what the API returned
      let validSuggestions = [];
      
      // Check if we're using fallbacks
      if (data && data.usingFallbacks) {
        setUsingFallbacks(true);
        console.log('Using fallback suggestions due to AI service limitations');
      } else {
        setUsingFallbacks(false);
      }
      
      if (data && Array.isArray(data.suggestions)) {
        // New API format returns an object with suggestions array
        console.log('Using new API response format with suggestions array');
        validSuggestions = data.suggestions
          .filter((suggestion: any) => 
            suggestion && 
            suggestion.name && 
            !currentInterests.includes(suggestion.name)
          )
          .map((suggestion: any) => ({
            name: suggestion.name,
            emoji: '', // Always empty as we've removed emojis
            reason: suggestion.reason || '',
            isFallback: suggestion.isFallback || false
          }));
      } else {
        // Legacy format or unexpected format - try to handle it gracefully
        console.log('Using legacy API response format');
        const uniqueSuggestions = Array.from(new Set(data));
        validSuggestions = uniqueSuggestions
          .filter((suggestion: any) => {
            if (typeof suggestion === 'string') {
              return suggestion && suggestion.trim().length > 0 && !currentInterests.includes(suggestion.trim());
            } else if (suggestion && typeof suggestion === 'object') {
              return suggestion.name && !currentInterests.includes(suggestion.name);
            }
            return false;
          })
          .map((suggestion: any) => {
            if (typeof suggestion === 'string') {
              return {
                name: suggestion.trim(),
                emoji: '',
                isFallback: false
              };
            } else {
              return {
                name: suggestion.name,
                emoji: '',
                reason: suggestion.reason || '',
                isFallback: suggestion.isFallback || false
              };
            }
          });
      }

      console.log('Processed suggestions:', validSuggestions);

      if (validSuggestions.length === 0) {
        toast({
          title: t("profile.enrichError"),
          description: t("profile.noSuggestionsFound"),
          variant: "destructive"
        });
        setIsLoading(false);
        setShowAiThinking(false);
        return;
      }

      setSuggestedInterests(validSuggestions);
      setIsLoading(false);
      setShowAiThinking(false);
      
      if (data && data.usingFallbacks) {
        toast({
          title: t("profile.enrichPartialSuccess"),
          description: t("profile.usingFallbackSuggestions"),
          variant: "default" // Changed from "warning" to "default" as warning is not a valid variant
        });
      } else {
        toast({
          title: t("profile.enrichSuccess"),
          description: t("profile.enrichSuccessMessage")
        });
      }
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

  // Adding console.log to debug what interests are available
  // Use a ref to track if we've already triggered the API call
  const hasTriggeredEnrichment = useRef(false);

  useEffect(() => {
    console.log('Current interests in InterestSuggestions:', currentInterests);

    // Check if we have interests and proceed - use a more robust check
    if (Array.isArray(currentInterests) && currentInterests.length > 0) {
      // Only trigger once to avoid loops and save API credits
      if (!isLoading && !hasTriggeredEnrichment.current) {
        setIsLoading(true);
        hasTriggeredEnrichment.current = true; // Mark as triggered
        enrichInterestsMutation.mutate(currentInterests);
      }
    } else {
      // Only show error and navigate if:
      // 1. currentInterests is defined (not during initial load)
      // 2. It's confirmed to be empty (not undefined or still loading)
      if (currentInterests !== undefined && !isLoading && !hasTriggeredEnrichment.current) {
        console.log('No interests detected, showing error and navigating back');
        toast({
          title: t("profile.enrichError"),
          description: t("profile.selectInterestsFirst"),
          variant: "destructive"
        });
        // Navigate back if no interests to enrich
        setLocation(`/profile/${userId}/edit`);
      }
    }
  }, [currentInterests, userId, t, toast, setLocation, isLoading, enrichInterestsMutation]);

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

  const handleSaveSelections = async () => {
    // First call the callback to add interests to database
    await onInterestsSelected(Array.from(selectedSuggestions));

    // Then navigate back to edit page
    setLocation(`/profile/${userId}/edit?refresh=true`);
  };

  const handleGoBack = () => {
    setLocation(`/profile/${userId}/edit`);
  };

  // Emoji generation removed as requested
  const generateInterestEmoji = (interest: string): string => {
    // Return empty string for all interests since we've removed emojis
    return '';
  };

  return (
    <TooltipProvider>
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
                {usingFallbacks && (
                  <div className="mb-4 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-200">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>AI-powered suggestions are temporarily unavailable - showing curated alternatives</span>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.tapToSelectInterests")}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {suggestedInterests.map((suggestion, index) => (
                    <Tooltip key={`suggestion-${suggestion.name}-${index}`}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={selectedSuggestions.has(suggestion.name) ? "default" : "outline"}
                          className={`cursor-pointer text-sm py-1.5 px-3 hover:shadow-sm transition-all ${suggestion.isFallback ? 'border-dashed border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100' : ''}`}
                          onClick={() => toggleSuggestion(suggestion.name)}
                        >
                          {suggestion.name}
                          {suggestion.isFallback && (
                            <span className="ml-1 text-[10px] italic text-amber-600 dark:text-amber-400">(suggested)</span>
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-medium">{suggestion.name}</p>
                          {suggestion.reason && (
                            <p className="text-xs mt-1">{suggestion.reason}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
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
          <div className="flex justify-end gap-3 p-4"> {/* Added CardFooter for better styling */}
            <Button variant="outline" onClick={handleGoBack}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleSaveSelections}
              disabled={selectedSuggestions.size === 0 || isLoading}
            >
              {t("common.save")}
            </Button>

          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}