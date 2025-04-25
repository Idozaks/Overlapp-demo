import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, User, Layers, MessageSquare, Clock, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function EnhancedEngageIndex() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="container py-12 max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-3 mb-8">
        <Badge variant="outline" className="mb-2">New Feature</Badge>
        <h1 className="text-4xl font-bold">Engage with Digital Identity</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose how you want to engage with the world around you. Match your identity with people, places, or online spaces.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Persona Card */}
        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
              <User className="h-5 w-5" />
              Personal Overlap
            </CardTitle>
            <CardDescription>
              Connect with individuals who share your interests and values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex -space-x-4 justify-center">
              <Avatar className="border-2 border-background w-14 h-14">
                <AvatarImage src="/images/avatars/avatar-1.jpg" alt="User" />
                <AvatarFallback>U1</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background w-14 h-14">
                <AvatarImage src="/images/avatars/avatar-2.jpg" alt="User" />
                <AvatarFallback>U2</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background w-14 h-14">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="py-2 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>Discover shared communication styles</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>Compare preferences and interests</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>Find your perfect social match</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/engage/persona">
              <Button className="w-full gap-2">
                <User className="h-4 w-4" />
                Explore Personal Overlap
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Online Card */}
        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
              <Globe className="h-5 w-5" />
              Online Presence
            </CardTitle>
            <CardDescription>
              Match with digital communities, websites, and online platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center items-center h-14">
              <Globe className="h-12 w-12 text-primary/70" />
            </div>
            
            <div className="py-2 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span>Sync with online communities</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>Discover relevant digital entities</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>Enhance your digital footprint</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/engage/online">
              <Button className="w-full gap-2" variant="outline">
                <Globe className="h-4 w-4" />
                Explore Online Engagement
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Offline Card */}
        <Card className="group hover:shadow-md transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
              <MapPin className="h-5 w-5" />
              Physical Locations
            </CardTitle>
            <CardDescription>
              Connect with places and experiences in the physical world
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center items-center h-14">
              <MapPin className="h-12 w-12 text-primary/70" />
            </div>
            
            <div className="py-2 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Find nearby venues matching your interests</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>Discover events aligned with your values</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>Connect with your physical surroundings</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/engage/offline">
              <Button className="w-full gap-2" variant="outline">
                <MapPin className="h-4 w-4" />
                Explore Physical Locations
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-12 bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-2xl font-semibold mb-3">How Engage Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">1. Select Engagement Mode</h3>
            <p className="text-muted-foreground text-sm">Choose whether to engage with people, digital platforms, or physical locations.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">2. Review Potential Matches</h3>
            <p className="text-muted-foreground text-sm">Browse through compatible matches based on your digital identity profile.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">3. Analyze Overlap</h3>
            <p className="text-muted-foreground text-sm">See detailed visualizations of how your identity overlaps with your matches.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedEngageIndex;