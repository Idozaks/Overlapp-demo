import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [progress, setProgress] = useState(0); // Added progress state

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
      if (!suggestions.length) {
        throw new Error('No suggestions available to generate emojis for');
      }

      const response = await fetch('/api/interests/generate-emojis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          interests: suggestions.map(s => ({
            id: 0,
            name: s.name
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate emojis');
      }

      const data = await response.json();
      return data.interests;
    },
    onMutate: () => {
      setProgress(0);
    },
    onSettled: () => {
      setProgress(0); // Reset progress on completion or error
    },
    onSuccess: (data) => {
      setProgress(100); // Set progress to 100% on success
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

        const response = await fetch('/api/interests/enrich', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ interests: cleanedInterests })
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


      // Process suggestions and remove duplicates
      const uniqueSuggestions = Array.from(new Set(data));
      const validSuggestions = uniqueSuggestions
        .filter((suggestion: string) => 
          suggestion && 
          suggestion.trim().length > 0 && 
          !currentInterests.includes(suggestion.trim())
        )
        .map((suggestion: string) => ({
          name: suggestion.trim(),
          emoji: generateInterestEmoji(suggestion.trim())
        }));

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

  // Placeholder for emoji generation - needs implementation
  const generateInterestEmoji = (interest: string): string => {
    // Implement your emoji generation logic here based on the interest
    // For example, a simple mapping:
    const emojiMap: { [key: string]: string } = {
      "Gaming": "🎮",
      "Reading": "📚",
      "Coding": "💻",
      "Movies": "🎬",
      "Music": "🎵",
      "Sports": "⚽️",
      "Travel": "✈️",
      "Cooking": "🍳",
      "Art": "🎨",
      "default": "✨"
    };
    return emojiMap[interest] || emojiMap["default"];
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
                    key={`suggestion-${suggestion.name}-${index}`}
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
          <Button
            variant="outline"
            onClick={() => generateEmojisMutation.mutate()}
            disabled={generateEmojisMutation.isPending}
          >
            {generateEmojisMutation.isPending ? (
              <div className="flex items-center">
                <div className="relative w-6 h-6 mr-2">
                  <div className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-current" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - progress}/>
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {progress}%
                  </div>
                </div>
                Generating...
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Add Emojis
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}