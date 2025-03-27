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
import { useLocation } from "wouter";
import { Loader2, Sparkles, Plus, Search as SearchIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { User, Interest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import countries from 'world-countries';

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
  avatar: z.union([
    z.string().refine(val => val.startsWith('/uploads/') || val.startsWith('http') || val === '', {
      message: "Please enter a valid URL or select a file"
    }), 
    z.instanceof(File)
  ]).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"]).optional().or(z.literal("")),
  ageRange: z.enum(["18-25", "26-35", "36-45", "46+"]).optional().or(z.literal("")),
  countryOfOrigin: z.string().optional().or(z.literal("")),
  languagesSpoken: z.string().optional().or(z.literal("")),
  culturalBackground: z.string().optional().or(z.literal("")),
  education: z.enum(["High School", "Bachelor's", "Master's", "PhD", "Other", "Prefer not to say"]).optional().or(z.literal("")),
  professionalField: z.string().optional().or(z.literal("")),
  communityAffiliations: z.string().optional().or(z.literal("")),
  eventPreferences: z.enum(["In-person gatherings", "Virtual meetups", "Small groups", "Large conferences", "Any"]).optional().or(z.literal("")),
  collaborationStyle: z.enum(["Solo worker", "Team player", "Mentor/mentee", "Adaptable"]).optional().or(z.literal("")),
  personalValues: z.string().optional().or(z.literal("")),
  digitalIdentity: z.enum(["Early adopter", "Casual user", "Content creator", "Privacy-focused"]).optional().or(z.literal("")),
  physicalActivityLevel: z.enum(["Very active", "Moderately active", "Occasionally active", "Primarily sedentary"]).optional().or(z.literal("")),
  culturalExperiences: z.enum(["Well-traveled", "Local expert", "Cultural explorer", "Limited travel"]).optional().or(z.literal("")),
  learningStyle: z.enum(["Self-taught", "Formal education", "Hands-on learner", "Visual learner"]).optional().or(z.literal("")),
  identityPreferences: z.object({
    attributeImportance: z.record(z.string(), z.number()).optional(),
  }).optional().or(z.record(z.string(), z.unknown()).optional()).or(z.literal({})),
  preferences: z.object({
    retailPreferences: z.array(z.string())
  }).optional()
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface ProfileEditFormProps {
  user: User;
  onSuccess?: (updatedUser: User) => void;
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
  const [searchParams] = useLocation();

  // Check if we're returning from interest suggestions with a refresh param
  const shouldRefreshInterests = searchParams.includes('refresh=true');

  const [suggestedInterests, setSuggestedInterests] = useState<InterestSuggestion[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [showAiThinking, setShowAiThinking] = useState(false);
  const [aiGeneratedInterests, setAiGeneratedInterests] = useState<Set<string>>(new Set());
  const [pendingInterests, setPendingInterests] = useState<Set<string>>(new Set());
  const [interestEmojis, setInterestEmojis] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredInterestsByCategory, setFilteredInterestsByCategory] = useState<Record<string, Interest[]>>({});

  const { data: allInterests, isLoading: loadingInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests'],
    queryFn: async () => {
      const response = await apiRequest('/api/interests');
      return response.json();
    }
  });

  // Update emojis map when interests are loaded
  useEffect(() => {
    if (allInterests?.interests) {
      const newEmojiMap = new Map<string, string>();
      allInterests.interests.forEach((interest: Interest) => {
        // Only add if iconUrl (emoji) exists
        if (interest.iconUrl) {
          newEmojiMap.set(interest.name, interest.iconUrl);
        }
      });
      setInterestEmojis(newEmojiMap);
    }
  }, [allInterests?.interests]);

  const { data: interestCategories } = useQuery<{ categories: string[] }>({
    queryKey: ['/api/interests/categories'],
    queryFn: async () => {
      const response = await apiRequest('/api/interests/categories');
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

  // Group interests by category
  const interestsByCategory = React.useMemo(() => {
    const grouped: Record<string, Interest[]> = {};

    if (allInterests?.interests) {
      allInterests.interests.forEach((interest: Interest) => {
        const category = interest.category || 'Uncategorized';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(interest);
      });
    }

    return grouped;
  }, [allInterests?.interests]);

  // Filter interests based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search query is empty, use the original grouping
      setFilteredInterestsByCategory(interestsByCategory);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase().trim();
      const filtered: Record<string, Interest[]> = {};

      // Filter interests in each category
      Object.keys(interestsByCategory).forEach(category => {
        const matches = interestsByCategory[category].filter(interest =>
          interest.name.toLowerCase().includes(lowercaseQuery)
        );

        if (matches.length > 0) {
          filtered[category] = matches;
        }
      });

      setFilteredInterestsByCategory(filtered);
    }
  }, [interestsByCategory, searchQuery]);

  const availableInterests = allInterests?.interests?.map((interest: Interest) => interest.name) || [];
  const userSelectedInterests = userInterests?.interests?.map((interest: Interest) => interest.name) || [];

  // Load user interests on initial render or when they change
  useEffect(() => {
    if (userSelectedInterests.length > 0) {
      setPendingInterests(new Set(userSelectedInterests));
    }
  }, [JSON.stringify(userSelectedInterests)]);

  // Handle refreshing interest data when returning from suggestions page
  useEffect(() => {
    if (shouldRefreshInterests) {
      // Invalidate and refetch the interests data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/interests`] });

      // Show a success toast message
      toast({
        title: t("profile.interestsUpdated"),
        description: t("profile.interestsUpdatedDescription") || "Your selected interests have been updated.",
        variant: "default"
      });

      // Remove the refresh parameter from URL by redirecting
      const currentPath = window.location.pathname;
      window.history.replaceState({}, '', currentPath);
    }
  }, [shouldRefreshInterests, user.id, queryClient, toast, t]);

  // Helper function to safely cast string values to enum types
  const safeEnumCast = <T extends string>(value: string | null | undefined, enumValues: readonly T[]): T | "" => {
    if (!value) return "";
    return enumValues.includes(value as T) ? value as T : "";
  };
  
  // Define the enum values for validation
  const genderValues = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
  const ageRangeValues = ["18-25", "26-35", "36-45", "46+"] as const;
  const educationValues = ["High School", "Bachelor's", "Master's", "PhD", "Other", "Prefer not to say"] as const;
  const eventPrefValues = ["In-person gatherings", "Virtual meetups", "Small groups", "Large conferences", "Any"] as const;
  const collabStyleValues = ["Solo worker", "Team player", "Mentor/mentee", "Adaptable"] as const;
  const digitalIdValues = ["Early adopter", "Casual user", "Content creator", "Privacy-focused"] as const;
  const activityValues = ["Very active", "Moderately active", "Occasionally active", "Primarily sedentary"] as const;
  const cultExpValues = ["Well-traveled", "Local expert", "Cultural explorer", "Limited travel"] as const;
  const learnStyleValues = ["Self-taught", "Formal education", "Hands-on learner", "Visual learner"] as const;

  // Convert identityPreferences to the proper format
  const safeIdentityPreferences = user.identityPreferences && 
    typeof user.identityPreferences === 'object' && 
    !Array.isArray(user.identityPreferences) ? 
    user.identityPreferences : {};

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user.displayName || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      gender: safeEnumCast(user.gender, genderValues),
      ageRange: safeEnumCast(user.ageRange, ageRangeValues),
      countryOfOrigin: user.countryOfOrigin || "",
      languagesSpoken: user.languagesSpoken || "",
      culturalBackground: user.culturalBackground || "",
      education: safeEnumCast(user.education, educationValues),
      professionalField: user.professionalField || "",
      communityAffiliations: user.communityAffiliations || "",
      eventPreferences: safeEnumCast(user.eventPreferences, eventPrefValues),
      collaborationStyle: safeEnumCast(user.collaborationStyle, collabStyleValues),
      personalValues: user.personalValues || "",
      digitalIdentity: safeEnumCast(user.digitalIdentity, digitalIdValues),
      physicalActivityLevel: safeEnumCast(user.physicalActivityLevel, activityValues),
      culturalExperiences: safeEnumCast(user.culturalExperiences, cultExpValues),
      learningStyle: safeEnumCast(user.learningStyle, learnStyleValues),
      identityPreferences: safeIdentityPreferences,
      preferences: {
        retailPreferences: user.preferences?.retailPreferences || []
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user?.id) {
        console.error("User ID not found");
        throw new Error("Invalid user ID");
      }

      console.log(`Sending PATCH request to /api/users/${user.id}`);

      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          body: formData
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('Server response:', result);
        return result;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessMessage")
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      onSuccess?.(updatedUser.user);
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

  // Get the count of interests in each category that are selected
  const getSelectedCountByCategory = (category: string): number => {
    if (!interestsByCategory[category]) return 0;

    return interestsByCategory[category].filter(interest => 
      pendingInterests.has(interest.name)
    ).length;
  };

  const toggleRetailPreference = (preference: string) => {
    const currentPreferences = form.getValues("preferences.retailPreferences") || [];
    const newPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter(p => p !== preference)
      : [...currentPreferences, preference];
    form.setValue("preferences.retailPreferences", newPreferences, { shouldValidate: true });
  };

  const onSubmit = async (data: ProfileUpdateData) => {
    try {
      console.log('Submitting profile data:', data);
      const formData = new FormData();

      // Handle all fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (key === 'avatar') {
            if (value instanceof File) {
              formData.append('avatar', value);
              console.log('Adding avatar file to form data');
            } else if (typeof value === 'string') {
              formData.append('avatar', value);
              console.log('Adding avatar URL to form data:', value);
            }
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
            console.log(`Adding ${key} object to form data:`, value);
          } else {
            formData.append(key, String(value));
            console.log(`Adding ${key} to form data:`, value);
          }
        }
      });

      const headers = new Headers();
      headers.append('Accept', 'application/json');

      console.log('Sending update request to server...');
      await updateMutation.mutateAsync(formData);
      console.log('Update request sent');

    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
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
                    <div id="avatar-grid" className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto p-2" style={{ display: 'none' }}>
                      {Array.from({ length: 200 }, (_, i) => (
                        <div
                          key={`avatar-${i}`}
                          className={`cursor-pointer rounded-lg p-1 hover:bg-accent ${value === `https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar${i}` ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => onChange(`https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar${i}`)}
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar${i}`}
                            alt={`Avatar ${i + 1}`}
                            className="w-full h-auto rounded"
                            loading="lazy"
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
                    <FormLabel>{t("profile.countryOfOrigin")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.cca2} value={country.cca2}>
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://flagcdn.com/w20/${country.cca2.toLowerCase()}.png`}
                                width="20" 
                                alt={country.name.common}
                              />
                              {country.name.common}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="languagesSpoken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages Spoken</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g. English, Spanish, Mandarin" />
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

            <div className="col-span-1 md:col-span-2 border-t border-secondary/20 pt-4 mt-4">
              <h4 className="text-md font-medium mb-2">Enhanced Identity Attributes</h4>
              <p className="text-sm text-muted-foreground mb-4">
                The following fields help create more meaningful connections based on your professional and personal identity.
              </p>
            </div>

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Education Level</option>
                      <option value="High School">High School</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professionalField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Field</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g. Technology, Healthcare, Education" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="communityAffiliations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community Affiliations</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Groups, organizations or communities you belong to" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Preferences</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Event Preference</option>
                      <option value="In-person gatherings">In-person gatherings</option>
                      <option value="Virtual meetups">Virtual meetups</option>
                      <option value="Small groups">Small groups</option>
                      <option value="Large conferences">Large conferences</option>
                      <option value="Any">Any type of event</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collaborationStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collaboration Style</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Collaboration Style</option>
                      <option value="Solo worker">Solo worker</option>
                      <option value="Team player">Team player</option>
                      <option value="Mentor/mentee">Mentor/mentee</option>
                      <option value="Adaptable">Adaptable</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalValues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Values</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Core values like environmental consciousness, social justice, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="digitalIdentity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Digital Identity</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Digital Identity</option>
                      <option value="Early adopter">Early adopter</option>
                      <option value="Casual user">Casual user</option>
                      <option value="Content creator">Content creator</option>
                      <option value="Privacy-focused">Privacy-focused</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physicalActivityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Activity Level</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Activity Level</option>
                      <option value="Very active">Very active</option>
                      <option value="Moderately active">Moderately active</option>
                      <option value="Occasionally active">Occasionally active</option>
                      <option value="Primarily sedentary">Primarily sedentary</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="culturalExperiences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cultural Experiences</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Cultural Experience</option>
                      <option value="Well-traveled">Well-traveled</option>
                      <option value="Local expert">Local expert</option>
                      <option value="Cultural explorer">Cultural explorer</option>
                      <option value="Limited travel">Limited travel</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="learningStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Style</FormLabel>
                  <FormControl>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      {...field}
                    >
                      <option value="">Select Learning Style</option>
                      <option value="Self-taught">Self-taught</option>
                      <option value="Formal education">Formal education</option>
                      <option value="Hands-on learner">Hands-on learner</option>
                      <option value="Visual learner">Visual learner</option>
                    </select>
                  </FormControl>
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
                <label className="text-sm font-medium mb-1 block">Languages Spoken Importance</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  defaultValue={user.identityPreferences?.languagesSpoken || 5}
                  className="w-full"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const currentPrefs = form.getValues("identityPreferences") || {};
                    form.setValue("identityPreferences", {
                      ...currentPrefs,
                      languagesSpoken: value
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

              <div className="mt-6 border-t border-secondary/20 pt-4">
                <h5 className="text-sm font-medium mb-3">Enhanced Identity Attributes Importance</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Education Level</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      defaultValue={user.identityPreferences?.education || 5}
                      className="w-full"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const currentPrefs = form.getValues("identityPreferences") || {};
                        form.setValue("identityPreferences", {
                          ...currentPrefs,
                          education: value
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Professional Field</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      defaultValue={user.identityPreferences?.professionalField || 5}
                      className="w-full"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const currentPrefs = form.getValues("identityPreferences") || {};
                        form.setValue("identityPreferences", {
                          ...currentPrefs,
                          professionalField: value
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Community Affiliations</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      defaultValue={user.identityPreferences?.communityAffiliations || 5}
                      className="w-full"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const currentPrefs = form.getValues("identityPreferences") || {};
                        form.setValue("identityPreferences", {
                          ...currentPrefs,
                          communityAffiliations: value
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Event Preferences</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      defaultValue={user.identityPreferences?.eventPreferences || 5}
                      className="w-full"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const currentPrefs = form.getValues("identityPreferences") || {};
                        form.setValue("identityPreferences", {
                          ...currentPrefs,
                          eventPreferences: value
                        });
                      }}
                    />
                  </div>
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
                          languagesSpoken: 5,
                          culturalBackground: 5,
                          education: 5,
                          professionalField: 5,
                          communityAffiliations: 5,
                          eventPreferences: 5,
                          collaborationStyle: 5,
                          personalValues: 5,
                          digitalIdentity: 5,
                          physicalActivityLevel: 5,
                          culturalExperiences: 5,
                          learningStyle: 5
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{t("profile.interests")}</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                type="button"
                onClick={() => {
                  if (!user?.id) return;
                  window.location.href = `/profile/${user.id}/interests/suggestions`;
                }}
                className="flex items-center gap-1"
              >
                <Sparkles className="h-4 w-4" />
                {t("profile.aiSuggestInterests")}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("profile.searchInterests") || "Search interests..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                <SearchIcon className="h-4 w-4" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t("profile.searchInterestsHelp") || "Type to search across all interest categories"}
              </div>
            </div>
          </div>

          {loadingInterests ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(filteredInterestsByCategory).length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {Object.keys(filteredInterestsByCategory).sort().map((category) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category}</span>
                      {getSelectedCountByCategory(category) > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {getSelectedCountByCategory(category)}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {filteredInterestsByCategory[category].map((interest, index) => (
                        <Badge
                          key={`interest-${interest.id}-${category}-${index}`}
                          variant={pendingInterests.has(interest.name) ? "default" : "outline"}
                          className="cursor-pointer hover:shadow-sm transition-all"
                          onClick={() => toggleInterest(interest.name)}
                        >
                          {interest.iconUrl || interestEmojis.get(interest.name)} {interest.name}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("profile.noInterestsAvailable")}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">{t("profile.retailPreferences")}</h3>
          <div className="flex flex-wrap gap-2">
            {RETAIL_PREFERENCES.map(preference => (
              <Badge
                key={preference}
                variant={form.watch("preferences.retailPreferences")?.includes(preference) ? "default" : "outline"}
                className="cursor-pointer hover:shadow-sm transition-all"
                onClick={() => toggleRetailPreference(preference)}
              >
                {preference}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t("profile.retailPreferencesHelp") || "Select the types of stores and products you prefer"}
          </div>
        </div>

        <Button
          type="button"
          disabled={updateMutation.isPending}
          className="w-full mt-6"
          onClick={() => {
            console.log('Button clicked directly');
            // Check for form validation errors
            console.log('Form validation errors:', form.formState.errors);
            
            // Custom submit handler with error logging
            const submitHandler = async (data: ProfileUpdateData) => {
              try {
                console.log('Custom submit handler called with data:', data);
                await onSubmit(data);
              } catch (error) {
                console.error('Error in custom submit handler:', error);
              }
            };
            
            form.handleSubmit(submitHandler)();
          }}
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