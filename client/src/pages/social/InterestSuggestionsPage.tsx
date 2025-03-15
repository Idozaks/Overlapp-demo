import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import InterestSuggestions from "@/components/profile/InterestSuggestions";
import type { User } from "@shared/schema";

export default function InterestSuggestionsPage() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();

  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isNaN(userId)
  });

  const { data: userInterests } = useQuery<{ interests: { name: string }[] }>({
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

  if (loadingUser) {
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

  const handleInterestsSelected = (newInterests: string[]) => {
    // The InterestSuggestions component will handle the navigation back to the edit page
    // This is just a placeholder in case we need additional logic here
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