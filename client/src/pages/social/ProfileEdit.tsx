import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ProfileEditForm from "@/components/profile/ProfileEdit";
import type { User } from "@shared/schema";

export default function ProfileEditPage() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();

  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
            <ProfileEditForm 
              user={user.user} 
              onSuccess={() => setLocation(`/profile/${userId}`)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useParams, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, X, Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";

const formSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  bio: z.string().optional(),
  avatar: z.any().optional(),
});

export default function ProfileEdit() {
  const params = useParams();
  const userId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [suggestedInterests, setSuggestedInterests] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [enrichSuccess, setEnrichSuccess] = useState(false);
  const [enrichSuccessMessage, setEnrichSuccessMessage] = useState("");
  
  // Fetch the user data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data.user;
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
        bio: profile.bio || "",
      });
      
      // Initialize interests from profile
      if (profile.preferences?.interests) {
        setInterests(profile.preferences.interests);
      }
    }
  }, [profile]);

  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      avatar: undefined,
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const response = await axios.patch(`/api/users/${userId}`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast({
        title: "Profile updated!",
        description: "Your profile information has been updated successfully.",
      });
      navigate(`/profile/${userId}`);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
      console.error("Error updating profile:", error);
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("displayName", values.displayName);
    
    if (values.bio) {
      formData.append("bio", values.bio);
    }
    
    if (values.avatar && values.avatar[0]) {
      formData.append("avatar", values.avatar[0]);
    }
    
    // Add interests to the form data
    if (interests.length > 0) {
      formData.append("preferences", JSON.stringify({ 
        interests,
        retailPreferences: profile?.preferences?.retailPreferences || [] 
      }));
    }
    
    updateMutation.mutate(formData);
  };

  // Add new interest
  const addInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest("");
    }
  };

  // Remove interest
  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  // Add suggested interest
  const addSuggestedInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
  };

  // Get interest suggestions from OpenAI
  const getInterestSuggestions = async () => {
    if (interests.length === 0) return;
    
    setIsLoadingSuggestions(true);
    setEnrichSuccess(false);
    
    try {
      const response = await axios.post('/api/interests/enrich', {
        interests
      });
      
      setSuggestedInterests(response.data.suggestions || []);
      setEnrichSuccess(true);
      setEnrichSuccessMessage("Found related interests! Check out our suggestions.");
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get interest suggestions.",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (user.id !== userId)) {
    navigate(`/profile/${userId}`);
    return null;
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar} alt={profile?.displayName} />
                <AvatarFallback>{profile?.displayName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="px-2 py-1">
                    {interest}
                    <button 
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex w-full space-x-2">
                <Input
                  id="newInterest"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={addInterest}
                >
                  Add
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={getInterestSuggestions}
                  disabled={isLoadingSuggestions || interests.length === 0}
                >
                  {isLoadingSuggestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting suggestions...
                    </>
                  ) : (
                    "Get Interest Suggestions"
                  )}
                </Button>
                
                {enrichSuccess && (
                  <span className="text-sm text-green-600">{enrichSuccessMessage}</span>
                )}
              </div>
              
              {suggestedInterests.length > 0 && (
                <Card className="p-3 mt-2">
                  <h3 className="text-sm font-medium mb-2">Suggested Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedInterests.map((interest) => (
                      <Badge 
                        key={interest} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => addSuggestedInterest(interest)}
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/profile/${userId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
