import React, { useState, useEffect } from 'react';
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  AtSign, Calendar, User, Globe, Briefcase, MapPin, Book, Users, 
  Heart, Sparkles, ArrowRight, LogIn, UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import type { User as UserType, PostWithUser } from "@shared/schema";
import { useLocation } from "wouter";

// Added type definition for Interest
interface Interest {
  id: number;
  name: string;
  category: string;
  description?: string;
  iconUrl?: string;
  emoji?: string;
  isAiGenerated?: boolean;
}

export default function SharedProfile() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  
  // Parse URL query parameters
  const [source, setSource] = useState<string | null>(null);
  const [sharedBy, setSharedBy] = useState<string | null>(null);
  
  // Extract query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setSource(searchParams.get('source'));
    setSharedBy(searchParams.get('sharedBy'));
  }, [location]);
  
  const isQrScanned = source === 'qr';
  
  // Auth state
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!currentUser;
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  // Parse the user ID
  const userId = id ? parseInt(id) : null;
  
  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<{ user: UserType }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isNaN(userId)
  });
  
  // Fetch user interests
  const { data: userInterests, isLoading: interestsLoading } = useQuery<{ interests: Interest[] }>({
    queryKey: [`/api/users/${userId}/interests`],
    enabled: !!userId && !isNaN(userId)
  });
  
  // Handle cases where we don't have a valid user ID
  if (!userId || isNaN(userId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Invalid user ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Loading state
  if (userLoading || interestsLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // User not found state
  if (!userData?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Determine if the user is viewing their own profile
  const isOwnProfile = currentUser?.id === userId;
  
  // Determine if they're viewing someone else's profile after scanning QR
  const isQrViewer = isQrScanned && !isOwnProfile;
  
  // Categories for interests
  const categorizedInterests = userInterests?.interests.reduce((acc, interest) => {
    const category = interest.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>) || {};
  
  // Handler for the "Create Profile" button
  const handleCreateProfile = () => {
    // Store the shared profile ID in localStorage to use after signup and onboarding
    localStorage.setItem('pendingOverlapUserId', userId.toString());
    
    // Add a query parameter to indicate this came from a QR code scan
    navigate('/signup?source=qr-signup');
  };
  
  // Handler for the "View Overlap" button
  const handleViewOverlap = () => {
    navigate(`/social/overlap?targetUserId=${userId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* QR Scan Banner for new users */}
      {isQrViewer && !isAuthenticated && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle>You scanned {userData.user.displayName || userData.user.username}'s Overlapp Profile</AlertTitle>
          <AlertDescription>
            Create your own profile to see what interests you share and get personalized conversation starters.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreateProfile} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Create Profile
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')} className="gap-2">
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </div>
        </Alert>
      )}
      
      {/* QR Scan Banner for logged-in users */}
      {isQrViewer && isAuthenticated && !isOwnProfile && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle>You scanned {userData.user.displayName || userData.user.username}'s Overlapp Profile</AlertTitle>
          <AlertDescription>
            Click "View Overlap" to see what interests you share and get conversation starters.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleViewOverlap} className="gap-2">
              <Users className="h-4 w-4" />
              View Overlap
            </Button>
          </div>
        </Alert>
      )}
      
      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarFallback>{userData.user.displayName?.[0] || userData.user.username[0]}</AvatarFallback>
              {userData.user.avatar && (
                <AvatarImage src={userData.user.avatar} alt={userData.user.displayName || "User"} />
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {userData.user.displayName || userData.user.username}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <AtSign className="h-3 w-3" />
                {userData.user.username}
              </CardDescription>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                {userData.user.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(userData.user.createdAt), 'MMM yyyy')}
                  </div>
                )}
                {userData.user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {userData.user.location}
                  </div>
                )}
                {userData.user.occupation && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {userData.user.occupation}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {userData.user.bio && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary/70" />
                    About
                  </h2>
                  <p className="text-muted-foreground">
                    {userData.user.bio}
                  </p>
                </div>
              )}
              
              {/* Identity Attributes */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary/70" />
                  Identity Attributes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.user.gender && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Gender</span>
                      <span className="font-medium">{userData.user.gender}</span>
                    </div>
                  )}
                  
                  {userData.user.ageRange && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Age Range</span>
                      <span className="font-medium">{userData.user.ageRange}</span>
                    </div>
                  )}
                  
                  {userData.user.countryOfOrigin && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Country of Origin</span>
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://flagcdn.com/w20/${userData.user.countryOfOrigin.toLowerCase()}.png`}
                          width="20" 
                          alt={userData.user.countryOfOrigin}
                        />
                        <span className="font-medium">{userData.user.countryOfOrigin}</span>
                      </div>
                    </div>
                  )}
                  
                  {userData.user.languagesSpoken && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Languages Spoken</span>
                      <span className="font-medium">{userData.user.languagesSpoken}</span>
                    </div>
                  )}
                  
                  {userData.user.culturalBackground && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Cultural Background</span>
                      <span className="font-medium">{userData.user.culturalBackground}</span>
                    </div>
                  )}
                  
                  {userData.user.education && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Education</span>
                      <span className="font-medium">{userData.user.education}</span>
                    </div>
                  )}
                  
                  {userData.user.professionalField && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Professional Field</span>
                      <span className="font-medium">{userData.user.professionalField}</span>
                    </div>
                  )}
                  
                  {userData.user.communityAffiliations && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Community Affiliations</span>
                      <span className="font-medium">{userData.user.communityAffiliations}</span>
                    </div>
                  )}
                  
                  {userData.user.personalValues && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Personal Values</span>
                      <span className="font-medium">{userData.user.personalValues}</span>
                    </div>
                  )}
                  
                  {userData.user.collaborationStyle && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Collaboration Style</span>
                      <span className="font-medium">{userData.user.collaborationStyle}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="border-t pt-6 flex flex-col sm:flex-row gap-4 justify-end">
                {!isAuthenticated ? (
                  <>
                    <Button onClick={handleCreateProfile} variant="default" className="w-full sm:w-auto">
                      Create Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : !isOwnProfile ? (
                  <Button onClick={handleViewOverlap} variant="default" className="w-full sm:w-auto">
                    View Overlap
                    <Users className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Link href={`/profile/${userId}/edit`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
            </TabsContent>
            
            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary/70" />
                  Interests & Passions
                </h2>
                
                {userInterests?.interests.length ? (
                  <div className="space-y-6">
                    {Object.entries(categorizedInterests).map(([category, interests]) => (
                      <div key={category} className="space-y-2">
                        <h3 className="text-md font-medium">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {interests.map((interest) => (
                            <Badge key={interest.id} variant="secondary" className="text-sm py-1">
                              {interest.emoji && <span className="mr-1">{interest.emoji}</span>}
                              {interest.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No interests have been added yet.</p>
                )}
              </div>
              
              {/* Actions */}
              <div className="border-t pt-6 flex flex-col sm:flex-row gap-4 justify-end">
                {!isAuthenticated ? (
                  <>
                    <Button onClick={handleCreateProfile} variant="default" className="w-full sm:w-auto">
                      Create Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : !isOwnProfile ? (
                  <Button onClick={handleViewOverlap} variant="default" className="w-full sm:w-auto">
                    View Overlap
                    <Users className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Link href={`/profile/${userId}/edit`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}