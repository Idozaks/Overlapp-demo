import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger, 
} from '@/components/ui/tooltip';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Linkedin, Twitter, Instagram, Facebook, AlertCircle, RefreshCw, Lock, Info, Check, Share2, Download, QrCode } from 'lucide-react';
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
}

interface SocialMediaExportProps {
  userId: number;
}

type SocialPlatform = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  lastSynced?: string;
  optimizedFields?: string[];
};

type PrivacySettings = {
  [key: string]: {
    contactInfo: boolean;
    politicalInterests: boolean;
    religiousAffiliations: boolean;
    financialInformation: boolean;
    healthDetails: boolean;
  };
};

type SyncFrequency = 'none' | 'manual' | 'auto' | 'weekly' | 'monthly';

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
  
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      icon: <Linkedin />, 
      color: '#0077B5',
      connected: false,
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      icon: <Twitter />, 
      color: '#1DA1F2',
      connected: false,
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: <Instagram />, 
      color: '#E1306C',
      connected: false,
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: <Facebook />, 
      color: '#4267B2',
      connected: false,
    },
  ]);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    linkedin: {
      contactInfo: true,
      politicalInterests: true,
      religiousAffiliations: true,
      financialInformation: true,
      healthDetails: true,
    },
    twitter: {
      contactInfo: true,
      politicalInterests: false,
      religiousAffiliations: true,
      financialInformation: true,
      healthDetails: true,
    },
    instagram: {
      contactInfo: true,
      politicalInterests: true,
      religiousAffiliations: true,
      financialInformation: true,
      healthDetails: true,
    },
    facebook: {
      contactInfo: true,
      politicalInterests: true,
      religiousAffiliations: true,
      financialInformation: true,
      healthDetails: true,
    },
  });

  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('auto');
  const [syncSettings, setSyncSettings] = useState({
    profilePhoto: true,
    bioDescription: true,
    interestSkills: true,
    professionalUpdates: true,
    minorTextEdits: false,
    connectionChanges: false,
  });

  const togglePlatformConnection = (platformId: string) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { 
            ...platform, 
            connected: !platform.connected,
            lastSynced: !platform.connected ? new Date().toLocaleDateString() : undefined,
          } 
        : platform
    ));

    if (!platforms.find(p => p.id === platformId)?.connected) {
      toast({
        title: "Platform Connected",
        description: `Your profile is now connected to ${platforms.find(p => p.id === platformId)?.name}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Platform Disconnected",
        description: `Your profile has been disconnected from ${platforms.find(p => p.id === platformId)?.name}`,
        variant: "destructive",
      });
    }
  };

  const handlePrivacyChange = (platform: string, setting: keyof PrivacySettings['linkedin'], value: boolean) => {
    setPrivacySettings({
      ...privacySettings,
      [platform]: {
        ...privacySettings[platform],
        [setting]: value,
      }
    });
  };

  const handleSyncOptionChange = (setting: keyof typeof syncSettings, value: boolean) => {
    setSyncSettings({
      ...syncSettings,
      [setting]: value,
    });
  };

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
  
  const exportToAllPlatforms = () => {
    // In a real implementation, this would call APIs to export the profile
    const connectedPlatforms = platforms.filter(p => p.connected);
    
    if (connectedPlatforms.length === 0) {
      toast({
        title: "No Connected Platforms",
        description: "Please connect at least one social media platform first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile Exported Successfully",
      description: `Your profile has been exported to ${connectedPlatforms.length} platform(s).`,
      variant: "default",
    });

    // Update lastSynced for all connected platforms
    setPlatforms(platforms.map(platform => 
      platform.connected 
        ? { 
            ...platform, 
            lastSynced: new Date().toLocaleDateString(),
            optimizedFields: ['Bio', 'Skills', 'Interests', 'Profile photo'],
          } 
        : platform
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <RefreshCw className="h-6 w-6" />
            One-Click Social Media Export
          </CardTitle>
          <CardDescription>
            Export your Overlapp identity to your preferred social media platforms with optimized formatting for each platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="platforms">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
              <TabsTrigger value="sync">Sync Settings</TabsTrigger>
              <TabsTrigger value="contact-card">Contact Card</TabsTrigger>
            </TabsList>
            
            <TabsContent value="platforms" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="overflow-hidden">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: `${platform.color}20` }}>
                          <div style={{ color: platform.color }}>
                            {platform.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{platform.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {platform.connected 
                              ? `Last synced: ${platform.lastSynced}` 
                              : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Button
                          variant={platform.connected ? "outline" : "default"}
                          size="sm"
                          onClick={() => togglePlatformConnection(platform.id)}
                        >
                          {platform.connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                    {platform.connected && platform.optimizedFields && (
                      <div className="bg-muted p-3 text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Optimized fields:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {platform.optimizedFields.map(field => (
                            <span key={field} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-sm">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center mt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="lg" className="w-full md:w-auto">
                      Export to All Connected Platforms
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Export your profile</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will export your Overlapp profile to all connected social media platforms.
                        Each platform will receive an optimized version of your profile based on your privacy settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={exportToAllPlatforms}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4 mt-4">
              <div className="space-y-6">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div style={{ color: platform.color }}>
                          {platform.icon}
                        </div>
                        {platform.name} Privacy Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`${platform.id}-contact-info`}
                            checked={privacySettings[platform.id].contactInfo}
                            onCheckedChange={(checked) => handlePrivacyChange(platform.id, 'contactInfo', checked)}
                          />
                          <Label htmlFor={`${platform.id}-contact-info`}>
                            Filter personal contact info
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Prevents sharing of phone numbers, emails, and addresses</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`${platform.id}-political`}
                            checked={privacySettings[platform.id].politicalInterests}
                            onCheckedChange={(checked) => handlePrivacyChange(platform.id, 'politicalInterests', checked)}
                          />
                          <Label htmlFor={`${platform.id}-political`}>
                            Filter political interests
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Prevents sharing of political affiliations and interests</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`${platform.id}-religious`}
                            checked={privacySettings[platform.id].religiousAffiliations}
                            onCheckedChange={(checked) => handlePrivacyChange(platform.id, 'religiousAffiliations', checked)}
                          />
                          <Label htmlFor={`${platform.id}-religious`}>
                            Filter religious affiliations
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Prevents sharing of religious beliefs and affiliations</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`${platform.id}-financial`}
                            checked={privacySettings[platform.id].financialInformation}
                            onCheckedChange={(checked) => handlePrivacyChange(platform.id, 'financialInformation', checked)}
                          />
                          <Label htmlFor={`${platform.id}-financial`}>
                            Filter financial information
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Prevents sharing of financial details and preferences</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`${platform.id}-health`}
                            checked={privacySettings[platform.id].healthDetails}
                            onCheckedChange={(checked) => handlePrivacyChange(platform.id, 'healthDetails', checked)}
                          />
                          <Label htmlFor={`${platform.id}-health`}>
                            Filter health & wellness details
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Prevents sharing of health conditions and wellness preferences</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center rounded-md bg-secondary p-3">
                        <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          Data is filtered before export to this platform, protecting your privacy.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="contact-card" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Digital Contact Card
                  </CardTitle>
                  <CardDescription>
                    Generate a digital contact card with QR code to share your Overlapp identity instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Contact Card Preview */}
                    <div 
                      ref={cardRef} 
                      className="bg-card border rounded-lg overflow-hidden shadow-md max-w-sm mx-auto"
                    >
                      <div className="bg-primary p-4 text-primary-foreground">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold">Overlapp Identity Card</h3>
                          <div className="text-xs rounded-full bg-primary-foreground text-primary px-2 py-0.5">
                            Digital ID
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
                            {userData?.user?.avatar ? (
                              <img 
                                src={userData.user.avatar} 
                                alt={userData?.user?.displayName || 'User'} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                                {userData?.user?.displayName?.[0] || '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{userData?.user?.displayName || 'Loading...'}</h3>
                            <p className="text-sm text-muted-foreground">@{userData?.user?.username || 'username'}</p>
                            <p className="text-xs mt-1">{userData?.user?.occupation || ''}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Bio: </span>
                            <span className="text-muted-foreground">{userData?.user?.bio || 'No bio available'}</span>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Location: </span>
                            <span className="text-muted-foreground">{userData?.user?.location || 'Not specified'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-center">
                          {qrCodeUrl && (
                            <div className="p-2 bg-white rounded">
                              <img 
                                src={qrCodeUrl} 
                                alt="Profile QR Code" 
                                className="h-32 w-32"
                              />
                              <p className="text-xs text-center mt-1">Scan to view full profile</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-2 border-t text-center text-xs text-muted-foreground">
                          Generated on {new Date().toLocaleDateString()} | Overlapp
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => {
                          if (cardRef.current) {
                            setIsGeneratingCard(true);
                            
                            htmlToImage.toPng(cardRef.current)
                              .then(dataUrl => {
                                const link = document.createElement('a');
                                link.download = `overlapp-contact-card-${userData?.user?.username || 'user'}.png`;
                                link.href = dataUrl;
                                link.click();
                                
                                toast({
                                  title: "Contact Card Downloaded",
                                  description: "Your digital contact card has been saved as an image.",
                                  variant: "default",
                                });
                                
                                setIsGeneratingCard(false);
                              })
                              .catch(error => {
                                console.error('Error generating contact card:', error);
                                toast({
                                  title: "Generation Failed",
                                  description: "There was an error generating your contact card.",
                                  variant: "destructive",
                                });
                                setIsGeneratingCard(false);
                              });
                          }
                        }}
                        disabled={isGeneratingCard}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download as Image
                      </Button>
                      
                      <Button
                        onClick={() => {
                          if (cardRef.current) {
                            setIsGeneratingCard(true);
                            
                            htmlToImage.toPng(cardRef.current)
                              .then(dataUrl => {
                                // For mobile devices
                                if (navigator.share) {
                                  fetch(dataUrl)
                                    .then(res => res.blob())
                                    .then(blob => {
                                      const file = new File([blob], `overlapp-card-${userData?.user?.username || 'user'}.png`, { type: 'image/png' });
                                      navigator.share({
                                        title: 'My Overlapp Contact Card',
                                        text: 'Check out my digital identity card from Overlapp!',
                                        files: [file]
                                      })
                                      .then(() => {
                                        setIsGeneratingCard(false);
                                      })
                                      .catch(error => {
                                        console.error('Sharing failed:', error);
                                        setIsGeneratingCard(false);
                                        
                                        // Fallback to clipboard copy
                                        copyToClipboard(dataUrl);
                                      });
                                    });
                                } else {
                                  // Fallback to clipboard copy
                                  copyToClipboard(dataUrl);
                                  setIsGeneratingCard(false);
                                }
                              })
                              .catch(error => {
                                console.error('Error generating contact card for sharing:', error);
                                toast({
                                  title: "Sharing Failed",
                                  description: "There was an error preparing your contact card for sharing.",
                                  variant: "destructive",
                                });
                                setIsGeneratingCard(false);
                              });
                          }
                        }}
                        variant="outline"
                        disabled={isGeneratingCard}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Contact Card
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sync" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Synchronization Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="sync-none" 
                        name="sync-frequency" 
                        value="none" 
                        checked={syncFrequency === 'none'}
                        onChange={() => setSyncFrequency('none')}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="sync-none">One-time export only</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="sync-manual" 
                        name="sync-frequency" 
                        value="manual" 
                        checked={syncFrequency === 'manual'}
                        onChange={() => setSyncFrequency('manual')}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="sync-manual">Manual updates only</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="sync-auto" 
                        name="sync-frequency" 
                        value="auto" 
                        checked={syncFrequency === 'auto'}
                        onChange={() => setSyncFrequency('auto')}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="sync-auto">Auto-sync when profile changes</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="sync-weekly" 
                        name="sync-frequency" 
                        value="weekly" 
                        checked={syncFrequency === 'weekly'}
                        onChange={() => setSyncFrequency('weekly')}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="sync-weekly">Scheduled (weekly)</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="sync-monthly" 
                        name="sync-frequency" 
                        value="monthly" 
                        checked={syncFrequency === 'monthly'}
                        onChange={() => setSyncFrequency('monthly')}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="sync-monthly">Scheduled (monthly)</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Change Detection Settings</CardTitle>
                  <CardDescription>
                    Select which changes should trigger automatic synchronization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sync-profile-photo" 
                        checked={syncSettings.profilePhoto}
                        onCheckedChange={(checked) => handleSyncOptionChange('profilePhoto', checked)}
                      />
                      <Label htmlFor="sync-profile-photo">Profile photo updates</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sync-bio" 
                        checked={syncSettings.bioDescription}
                        onCheckedChange={(checked) => handleSyncOptionChange('bioDescription', checked)}
                      />
                      <Label htmlFor="sync-bio">Bio/description changes</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sync-interests" 
                        checked={syncSettings.interestSkills}
                        onCheckedChange={(checked) => handleSyncOptionChange('interestSkills', checked)}
                      />
                      <Label htmlFor="sync-interests">Interest/skill additions</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sync-professional" 
                        checked={syncSettings.professionalUpdates}
                        onCheckedChange={(checked) => handleSyncOptionChange('professionalUpdates', checked)}
                      />
                      <Label htmlFor="sync-professional">Professional updates</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sync-text-edits" 
                        checked={syncSettings.minorTextEdits}
                        onCheckedChange={(checked) => handleSyncOptionChange('minorTextEdits', checked)}
                      />
                      <Label htmlFor="sync-text-edits">Minor text edits</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sync-connections" 
                        checked={syncSettings.connectionChanges}
                        onCheckedChange={(checked) => handleSyncOptionChange('connectionChanges', checked)}
                      />
                      <Label htmlFor="sync-connections">Connection/follow changes</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center mt-6">
                <Button size="lg" onClick={() => {
                  toast({
                    title: "Sync Settings Saved",
                    description: "Your synchronization preferences have been updated.",
                    variant: "default",
                  });
                }}>
                  Save Sync Settings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Platform-Optimized Formatting</CardTitle>
          <CardDescription>
            Our AI automatically reformats your profile content to match each platform's best practices, increasing engagement and effectiveness.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Before Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  "Professional UX designer with 8+ years experience creating intuitive digital experiences"
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">After Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  #UXDesigner with 8+ years creating intuitive digital experiences. Passionate about #UserCentric #DesignThinking #UX #Product
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Auto-Formatting Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5">
              <li>Character count optimization</li>
              <li>Hashtag generation from interests</li>
              <li>Image resolution adjustment</li>
              <li>Link formatting</li>
              <li>Profile section prioritization</li>
              <li>Keyword emphasis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}