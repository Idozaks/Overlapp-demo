import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { User, Interest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const profileUpdateSchema = z.object({
  displayName: z.string()
    .min(2, { message: "Display name must be at least 2 characters" })
    .max(50, { message: "Display name must be less than 50 characters" }),
  bio: z.string()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional()
    .or(z.literal("")),
  avatar: z.union([z.string().url({ message: "Please enter a valid URL" }), z.instanceof(File)]).optional().or(z.literal("")),
  preferences: z.object({
    retailPreferences: z.array(z.string())
  }).optional()
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface ProfileEditFormProps {
  user: User;
  onSuccess?: () => void;
}

const RETAIL_PREFERENCES = [
  "Electronics", "Clothing", "Home & Garden", "Sports Equipment",
  "Books & Media", "Beauty & Health", "Toys & Games", "Automotive",
  "Office Supplies", "Food & Beverage"
];

const suggestedInterest = (interest: string): string => {
  return interest.replace(/[\[\]"]/g, '').trim();
};

const ProfileEditForm = ({ user, onSuccess }: ProfileEditFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // All state hooks at the top
  const [suggestedInterests, setSuggestedInterests] = useState<string[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  const [aiGeneratedInterests, setAiGeneratedInterests] = useState<Set<string>>(new Set());
  const [pendingInterests, setPendingInterests] = useState<Set<string>>(new Set());

  // Fetch all available interests
  const { data: allInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests'],
    queryFn: async () => {
      const response = await apiRequest('/api/interests');
      return response.json();
    }
  });

  // Fetch user's current interests
  const { data: userInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: [`/api/users/${user.id}/interests`],
    queryFn: async () => {
      const response = await apiRequest(`/api/users/${user.id}/interests`);
      return response.json();
    }
  });

  const availableInterests = allInterests?.interests?.map((interest: Interest) => interest.name) || [];
  const userSelectedInterests = userInterests?.interests?.map((interest: Interest) => interest.name) || [];

  // Initialize pending interests when userSelectedInterests changes
  useEffect(() => {
    if (userSelectedInterests.length > 0) {
      setPendingInterests(new Set(userSelectedInterests));
    }
  }, [JSON.stringify(userSelectedInterests)]); // Use JSON.stringify to avoid infinite loop

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user.displayName || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      preferences: {
        retailPreferences: user.preferences?.retailPreferences || []
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      if (!user.id || isNaN(user.id)) {
        throw new Error("Invalid user ID");
      }

      // First update user profile
      let body;
      const requestOptions: RequestInit = {
        method: "PATCH"
      };

      if (data.avatar instanceof File) {
        const formData = new FormData();
        formData.append('avatar', data.avatar);
        if (data.displayName) formData.append('displayName', data.displayName);
        if (data.bio) formData.append('bio', data.bio);
        if (data.preferences) {
          formData.append('preferences', JSON.stringify(data.preferences));
        }
        body = formData;
      } else {
        body = JSON.stringify(data);
        requestOptions.headers = {
          'Content-Type': 'application/json'
        };
      }

      requestOptions.body = body;

      const response = await apiRequest(`/api/users/${user.id}`, requestOptions);
      const result = await response.json();
      if (!result.user) {
        throw new Error("Invalid response from server");
      }

      // Then update interests
      const currentInterestNames = new Set(userSelectedInterests);
      const pendingInterestNames = pendingInterests;
      const interestNames = Array.from(pendingInterests);
      let newInterests = [];

      // If there are AI suggested interests in the pending list, create them first
      for (const interest of interestNames) {
        const existingInterest = allInterests?.interests?.find(i => i.name === interest);
        if (!existingInterest && aiGeneratedInterests.has(interest)) {
          try {
            // Create the new AI-generated interest
            const response = await apiRequest('/api/interests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: interest,
                category: 'AI_GENERATED',
                description: 'AI-suggested interest based on user preferences',
                isAiGenerated: true
              })
            });
            const newInterest = await response.json();
            newInterests.push(newInterest);
          } catch (error) {
            console.error('Error creating new interest:', error);
            toast({
              title: t("profile.error"),
              description: t("profile.errorCreatingInterest", { interest }),
              variant: "destructive"
            });
            // Skip this interest but continue with others
            continue;
          }
        }
      }

      // Update the interests list with any newly created interests
      const allAvailableInterests = [
        ...(allInterests?.interests || []),
        ...newInterests
      ];

      // Remove interests that are no longer selected
      for (const interest of currentInterestNames) {
        if (!pendingInterestNames.has(interest)) {
          const interestObj = allAvailableInterests.find(i => i.name === interest);
          if (interestObj) {
            await apiRequest(`/api/users/${user.id}/interests/${interestObj.id}`, {
              method: 'DELETE'
            });
          }
        }
      }

      // Add new interests
      for (const interest of pendingInterestNames) {
        if (!currentInterestNames.has(interest)) {
          const interestObj = allAvailableInterests.find(i => i.name === interest);
          if (interestObj) {
            await apiRequest(`/api/users/${user.id}/interests`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ interestId: interestObj.id })
            });
          }
        }
      }

      return result.user;
    },
    onSuccess: (updatedUser) => {
      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessMessage")
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/interests`] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      toast({
        title: t("profile.updateError"),
        description: t("profile.updateErrorMessage"),
        variant: "destructive"
      });
    }
  });

  const enrichInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const response = await apiRequest('/api/interests/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interests })
      });

      if (!response.ok) {
        throw new Error('Failed to enrich interests');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSuggestedInterests(data.suggestions);
      toast({
        title: t("profile.enrichSuccess"),
        description: t("profile.enrichSuccessMessage")
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("profile.enrichError"),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEnrichInterests = async () => {
    if (pendingInterests.size === 0) {
      toast({
        title: t("profile.enrichError"),
        description: t("profile.selectInterestsFirst"),
        variant: "destructive"
      });
      return;
    }
    setIsEnriching(true);
    await enrichInterestsMutation.mutateAsync(Array.from(pendingInterests));
    setIsEnriching(false);
  };

  const toggleInterest = (interest: string, isAiSuggested = false) => {
    setPendingInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interest)) {
        newSet.delete(interest);
      } else {
        newSet.add(interest);
      }
      return newSet;
    });

    if (isAiSuggested) {
      setAiGeneratedInterests(prev => {
        const newSet = new Set(prev);
        if (prev.has(interest)) {
          newSet.delete(interest);
        } else {
          newSet.add(interest);
        }
        return newSet;
      });
    }
  };

  const toggleRetailPreference = (preference: string) => {
    const currentPreferences = form.getValues("preferences.retailPreferences") || [];
    const newPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter(p => p !== preference)
      : [...currentPreferences, preference];
    form.setValue("preferences.retailPreferences", newPreferences, { shouldValidate: true });
  };

  const onSubmit = async (data: ProfileUpdateData) => {
    const cleanData = {
      ...data,
      bio: data.bio || undefined,
      avatar: data.avatar || undefined,
      preferences: {
        retailPreferences: data.preferences?.retailPreferences || []
      }
    };
    await updateMutation.mutateAsync(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.displayName")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.bio")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                {t("profile.bioDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>{t("profile.avatar")}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      {...field}
                    />
                    <Input
                      type="text"
                      placeholder="Or enter URL"
                      onChange={(e) => onChange(e.target.value)}
                      value={typeof value === 'string' ? value : ''}
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mb-2"
                      onClick={() => {
                        const elem = document.getElementById('avatar-grid');
                        if (elem) {
                          elem.style.display = elem.style.display === 'none' ? 'grid' : 'none';
                        }
                      }}
                    >
                      {t("profile.selectPredefinedAvatar")}
                    </Button>
                    <div id="avatar-grid" className="grid grid-cols-5 gap-2" style={{ display: 'none' }}>
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className={`cursor-pointer rounded-lg p-1 hover:bg-accent ${value === `https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar${i}` ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => onChange(`https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar${i}`)}
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar${i}`}
                            alt={`Avatar ${i + 1}`}
                            className="w-full h-auto rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>{t("profile.interests")}</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEnrichInterests}
              disabled={isEnriching}
              className="gap-2"
            >
              {isEnriching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Discover More Interests with AI
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[...availableInterests, ...Array.from(aiGeneratedInterests)].map(interest => (
              <Badge
                key={interest}
                variant={pendingInterests.has(interest) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  aiGeneratedInterests.has(interest) && "border-primary/50 bg-primary/5"
                )}
                onClick={() => toggleInterest(interest)}
              >
                {aiGeneratedInterests.has(interest) && (
                  <Sparkles className="h-3 w-3 mr-1 inline-block text-primary" />
                )}
                {interest}
              </Badge>
            ))}
          </div>

          {suggestedInterests.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium hover:bg-primary/10"
                  onClick={() => setShowAiThinking(!showAiThinking)}
                >
                  {showAiThinking ? "Hide AI Analysis" : "Show AI Analysis"}
                </Button>
              </div>

              {showAiThinking && (
                <div className="p-4 rounded-lg bg-primary/5 text-sm space-y-2">
                  <p className="font-medium text-primary">AI Analysis Process:</p>
                  <p>Based on your selected interests, our AI analyzes patterns and relationships to suggest related activities and sub-categories that might interest you. For example:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    {Array.from(pendingInterests).map((interest, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        From "{interest}" → Looking for specific activities, related hobbies, and specialized sub-categories
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 border rounded-lg bg-secondary/5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="font-medium">AI-Suggested Interests</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedInterests.map((interest, index) => {
                    const cleanInterest = suggestedInterest(interest);
                    const isSelected = pendingInterests.has(cleanInterest);

                    return (
                      <Badge
                        key={`suggestion-${index}`}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => toggleInterest(cleanInterest, true)}
                      >
                        <Sparkles className="h-3 w-3 mr-1 inline-block" />
                        {cleanInterest}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <FormLabel>{t("profile.retailPreferences")}</FormLabel>
          <div className="flex flex-wrap gap-2">
            {RETAIL_PREFERENCES.map(preference => (
              <Badge
                key={preference}
                variant={form.watch("preferences.retailPreferences")?.includes(preference) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleRetailPreference(preference)}
              >
                {preference}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full mt-6"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.updating")}
            </>
          ) : (
            t("profile.updateProfile")
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileEditForm;