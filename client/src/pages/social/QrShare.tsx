import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Share2, QrCode, Copy, Download, Users, Github, Laptop, Book, MapPin, Briefcase, Heart, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import * as htmlToImage from 'html-to-image';
import { useAuth } from '@/hooks/use-auth';

interface User {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  occupation: string | null;
  location: string | null;
  gender?: string | null;
  age?: number | null;
  ageRange?: string | null;
  countryOfOrigin?: string | null;
  languagesSpoken?: string | null;
  culturalBackground?: string | null;
  education?: string | null;
  professionalField?: string | null;
  eventPreferences?: string | null;
  collaborationStyle?: string | null;
  personalValues?: string | null;
  digitalIdentity?: string | null;
  physicalActivityLevel?: string | null;
  culturalExperiences?: string | null;
  learningStyle?: string | null;
}

interface Interest {
  id: number;
  name: string;
  category?: string;
  emoji?: string;
}

export default function QrShare() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [showFullDialog, setShowFullDialog] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const urlWithQrParam = `${window.location.origin}/shared/profile/${id}?source=qr&sharedBy=${id}`;
  
  // For the onboarding URL, use route parameters to minimize hooks issues
  const directOnboardingUrl = `${window.location.origin}/profile/onboarding/${id}`;
  
  // If no ID is provided and user is logged in, use the current user's ID
  const userId = id ? parseInt(id) : (currentUser ? currentUser.id : null);
  
  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isNaN(userId)
  });
  
  // Fetch user interests
  const { data: userInterests, isLoading: interestsLoading } = useQuery<{ interests: Interest[] }>({
    queryKey: [`/api/users/${userId}/interests`],
    enabled: !!userId && !isNaN(userId)
  });
  
  // Generate QR code for the profile URL with sharing parameters
  useEffect(() => {
    if (userId) {
      QRCode.toDataURL(urlWithQrParam)
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
          toast({
            title: 'Error',
            description: 'Failed to generate QR code',
            variant: 'destructive',
          });
        });
    }
  }, [userId, urlWithQrParam, toast]);
  
  // Function to copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(urlWithQrParam)
      .then(() => {
        toast({
          title: 'Link Copied',
          description: 'Profile link copied to clipboard',
          variant: 'default',
        });
      })
      .catch(() => {
        toast({
          title: 'Copy Failed',
          description: 'Could not copy link to clipboard',
          variant: 'destructive',
        });
      });
  };
  
  // Function to download the QR code
  const downloadQrCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `overlapp-profile-${userData?.user.username || 'user'}.png`;
      link.href = qrCodeUrl;
      link.click();
      
      toast({
        title: 'QR Code Downloaded',
        description: 'QR code has been downloaded',
        variant: 'default',
      });
    }
  };
  
  // Function to generate and download the contact card
  const downloadFullCard = () => {
    if (cardRef.current) {
      setIsGeneratingCard(true);
      
      htmlToImage.toJpeg(cardRef.current, { quality: 0.9 })
        .then(dataUrl => {
          const link = document.createElement('a');
          link.download = `${userData?.user.displayName || userData?.user.username}-contact-card.jpg`;
          link.href = dataUrl;
          link.click();
          setIsGeneratingCard(false);
          toast({
            title: 'Card Downloaded',
            description: 'Contact card has been downloaded',
            variant: 'default',
          });
        })
        .catch(error => {
          console.error('Error downloading contact card:', error);
          setIsGeneratingCard(false);
          toast({
            title: 'Error',
            description: 'Failed to generate contact card image',
            variant: 'destructive',
          });
        });
    }
  };
  
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
  
  if (userLoading || interestsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            Share Your Profile
          </CardTitle>
          <CardDescription>
            Create a QR code to connect with others and discover overlapping interests in-person
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">QR Profile</TabsTrigger>
              <TabsTrigger value="card">Digital Contact Card</TabsTrigger>
            </TabsList>
            
            {/* QR Code Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                  {qrCodeUrl && (
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <img 
                        src={qrCodeUrl} 
                        alt="Profile QR Code" 
                        className="w-64 h-64"
                      />
                    </div>
                  )}
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Scan with any QR reader to view and connect with {userData.user.displayName || userData.user.username}'s profile
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    <Button variant="outline" onClick={copyLinkToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" onClick={downloadQrCode}>
                      <Download className="h-4 w-4 mr-2" />
                      Download QR
                    </Button>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  <h3 className="text-lg font-medium mb-4">When someone scans your QR code:</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">View Your Profile</h4>
                        <p className="text-sm text-muted-foreground">They'll see your profile with all public information</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Create Their Own Profile</h4>
                        <p className="text-sm text-muted-foreground">They're prompted to sign up and create their own profile</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Discover Overlapping Interests</h4>
                        <p className="text-sm text-muted-foreground">See common interests, values, and suggested conversation starters</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Digital Contact Card Tab */}
            <TabsContent value="card" className="space-y-6">
              <div className="flex flex-col items-center">
                {/* Preview of the digital contact card */}
                <div 
                  className="w-full max-w-md mx-auto bg-card border rounded-lg overflow-hidden shadow-md mb-6 cursor-pointer"
                  onClick={() => setShowFullDialog(true)}
                >
                  <div className="p-5">
                    {/* Header with profile picture and name */}
                    <div className="flex items-center mb-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden mr-3 border border-primary/30">
                        <img 
                          src={userData.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {userData.user.displayName || userData.user.username}
                        </h2>
                        <p className="text-sm text-muted-foreground">@{userData.user.username}</p>
                        {userData.user.occupation && (
                          <div className="flex items-center mt-1">
                            <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{userData.user.occupation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Interests preview */}
                    {userInterests?.interests && userInterests.interests.length > 0 && (
                      <div className="mb-3">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-blue-500" />
                          Interests & Passions
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {userInterests.interests.slice(0, 5).map((interest, index) => (
                            <Badge key={`interest-${interest.id}-${index}`} variant="secondary" className="text-xs">
                              {interest.emoji && <span className="mr-1">{interest.emoji}</span>}
                              {interest.name}
                            </Badge>
                          ))}
                          {userInterests.interests.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{userInterests.interests.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* QR Code */}
                    <div className="flex justify-center mt-3">
                      {qrCodeUrl && (
                        <div className="bg-white p-2 rounded border">
                          <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-center text-muted-foreground mt-2">Tap to view full card</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadFullCard} disabled={isGeneratingCard}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Card
                  </Button>
                  <Button variant="default" onClick={() => setShowFullDialog(true)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    View Full Card
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Full Contact Card Dialog */}
      <Dialog open={showFullDialog} onOpenChange={setShowFullDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Digital Contact Card</DialogTitle>
            <DialogDescription>
              Share this card to connect with others and discover overlapping interests
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4" ref={cardRef}>
            <div className="bg-card border rounded-lg overflow-hidden p-5">
              {/* Header with profile picture and name */}
              <div className="flex items-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-2 border-primary/30 shadow">
                  <img 
                    src={userData.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {userData.user.displayName || userData.user.username}
                  </h2>
                  <p className="text-sm text-muted-foreground">@{userData.user.username}</p>
                  {userData.user.occupation && (
                    <div className="flex items-center mt-1">
                      <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{userData.user.occupation}</p>
                    </div>
                  )}
                  {userData.user.location && (
                    <div className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{userData.user.location}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bio section */}
              {userData.user.bio && (
                <div className="border-t pt-3 mb-4">
                  <h3 className="font-medium mb-1 flex items-center">
                    <Book className="h-4 w-4 mr-2 text-amber-500" /> 
                    About Me
                  </h3>
                  <p className="text-sm">{userData.user.bio}</p>
                </div>
              )}
              
              {/* Interests section */}
              {userInterests?.interests && userInterests.interests.length > 0 && (
                <div className="border-t pt-3 mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    Interests & Passions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userInterests.interests.map((interest, index) => (
                      <Badge key={`interest-${interest.id}-${index}`} variant="secondary">
                        {interest.emoji && <span className="mr-1">{interest.emoji}</span>}
                        {interest.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Key Identity Attributes */}
              <div className="border-t pt-3 mb-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-rose-500" />
                  Identity Attributes
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {userData.user.professionalField && (
                    <div>
                      <p className="text-xs text-muted-foreground">Professional Field</p>
                      <p className="text-sm font-medium">{userData.user.professionalField}</p>
                    </div>
                  )}
                  {userData.user.education && (
                    <div>
                      <p className="text-xs text-muted-foreground">Education</p>
                      <p className="text-sm font-medium">{userData.user.education}</p>
                    </div>
                  )}
                  {userData.user.collaborationStyle && (
                    <div>
                      <p className="text-xs text-muted-foreground">Collaboration Style</p>
                      <p className="text-sm font-medium">{userData.user.collaborationStyle}</p>
                    </div>
                  )}
                  {userData.user.personalValues && (
                    <div>
                      <p className="text-xs text-muted-foreground">Personal Values</p>
                      <p className="text-sm font-medium">{userData.user.personalValues}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* QR Code */}
              <div className="flex justify-center mb-2">
                {qrCodeUrl && (
                  <div className="bg-white p-2 rounded-md border">
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground">Scan to view full profile and connect</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={downloadFullCard} disabled={isGeneratingCard}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="default" onClick={copyLinkToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}