import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileDeviceSimulator from './MobileDeviceSimulator';
import { 
  UserCircle, Users, Search, Network, Store, 
  ShoppingBag, Share2, ArrowRight, Heart, MessageCircle,
  Bell, Map, Tag, Loader2, ChevronRight, Play, Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export type JourneyType = 'socialDiscovery' | 'physicalIntegration' | 'identityManagement' | 'marketplace';

// Define the journey screens and interactions
interface JourneyScreen {
  id: string;
  component: React.ReactNode;
  duration: number; // milliseconds to show this screen
  interactions?: Interaction[];
}

interface Interaction {
  type: 'tap' | 'swipe' | 'scroll';
  x: number;
  y: number;
  delay: number; // milliseconds after screen appears
  direction?: 'up' | 'down' | 'left' | 'right'; // for swipe
  distance?: number; // for swipe or scroll
}

interface UserJourneySimulatorProps {
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export const MobileUserJourneySimulator: React.FC<UserJourneySimulatorProps> = ({
  className = '',
  autoPlay = true,
  loop = true,
}) => {
  const [currentJourneyIndex, setCurrentJourneyIndex] = useState(0);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [interactionElement, setInteractionElement] = useState<JSX.Element | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Predefined journeys
  const journeys: Record<JourneyType, { title: string; screens: JourneyScreen[] }> = {
    socialDiscovery: {
      title: 'Social Discovery',
      screens: [
        {
          id: 'social-home',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Social Discovery</h2>
                <p className="text-xs text-muted-foreground">Find people with similar interests</p>
              </div>
              <div className="p-4 flex flex-col gap-3 overflow-y-auto">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                  />
                  <Search className="absolute right-3 top-2 h-4 w-4 text-muted-foreground" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">User {i + 1}</p>
                      <p className="text-xs text-muted-foreground">Shared interests: Music, Travel</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          duration: 2500,
          interactions: [
            { type: 'tap', x: 200, y: 100, delay: 1000 }
          ]
        },
        {
          id: 'user-profile',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">User Profile</h2>
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <UserCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Alex Johnson</h3>
                <p className="text-sm text-muted-foreground mb-4">@alexj</p>
                <div className="flex gap-2 mb-4">
                  <Button size="sm" className="rounded-full">
                    <Users className="h-4 w-4 mr-1" /> Connect
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <MessageCircle className="h-4 w-4 mr-1" /> Message
                  </Button>
                </div>
                <div className="w-full">
                  <h4 className="font-medium text-sm mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>Music</Badge>
                    <Badge>Photography</Badge>
                    <Badge>Travel</Badge>
                    <Badge>Technology</Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2">Shared Connections</h4>
                  <div className="flex -space-x-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-primary" />
                      </div>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">+2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3000,
          interactions: [
            { type: 'tap', x: 140, y: 210, delay: 1500 }
          ]
        },
        {
          id: 'overlap-analysis',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Overlap Analysis</h2>
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="relative h-40 w-40 mb-4">
                  <div className="absolute inset-0 rounded-full bg-primary/10"></div>
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-primary/30 flex items-center justify-center">
                    <div className="text-lg font-bold">75%</div>
                  </div>
                  <div className="absolute top-0 left-0">
                    <div className="h-12 w-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <div className="h-12 w-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Strong Compatibility</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  You and Alex share interests in Music, Travel, and have 3 mutual connections.
                </p>
                <div className="w-full space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Music</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Travel</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Technology</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3500
        }
      ]
    },
    physicalIntegration: {
      title: 'Digital-Physical Integration',
      screens: [
        {
          id: 'location-check-in',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Check In</h2>
                <p className="text-xs text-muted-foreground">Share your location</p>
              </div>
              <div className="relative h-40 bg-gray-200 mb-3">
                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                  <Map className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute bottom-3 right-3 bg-background rounded-lg shadow-lg p-2">
                  <Button size="sm" variant="ghost">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Store className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Café Overlapp</p>
                    <p className="text-xs text-muted-foreground">Coffee Shop • 0.2 miles away</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
                  <Store className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Overlapp Bookstore</p>
                    <p className="text-xs text-muted-foreground">Books • 0.5 miles away</p>
                  </div>
                </div>
                <Button className="w-full">
                  Check In Here
                </Button>
              </div>
            </div>
          ),
          duration: 2500,
          interactions: [
            { type: 'tap', x: 180, y: 380, delay: 1500 }
          ]
        },
        {
          id: 'check-in-confirmation',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Overlapp Bookstore</h2>
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Store className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mb-1">Check-in Successful!</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  You've checked in at Overlapp Bookstore. Share your experience or discover other visitors.
                </p>
                <div className="w-full space-y-3 mb-4">
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Check-in
                  </Button>
                  <Button className="w-full flex items-center justify-center">
                    <Users className="h-4 w-4 mr-2" />
                    See Who's Here
                  </Button>
                </div>
                <div className="w-full">
                  <h4 className="font-medium text-sm mb-2">Popular at this location</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Fiction</Badge>
                    <Badge>Coffee</Badge>
                    <Badge>Reading</Badge>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3000,
          interactions: [
            { type: 'tap', x: 180, y: 260, delay: 1800 }
          ]
        },
        {
          id: 'location-users',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">People at Bookstore</h2>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground mb-2">
                  5 people are currently here - 2 share your interests
                </p>
                <div className="p-3 border rounded-lg bg-primary/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Morgan P.</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">Fiction</Badge>
                        <Badge variant="outline" className="text-xs">Art</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-primary font-semibold">82% overlap with your interests</span>
                    <Button size="sm" variant="ghost">
                      <Users className="h-3 w-3 mr-1" /> Connect
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Jamie K.</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">Poetry</Badge>
                        <Badge variant="outline" className="text-xs">Coffee</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-primary font-semibold">46% overlap with your interests</span>
                    <Button size="sm" variant="ghost">
                      <Users className="h-3 w-3 mr-1" /> Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3500
        }
      ]
    },
    identityManagement: {
      title: 'Identity Management',
      screens: [
        {
          id: 'identity-profile',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Identity Profile</h2>
                <p className="text-xs text-muted-foreground">Manage your digital identity</p>
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <UserCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">@username</p>
                <div className="w-full mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Profile Completeness</h4>
                    <span className="text-xs font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Add more interests to improve your profile
                  </p>
                </div>
                <div className="w-full">
                  <h4 className="font-medium text-sm mb-2">Primary Interests</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>Music</Badge>
                    <Badge>Photography</Badge>
                    <Badge>Travel</Badge>
                    <Badge className="bg-muted/50 hover:bg-muted/70">+ Add More</Badge>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 2500,
          interactions: [
            { type: 'tap', x: 180, y: 330, delay: 1500 }
          ]
        },
        {
          id: 'interest-recommendations',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Interest Suggestions</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Based on your existing interests, we recommend:
                </p>
                
                <Card className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Jazz Music</h3>
                    <Badge variant="outline">90% match</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Recommended because you're interested in Music
                  </p>
                  <Button size="sm" className="w-full">Add to Profile</Button>
                </Card>
                
                <Card className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Street Photography</h3>
                    <Badge variant="outline">85% match</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Recommended because you're interested in Photography
                  </p>
                  <Button size="sm" className="w-full">Add to Profile</Button>
                </Card>
                
                <Card className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Culinary Tourism</h3>
                    <Badge variant="outline">75% match</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Recommended because you're interested in Travel
                  </p>
                  <Button size="sm" className="w-full">Add to Profile</Button>
                </Card>
              </div>
            </div>
          ),
          duration: 3000,
          interactions: [
            { type: 'tap', x: 180, y: 210, delay: 1500 }
          ]
        },
        {
          id: 'identity-dashboard',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Identity Dashboard</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Jazz Music</h3>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Added</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your digital identity has been updated with new interests.
                </p>
                
                <Card className="p-3 mb-2">
                  <h3 className="text-sm font-medium mb-2">Identity Status</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs">Profile Completeness</span>
                    <span className="text-xs font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2 mb-3" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs">Digital Consistency</span>
                    <span className="text-xs font-medium">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </Card>
                
                <div className="flex justify-between gap-2">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button className="flex-1">
                    <Network className="h-4 w-4 mr-2" />
                    Find Matches
                  </Button>
                </div>
              </div>
            </div>
          ),
          duration: 3500
        }
      ]
    },
    marketplace: {
      title: 'Marketplace Engagement',
      screens: [
        {
          id: 'marketplace-home',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Marketplace</h2>
                <p className="text-xs text-muted-foreground">Discover entities based on your interests</p>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search marketplace..." 
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                  />
                  <Search className="absolute right-3 top-2 h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">Recommended for You</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 flex flex-col">
                    <div className="h-12 flex items-center justify-center mb-1">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium mb-1">Music Shop</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">Music</Badge>
                    </div>
                    <span className="text-xs text-primary font-semibold mt-auto">85% match</span>
                  </Card>
                  <Card className="p-3 flex flex-col">
                    <div className="h-12 flex items-center justify-center mb-1">
                      <ShoppingBag className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium mb-1">Travel Gear</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">Travel</Badge>
                    </div>
                    <span className="text-xs text-primary font-semibold mt-auto">70% match</span>
                  </Card>
                </div>
              </div>
            </div>
          ),
          duration: 2500,
          interactions: [
            { type: 'tap', x: 100, y: 280, delay: 1500 }
          ]
        },
        {
          id: 'entity-details',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Music Shop</h2>
              </div>
              <div className="relative h-40 bg-primary/10 mb-3 flex items-center justify-center">
                <Store className="h-12 w-12 text-primary" />
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-background/80">85% match</Badge>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Music Shop</h3>
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  A specialty store with instruments, vinyl records, and music accessories.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge>Music</Badge>
                  <Badge>Retail</Badge>
                  <Badge>Instruments</Badge>
                </div>
                <h4 className="text-sm font-medium mb-2">Featured Products</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-2">
                    <div className="h-10 flex items-center justify-center mb-1">
                      <Tag className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs font-medium">Acoustic Guitar</p>
                    <p className="text-xs text-muted-foreground">$299</p>
                  </div>
                  <div className="border rounded p-2">
                    <div className="h-10 flex items-center justify-center mb-1">
                      <Tag className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs font-medium">Vinyl Records</p>
                    <p className="text-xs text-muted-foreground">From $19.99</p>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3000,
          interactions: [
            { type: 'tap', x: 70, y: 400, delay: 1800 }
          ]
        },
        {
          id: 'product-details',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Acoustic Guitar</h2>
              </div>
              <div className="relative h-40 bg-primary/10 mb-3 flex items-center justify-center">
                <Tag className="h-12 w-12 text-primary" />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">Acoustic Guitar</h3>
                  <span className="font-bold">$299</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Music</Badge>
                  <Badge variant="outline">Instrument</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Perfect for beginners and intermediate players. Includes carrying case and tuner.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Why this matches your interests</h4>
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded">
                    <Badge className="bg-primary text-primary-foreground">Music</Badge>
                    <span className="text-xs">Based on your interest in musical instruments</span>
                  </div>
                </div>
                <Button className="w-full">Add to Cart</Button>
              </div>
            </div>
          ),
          duration: 3500
        }
      ]
    }
  };

  // Order of journeys for auto-cycling
  const journeyTypes: JourneyType[] = ['socialDiscovery', 'physicalIntegration', 'identityManagement', 'marketplace'];
  
  // Get current journey and screen
  const currentJourney = journeys[journeyTypes[currentJourneyIndex]];
  const currentScreen = currentJourney?.screens[currentScreenIndex];

  // Function to move to the next screen
  const advanceToNextScreen = useCallback(() => {
    if (currentScreenIndex < currentJourney.screens.length - 1) {
      setCurrentScreenIndex(prevIndex => prevIndex + 1);
    } else {
      // Move to the next journey
      if (currentJourneyIndex < journeyTypes.length - 1) {
        setCurrentJourneyIndex(prevIndex => prevIndex + 1);
        setCurrentScreenIndex(0);
      } else if (loop) {
        // Restart from the first journey
        setCurrentJourneyIndex(0);
        setCurrentScreenIndex(0);
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentScreenIndex, currentJourneyIndex, currentJourney.screens.length, journeyTypes.length, loop]);

  // Function to show interaction indicators
  const showInteraction = useCallback((interaction: Interaction) => {
    let element: JSX.Element;

    switch (interaction.type) {
      case 'tap':
        element = (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute w-8 h-8 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center"
            style={{ top: interaction.y - 16, left: interaction.x - 16, zIndex: 50 }}
          >
            <span className="w-4 h-4 bg-primary rounded-full animate-ping" />
          </motion.div>
        );
        break;
      case 'swipe':
        // Calculate end position based on direction and distance
        const distance = interaction.distance || 50;
        let endX = interaction.x;
        let endY = interaction.y;
        
        if (interaction.direction === 'left') endX -= distance;
        if (interaction.direction === 'right') endX += distance;
        if (interaction.direction === 'up') endY -= distance;
        if (interaction.direction === 'down') endY += distance;
        
        element = (
          <motion.div
            initial={{ x: interaction.x, y: interaction.y, opacity: 0 }}
            animate={{ 
              x: endX, 
              y: endY, 
              opacity: [0, 1, 1, 0]
            }}
            transition={{ duration: 1 }}
            className="absolute w-6 h-6 bg-primary/30 rounded-full z-50"
          />
        );
        break;
      case 'scroll':
        const scrollDistance = interaction.distance || 100;
        const scrollEndY = interaction.direction === 'up' ? interaction.y - scrollDistance : interaction.y + scrollDistance;
        
        element = (
          <motion.div
            initial={{ x: interaction.x, y: interaction.y, opacity: 0 }}
            animate={{ 
              y: scrollEndY, 
              opacity: [0, 1, 1, 0]
            }}
            transition={{ duration: 1.5 }}
            className="absolute w-4 h-12 bg-primary/20 border border-primary rounded-full z-50 flex items-center justify-center"
          >
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          </motion.div>
        );
        break;
      default:
        return;
    }

    setInteractionElement(element);

    // Remove the interaction element after it's done
    setTimeout(() => {
      setInteractionElement(null);
    }, 1500);
  }, []);

  // Effect to handle automatic screen advancement
  useEffect(() => {
    if (!isPlaying || isPaused || !currentScreen) return;

    // Show progress of current screen
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min(100, (elapsed / currentScreen.duration) * 100);
      setProgress(progressValue);
    }, 50);

    // Process interactions for the current screen
    const interactions = currentScreen.interactions || [];
    const interactionTimers: NodeJS.Timeout[] = [];

    interactions.forEach(interaction => {
      const timer = setTimeout(() => {
        showInteraction(interaction);
      }, interaction.delay);
      
      interactionTimers.push(timer);
    });

    // Set timer to advance to the next screen
    const startTime = Date.now();
    const screenTimer = setTimeout(() => {
      advanceToNextScreen();
      setProgress(0);
    }, currentScreen.duration);

    // Cleanup
    return () => {
      clearTimeout(screenTimer);
      clearInterval(progressInterval);
      interactionTimers.forEach(timer => clearTimeout(timer));
    };
  }, [currentScreen, isPlaying, isPaused, advanceToNextScreen, showInteraction]);

  // Toggle play/pause
  const togglePlayback = () => {
    if (isPaused) {
      setIsPaused(false);
    } else if (isPlaying) {
      setIsPaused(true);
    } else {
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  // Jump to a specific journey
  const jumpToJourney = (index: number) => {
    setCurrentJourneyIndex(index);
    setCurrentScreenIndex(0);
    setProgress(0);
    if (!isPlaying) {
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Experience Overlapp on Mobile</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Watch a demo of key user journeys and see how Overlapp helps connect your digital and physical worlds.
        </p>
      </motion.div>

      <div className="relative">
        {/* Mobile Device */}
        <MobileDeviceSimulator>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentJourneyIndex}-${currentScreenIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {currentScreen?.component}
            </motion.div>
          </AnimatePresence>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <motion.div 
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Interaction indicator (tap, swipe, etc.) */}
          {interactionElement}
        </MobileDeviceSimulator>
        
        {/* Journey Selector & Controls */}
        <div className="mt-6 flex flex-col items-center">
          <div className="flex justify-center gap-2 mb-4">
            {journeyTypes.map((type, index) => (
              <Button
                key={type}
                variant={index === currentJourneyIndex ? "default" : "outline"}
                size="sm"
                onClick={() => jumpToJourney(index)}
                className="px-3"
              >
                {journeys[type].title}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={togglePlayback}
            className="rounded-full h-10 w-10"
          >
            {isPaused ? (
              <Play className="h-5 w-5" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2">
            {currentScreen ? (
              <>Showing: {currentJourney.title} - Screen {currentScreenIndex + 1}/{currentJourney.screens.length}</>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileUserJourneySimulator;