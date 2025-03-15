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

interface InterestSuggestion {
  name: string;
  emoji: string;
}

const profileUpdateSchema = z.object({
  displayName: z.string()
    .min(2, { message: "Display name must be at least 2 characters" })
    .max(50, { message: "Display name must be less than 50 characters" }),
  bio: z.string()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional()
    .or(z.literal("")),
  avatar: z.union([z.string().url({ message: "Please enter a valid URL" }), z.instanceof(File)]).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"]).optional().or(z.literal("")),
  ageRange: z.enum(["18-25", "26-35", "36-45", "46+"]).optional().or(z.literal("")),
  countryOfOrigin: z.string().optional().or(z.literal("")),
  residencyStatus: z.enum(["Permanent", "Temporary", "Tourist", "Expat"]).optional().or(z.literal("")),
  culturalBackground: z.string().optional().or(z.literal("")),
  identityPreferences: z.record(z.string(), z.number()).optional(),
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

  const [suggestedInterests, setSuggestedInterests] = useState<InterestSuggestion[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  const [aiGeneratedInterests, setAiGeneratedInterests] = useState<Set<string>>(new Set());
  const [pendingInterests, setPendingInterests] = useState<Set<string>>(new Set());
  const [interestEmojis, setInterestEmojis] = useState<Map<string, string>>(new Map());

  const { data: allInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests'],
    queryFn: async () => {
      const response = await apiRequest('/api/interests');
      return response.json();
    }
  });

  const { data: userInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: [`/api/users/${user.id}/interests`],
    queryFn: async () => {
      const response = await apiRequest(`/api/users/${user.id}/interests`);
      return response.json();
    }
  });

  const availableInterests = allInterests?.interests?.map((interest: Interest) => interest.name) || [];
  const userSelectedInterests = userInterests?.interests?.map((interest: Interest) => interest.name) || [];

  useEffect(() => {
    if (userSelectedInterests.length > 0) {
      setPendingInterests(new Set(userSelectedInterests));
    }
  }, [JSON.stringify(userSelectedInterests)]);

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user.displayName || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      gender: user.gender || "",
      ageRange: user.ageRange || "",
      countryOfOrigin: user.countryOfOrigin || "",
      residencyStatus: user.residencyStatus || "",
      culturalBackground: user.culturalBackground || "",
      identityPreferences: user.identityPreferences || {},
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

      const currentInterestNames = new Set(userSelectedInterests);
      const pendingInterestNames = pendingInterests;
      const interestNames = Array.from(pendingInterests);
      let newInterests = [];

      for (const interest of interestNames) {
        const existingInterest = allInterests?.interests?.find(i => i.name === interest);
        if (!existingInterest && aiGeneratedInterests.has(interest)) {
          try {
            const response = await apiRequest('/api/interests', {
              method: 'POST',
              body: JSON.stringify({
                name: interest,
                category: 'AI_GENERATED',
                description: 'AI-suggested interest based on user preferences',
                isAiGenerated: true
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || errorData.error || 'Failed to create interest');
            }

            const newInterest = await response.json();
            if (newInterest.interest) { 
              newInterests.push(newInterest.interest);
            } else {
              newInterests.push(newInterest);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error creating interest:', errorMessage);
            toast({
              title: t("profile.error"),
              description: t("profile.errorCreatingInterest", {
                interest,
                error: errorMessage
              }),
              variant: "destructive"
            });
            continue;
          }
        }
      }

      const allAvailableInterests = [
        ...(allInterests?.interests || []),
        ...newInterests
      ];

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
        body: JSON.stringify({ interests })
      });

      if (!response.ok) {
        throw new Error('Failed to enrich interests');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Received enriched interests:', data); // Debug log
      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        console.error('Invalid suggestions format:', data);
        toast({
          title: t("profile.enrichError"),
          description: "Invalid response format from AI",
          variant: "destructive"
        });
        return;
      }

      setSuggestedInterests(data.suggestions);
      const newEmojiMap = new Map(interestEmojis);
      data.suggestions.forEach((suggestion: InterestSuggestion) => {
        if (suggestion.name && suggestion.emoji) {
          newEmojiMap.set(suggestion.name, suggestion.emoji);
        }
      });
      setInterestEmojis(newEmojiMap);

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
    setShowAiThinking(true);
    await enrichInterestsMutation.mutateAsync(Array.from(pendingInterests));
    setIsEnriching(false);
  };

  const toggleInterest = (interest: string, isAiSuggested = false) => {
    setPendingInterests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interest)) {
        newSet.delete(interest);
        if (isAiSuggested) {
          setAiGeneratedInterests(prev => {
            const newAiSet = new Set(prev);
            newAiSet.delete(interest);
            return newAiSet;
          });
        }
      } else {
        newSet.add(interest);
        if (isAiSuggested) {
          setAiGeneratedInterests(prev => {
            const newAiSet = new Set(prev);
            newAiSet.add(interest);
            return newAiSet;
          });
        }
      }
      return newSet;
    });
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
      gender: data.gender || undefined,
      ageRange: data.ageRange || undefined,
      countryOfOrigin: data.countryOfOrigin || undefined,
      residencyStatus: data.residencyStatus || undefined,
      culturalBackground: data.culturalBackground || undefined,
      identityPreferences: data.identityPreferences || undefined,
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
        
        <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20 mb-6">
          <h3 className="text-lg font-medium mb-4">Identity Information</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The following information helps us find better connections for you based on shared identity traits.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Range</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Age Range</option>
                      <option value="18-25">18-25</option>
                      <option value="26-35">26-35</option>
                      <option value="36-45">36-45</option>
                      <option value="46+">46+</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="countryOfOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Origin</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g. United States, Canada, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="residencyStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residency Status</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Residency Status</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Tourist">Tourist</option>
                      <option value="Expat">Expat</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="culturalBackground"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Cultural Background</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe your cultural heritage, traditions, or background" 
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Share aspects of your cultural identity that are important to you. This helps us connect you with people who share similar backgrounds.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-8 border-t border-secondary/20 pt-6">
            <h4 className="text-md font-medium mb-4">Identity Matching Preferences</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Adjust how important each identity attribute is when finding matches for you.
              Higher values mean you'll be matched more strongly with people who share that trait.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-1 block">Gender Importance</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  defaultValue={user.identityPreferences?.gender || 5}
                  className="w-full"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const currentPrefs = form.getValues("identityPreferences") || {};
                    form.setValue("identityPreferences", {
                      ...currentPrefs,
                      gender: value
                    });
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not important</span>
                  <span>Very important</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Age Range Importance</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  defaultValue={user.identityPreferences?.ageRange || 5}
                  className="w-full"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const currentPrefs = form.getValues("identityPreferences") || {};
                    form.setValue("identityPreferences", {
                      ...currentPrefs,
                      ageRange: value
                    });
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not important</span>
                  <span>Very important</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Country of Origin Importance</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  defaultValue={user.identityPreferences?.countryOfOrigin || 5}
                  className="w-full"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const currentPrefs = form.getValues("identityPreferences") || {};
                    form.setValue("identityPreferences", {
                      ...currentPrefs,
                      countryOfOrigin: value
                    });
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not important</span>
                  <span>Very important</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Residency Status Importance</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  defaultValue={user.identityPreferences?.residencyStatus || 5}
                  className="w-full"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const currentPrefs = form.getValues("identityPreferences") || {};
                    form.setValue("identityPreferences", {
                      ...currentPrefs,
                      residencyStatus: value
                    });
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not important</span>
                  <span>Very important</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Cultural Background Importance</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  defaultValue={user.identityPreferences?.culturalBackground || 5}
                  className="w-full"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const currentPrefs = form.getValues("identityPreferences") || {};
                    form.setValue("identityPreferences", {
                      ...currentPrefs,
                      culturalBackground: value
                    });
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not important</span>
                  <span>Very important</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-secondary/5 rounded-md border border-secondary/10">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="balanceWeight"
                    className="h-4 w-4" 
                    defaultChecked={true}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Apply default balanced weights
                        form.setValue("identityPreferences", {
                          gender: 5,
                          ageRange: 5,
                          countryOfOrigin: 5,
                          residencyStatus: 5,
                          culturalBackground: 5
                        });
                      }
                    }}
                  />
                  <label htmlFor="balanceWeight" className="text-sm cursor-pointer">Balance all identity attributes equally</label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  When checked, all attributes will have equal importance in finding your matches.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>{t("profile.interests")}</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEnrichInterests}
              disabled={isEnriching}
              className="gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
            >
              {isEnriching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
              Discover More Interests with AI
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[...availableInterests, ...Array.from(aiGeneratedInterests)].map((interest, idx) => (
              <Badge
                key={`available-${interest}-${idx}`}
                variant={pendingInterests.has(interest) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  pendingInterests.has(interest) ? "bg-primary/90" : "hover:bg-primary/10",
                  aiGeneratedInterests.has(interest) && "border-primary/50 bg-primary/5"
                )}
                onClick={() => toggleInterest(interest)}
              >
                {aiGeneratedInterests.has(interest) && interestEmojis.get(interest) && (
                  <span className="mr-1">{interestEmojis.get(interest)}</span>
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
                  {suggestedInterests.map((suggestion, idx) => {
                    const isSelected = pendingInterests.has(suggestion.name);
                    console.log('Rendering suggestion:', suggestion); // Debug log

                    return (
                      <Badge
                        key={`suggestion-${suggestion.name}-${idx}`}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer hover:bg-primary/20 transition-colors",
                          "flex items-center gap-1"
                        )}
                        onClick={() => toggleInterest(suggestion.name, true)}
                      >
                        {suggestion.emoji && (
                          <span className="inline-block">{suggestion.emoji}</span>
                        )}
                        <span>{suggestion.name}</span>
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