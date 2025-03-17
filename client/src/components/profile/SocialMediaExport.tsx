import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Share2, Download, QrCode, MapPin, Briefcase, Book, Globe, Heart } from 'lucide-react';
import QRCode from 'qrcode';
import * as htmlToImage from 'html-to-image';
import { useQuery } from '@tanstack/react-query';

// Define a simplified User type for this component
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

interface SocialMediaExportProps {
  userId: number;
}

export default function SocialMediaExport({ userId }: SocialMediaExportProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  
  // Fetch the user data for contact card
  const { data: userData } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId
  });
  
  // Fetch user interests
  const { data: userInterests } = useQuery<{ interests: Interest[] }>({
    queryKey: [`/api/users/${userId}/interests`],
    enabled: !!userId
  });
  
  // Generate QR code for the profile URL
  useEffect(() => {
    if (userId) {
      const profileUrl = `${window.location.origin}/profile/${userId}`;
      QRCode.toDataURL(profileUrl)
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
        });
    }
  }, [userId]);

  // Function to copy image to clipboard
  const copyToClipboard = (dataUrl: string) => {
    // Create a textarea element to copy the data URL
    const textarea = document.createElement('textarea');
    textarea.value = dataUrl;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      toast({
        title: "Copied to Clipboard",
        description: "Image URL copied to clipboard. You can paste it into messages or social media.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Try the download option instead.",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(textarea);
    }
  };
  
  // Function to handle sharing the contact card
  const handleShareCard = () => {
    if (cardRef.current) {
      setIsGeneratingCard(true);
      htmlToImage.toPng(cardRef.current)
        .then(dataUrl => {
          if (navigator.share) {
            const blob = dataURItoBlob(dataUrl);
            const file = new File([blob], `${userData?.user.displayName || userData?.user.username}-contact-card.png`, { type: 'image/png' });
            
            navigator.share({
              title: 'My Overlapp Contact Card',
              text: `Check out my digital identity card from Overlapp`,
              files: [file]
            })
              .then(() => {
                toast({
                  title: "Shared",
                  description: "Contact card has been shared",
                  variant: "default",
                });
              })
              .catch(error => {
                console.error('Error sharing:', error);
                toast({
                  title: "Share Failed",
                  description: "Could not share the contact card",
                  variant: "destructive",
                });
              });
          } else {
            // Fallback to copy if Web Share API is not available
            copyToClipboard(dataUrl);
          }
          setIsGeneratingCard(false);
        })
        .catch(error => {
          console.error('Error generating contact card:', error);
          setIsGeneratingCard(false);
          toast({
            title: "Error",
            description: "Failed to generate contact card image",
            variant: "destructive",
          });
        });
    }
  };

  // Function to download the contact card
  const handleDownloadCard = () => {
    if (cardRef.current) {
      setIsGeneratingCard(true);
      htmlToImage.toPng(cardRef.current)
        .then(dataUrl => {
          const link = document.createElement('a');
          link.download = `${userData?.user.displayName || userData?.user.username}-contact-card.png`;
          link.href = dataUrl;
          link.click();
          setIsGeneratingCard(false);
          toast({
            title: "Downloaded",
            description: "Contact card has been downloaded",
            variant: "default",
          });
        })
        .catch(error => {
          console.error('Error downloading contact card:', error);
          setIsGeneratingCard(false);
          toast({
            title: "Error",
            description: "Failed to generate contact card image",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            Digital Contact Card
          </CardTitle>
          <CardDescription>
            Share your digital identity with a customized contact card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Digital Contact Card */}
            <div className="w-full max-w-md mx-auto bg-card border rounded-lg overflow-hidden shadow-lg" ref={cardRef}>
              <div className="p-5">
                {/* Header with profile picture and name */}
                <div className="flex items-center mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-2 border-primary shadow-lg">
                    <img 
                      src={userData?.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{userData?.user.displayName || userData?.user.username}</h2>
                    <p className="text-sm text-muted-foreground">@{userData?.user.username}</p>
                    {userData?.user.occupation && (
                      <div className="flex items-center mt-1">
                        <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{userData.user.occupation}</p>
                      </div>
                    )}
                    {userData?.user.location && (
                      <div className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{userData.user.location}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bio section */}
                {userData?.user.bio && (
                  <div className="border-t pt-3 mb-4">
                    <h3 className="font-medium mb-1 flex items-center">
                      <Book className="h-4 w-4 mr-2 text-amber-500" /> 
                      About Me
                    </h3>
                    <p className="text-sm italic">" {userData.user.bio} "</p>
                  </div>
                )}
                
                {/* Identity attributes section */}
                <div className="border-t pt-3 mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-rose-500" />
                    Identity Attributes
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {userData?.user.gender && (
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="text-sm">{userData.user.gender}</p>
                      </div>
                    )}
                    {userData?.user.ageRange && (
                      <div>
                        <p className="text-xs text-muted-foreground">Age Range</p>
                        <p className="text-sm">{userData.user.ageRange}</p>
                      </div>
                    )}
                    {userData?.user.countryOfOrigin && (
                      <div>
                        <p className="text-xs text-muted-foreground">Country of Origin</p>
                        <p className="text-sm">{userData.user.countryOfOrigin}</p>
                      </div>
                    )}
                    {userData?.user.languagesSpoken && (
                      <div>
                        <p className="text-xs text-muted-foreground">Languages</p>
                        <p className="text-sm">{userData.user.languagesSpoken}</p>
                      </div>
                    )}
                    {userData?.user.education && (
                      <div>
                        <p className="text-xs text-muted-foreground">Education</p>
                        <p className="text-sm">{userData.user.education}</p>
                      </div>
                    )}
                    {userData?.user.professionalField && (
                      <div>
                        <p className="text-xs text-muted-foreground">Professional Field</p>
                        <p className="text-sm">{userData.user.professionalField}</p>
                      </div>
                    )}
                    {userData?.user.culturalBackground && (
                      <div>
                        <p className="text-xs text-muted-foreground">Cultural Background</p>
                        <p className="text-sm">{userData.user.culturalBackground}</p>
                      </div>
                    )}
                    {userData?.user.collaborationStyle && (
                      <div>
                        <p className="text-xs text-muted-foreground">Collaboration Style</p>
                        <p className="text-sm">{userData.user.collaborationStyle}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Interests section */}
                {userInterests?.interests && userInterests.interests.length > 0 && (
                  <div className="border-t pt-3 mb-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-blue-500" />
                      Interests & Passions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userInterests.interests.map((interest, index) => (
                        <div key={`interest-${interest.id}-${index}`} className="px-3 py-1 bg-secondary rounded-full flex items-center text-sm">
                          <span className="mr-1">{interest.emoji || '🌟'}</span>
                          <span>{interest.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* QR Code */}
                <div className="flex justify-center mt-4 mb-1">
                  {qrCodeUrl && (
                    <div className="bg-white p-2 rounded-md">
                      <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground">Scan to view full profile</p>
              </div>
            </div>
            
            {/* Sharing Options */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (cardRef.current) {
                    setIsGeneratingCard(true);
                    htmlToImage.toPng(cardRef.current)
                      .then(dataUrl => {
                        copyToClipboard(dataUrl);
                        setIsGeneratingCard(false);
                      })
                      .catch(error => {
                        console.error('Error copying contact card:', error);
                        setIsGeneratingCard(false);
                        toast({
                          title: "Error",
                          description: "Failed to generate contact card image",
                          variant: "destructive",
                        });
                      });
                  }
                }}
                disabled={isGeneratingCard}
                className="min-w-[140px]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleDownloadCard}
                disabled={isGeneratingCard}
                className="min-w-[140px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Card
              </Button>
              
              <Button 
                variant="default"
                onClick={handleShareCard}
                disabled={isGeneratingCard}
                className="min-w-[140px]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to convert data URI to Blob
function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}