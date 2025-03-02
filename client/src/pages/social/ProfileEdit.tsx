import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ProfileEditForm from "@/components/profile/ProfileEdit"; 
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery as useQuery2, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card as Card2, CardContent as CardContent2, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { toBase64 } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import type { User as User2 } from "@shared/schema";
import TagInput from "@/components/profile/TagInput";

export default function ProfileEditPage() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();

  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isNaN(userId)
  });

  const [isLoading, setIsLoading] = useState(loadingUser);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    setIsLoading(loadingUser);
    setUserData(user);
  }, [loadingUser, user]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!userData?.user && !isLoading) {
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
            {userData?.user && (
              <ProfileEditForm 
                user={userData.user} 
                onSuccess={() => setLocation(`/profile/${userId}`)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const { toast } = useToast();
const queryClient = useQueryClient();
const { user: currentUser } = useAuth();
const [, params] = useRoute("/profile/edit/:id");
const userId = params?.id ? parseInt(params.id) : currentUser?.id;

// Form state
const [displayName, setDisplayName] = useState("");
const [bio, setBio] = useState("");
const [avatarFile, setAvatarFile] = useState<File | null>(null);
const [avatarPreview, setAvatarPreview] = useState("");
const [interests, setInterests] = useState<string[]>([]);
const [retailPreferences, setRetailPreferences] = useState<string[]>([]);

// Fetch current user data
const { data: userData, isLoading } = useQuery2<{ user: User2 }>({
  queryKey: [`/api/users/${userId}`],
  enabled: !!userId,
});

// Update user mutation
const updateUserMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    return await response.json();
  },
  onSuccess: () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  },
  onError: (error: Error) => {
    toast({
      title: "Error",
      description: error.message || "Failed to update profile",
      variant: "destructive",
    });
  },
});

// Initial data loading
useEffect(() => {
  if (userData?.user) {
    setDisplayName(userData.user.displayName || "");
    setBio(userData.user.bio || "");
    setAvatarPreview(userData.user.avatar || "");
    setInterests(userData.user.preferences?.interests || []);
    setRetailPreferences(userData.user.preferences?.retailPreferences || []);
  }
}, [userData]);

// Handle avatar file selection
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("displayName", displayName);
  if (bio) formData.append("bio", bio);

  // Add avatar file if selected
  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  // Add preferences as JSON
  formData.append("preferences", JSON.stringify({
    interests,
    retailPreferences
  }));

  updateUserMutation.mutate(formData);
};

// Interests enrichment with AI
const [isEnriching, setIsEnriching] = useState(false);
const [suggestions, setSuggestions] = useState<string[]>([]);

const enrichInterests = async () => {
  if (interests.length === 0) return;

  setIsEnriching(true);
  try {
    const response = await apiRequest('/api/interests/enrich', {
      method: 'POST',
      body: { interests }
    });

    if (!response.ok) throw new Error('Failed to get suggestions');

    const data = await response.json();
    setSuggestions(data.suggestions || []);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to get interest suggestions",
      variant: "destructive"
    });
  } finally {
    setIsEnriching(false);
  }
};

const addSuggestion = (suggestion: string) => {
  if (!interests.includes(suggestion)) {
    setInterests([...interests, suggestion]);
    // Remove from suggestions
    setSuggestions(suggestions.filter(s => s !== suggestion));
  }
};

if (isLoading) {
  return <div className="container flex items-center justify-center min-h-[80vh]">Loading profile data...</div>;
}

if (!userData?.user && !isLoading) {
  return <div className="container flex items-center justify-center min-h-[80vh]">User not found</div>;
}

return (
  <div className="container py-10">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card2>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Choose a profile picture to represent yourself
            </CardDescription>
          </CardHeader>
          <CardContent2 className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={avatarPreview} alt="Profile" />
              <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="avatar">Upload new picture</Label>
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </CardContent2>
        </Card2>

        <Card2>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent2 className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself"
                rows={4}
              />
            </div>
          </CardContent2>
        </Card2>

        <Card2>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
            <CardDescription>
              What topics are you interested in?
            </CardDescription>
          </CardHeader>
          <CardContent2 className="space-y-4">
            <TagInput
              tags={interests}
              setTags={setInterests}
              placeholder="Add interests"
              className="w-full"
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {interests.map(interest => (
                <div key={interest} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                  {interest}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={enrichInterests}
                disabled={isEnriching || interests.length === 0}
              >
                {isEnriching ? "Getting suggestions..." : "Get AI Suggestions"}
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(suggestion => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSuggestion(suggestion)}
                      className="rounded-full"
                    >
                      + {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent2>
        </Card2>

        <Card2>
          <CardHeader>
            <CardTitle>Shopping Preferences</CardTitle>
            <CardDescription>
              What types of products are you interested in?
            </CardDescription>
          </CardHeader>
          <CardContent2>
            <TagInput
              tags={retailPreferences}
              setTags={setRetailPreferences}
              placeholder="Add shopping preferences"
              className="w-full"
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {retailPreferences.map(pref => (
                <div key={pref} className="bg-secondary/10 text-secondary rounded-full px-3 py-1 text-sm">
                  {pref}
                </div>
              ))}
            </div>
          </CardContent2>
        </Card2>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={updateUserMutation.isPending}>
            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  </div>
);
}