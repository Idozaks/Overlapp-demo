import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import InterestSuggestions from "@/components/profile/InterestSuggestions";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function InterestSuggestionsPage() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();

  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isNaN(userId)
  });

  const { data: userInterests, isLoading: loadingInterests } = useQuery<{ interests: { name: string }[] }>({
    queryKey: [`/api/users/${userId}/interests`],
    enabled: !!userId && !isNaN(userId)
  });

  if (!userId || isNaN(userId)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Invalid user ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingUser || loadingInterests) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentInterests = userInterests?.interests?.map(interest => interest.name) || [];

  const handleInterestsSelected = async (newInterests: string[]) => {
    if (!userId || !newInterests.length) return;
    
    try {
      // For each new interest, add it to the user's interests
      for (const interest of newInterests) {
        // Try to find the interest in available interests
        const existingInterest = await fetch(`/api/interests?name=${encodeURIComponent(interest)}`)
          .then(res => res.json())
          .then(data => data.interests?.find((i: any) => i.name === interest));
          
        if (existingInterest) {
          // Add existing interest to user
          await apiRequest(`/api/users/${userId}/interests`, {
            method: 'POST',
            body: JSON.stringify({ interestId: existingInterest.id })
          });
        } else {
          // Create new interest
          const newInterestResponse = await apiRequest('/api/interests', {
            method: 'POST',
            body: JSON.stringify({
              name: interest,
              category: 'AI_GENERATED',
              description: 'AI-suggested interest based on user preferences',
              isAiGenerated: true
            })
          });
          
          if (newInterestResponse.ok) {
            const newInterest = await newInterestResponse.json();
            // Add newly created interest to user
            await apiRequest(`/api/users/${userId}/interests`, {
              method: 'POST',
              body: JSON.stringify({ 
                interestId: newInterest.interest?.id || newInterest.id 
              })
            });
          }
        }
      }
    } catch (error) {
      console.error('Error adding interests:', error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <InterestSuggestions 
        userId={userId} 
        currentInterests={currentInterests}
        onInterestsSelected={handleInterestsSelected}
      />
    </div>
  );
}