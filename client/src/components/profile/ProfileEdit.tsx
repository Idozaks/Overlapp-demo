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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  avatar: z.union([z.string().url({ message: "Please enter a valid URL" }), z.instanceof(File)]).optional().or(z.literal("")),
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
      languagesSpoken: user.languagesSpoken || "",
      culturalBackground: user.culturalBackground || "",
      education: user.education || "",
      professionalField: user.professionalField || "",
      communityAffiliations: user.communityAffiliations || "",
      eventPreferences: user.eventPreferences || "",
      collaborationStyle: user.collaborationStyle || "",
      personalValues: user.personalValues || "",
      digitalIdentity: user.digitalIdentity || "",
      physicalActivityLevel: user.physicalActivityLevel || "",
      culturalExperiences: user.culturalExperiences || "",
      learningStyle: user.learningStyle || "",
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
      languagesSpoken: data.languagesSpoken || undefined,
      culturalBackground: data.culturalBackground || undefined,
      education: data.education || undefined,
      professionalField: data.professionalField || undefined,
      communityAffiliations: data.communityAffiliations || undefined,
      eventPreferences: data.eventPreferences || undefined,
      collaborationStyle: data.collaborationStyle || undefined,
      personalValues: data.personalValues || undefined,
      digitalIdentity: data.digitalIdentity || undefined,
      physicalActivityLevel: data.physicalActivityLevel || undefined,
      culturalExperiences: data.culturalExperiences || undefined,
      learningStyle: data.learningStyle || undefined,
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
          <FormLabel>{t("profile.interests")}</FormLabel>
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