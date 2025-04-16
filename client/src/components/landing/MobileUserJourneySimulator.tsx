import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileDeviceSimulator from './MobileDeviceSimulator';
import { 
  UserCircle, Users, Search, Network, Store, 
  ShoppingBag, Share2, ArrowRight, Heart, MessageCircle,
  Bell, Map, Tag, Loader2, ChevronRight, Play, Pause,
  MapPin, Calendar, Clock, Ticket, 
  Coffee, Briefcase, Building,
  BookOpen, Trophy, Gift, Info
} from 'lucide-react';
// Import custom icons for those not available in the current lucide-react version
import { CalendarDays, Music, Medal, Zap, Running, Dumbbell } from './SimulatorIcons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export type JourneyType = 'shoppingMall' | 'eventDiscovery' | 'fitnessContext' | 'cafeNetworking';

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
  // Skip rendering and animation on mobile devices
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  
  if (isMobile) {
    return null;
  }
  
  return <DesktopJourneySimulator className={className} autoPlay={autoPlay} loop={loop} />;
};

// Separate component for desktop to avoid conditional hook issues
const DesktopJourneySimulator: React.FC<UserJourneySimulatorProps> = ({
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

  // Predefined journeys based on digital-physical integration scenarios
  const journeys: Record<JourneyType, { title: string; screens: JourneyScreen[] }> = {
    shoppingMall: {
      title: 'Shopping Mall Experience',
      screens: [
        {
          id: 'mall-entry-notification',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Overlapp</h2>
                <p className="text-xs text-muted-foreground">Digital-Physical Identity</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="h-36 bg-primary/10 flex items-center justify-center mb-3">
                  <Building className="h-12 w-12 text-primary/60" />
                </div>
                <div className="p-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 mb-4 relative overflow-hidden">
                    <div className="absolute -right-2 -top-2 h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Welcome to Central Mall!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We've detected you're at Central Mall. Would you like to see personalized recommendations?
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1">Yes, please</Button>
                      <Button variant="outline" className="flex-1">Not now</Button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">New deals just for you</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Based on your interests in sports and electronics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3000,
          interactions: [
            { type: 'tap', x: 130, y: 235, delay: 2000 }
          ]
        },
        {
          id: 'mall-personalized-stores',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <div>
                  <h2 className="text-lg font-bold">Central Mall</h2>
                  <p className="text-xs text-muted-foreground">Personalized for you</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/10">
                  <div className="flex items-center mb-2">
                    <Gift className="h-5 w-5 text-primary mr-2" />
                    <p className="text-sm font-medium">5 exclusive offers matched to you</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on your DIU preferences
                  </div>
                </div>
                
                <h3 className="text-sm font-medium mb-2">Recommended Stores</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
                    <Store className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">Sports World</p>
                        <Badge variant="outline" className="text-xs">93% match</Badge>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs text-muted-foreground">Sports Gear • Floor 2</p>
                        <Badge className="ml-2 text-[10px] h-4" variant="secondary">20% OFF</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Store className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">Tech Haven</p>
                        <Badge variant="outline" className="text-xs">87% match</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Electronics • Floor 3</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Store className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">Book Corner</p>
                        <Badge variant="outline" className="text-xs">76% match</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Books & Media • Floor 1</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mb-2">View Interactive Mall Map</Button>
              </div>
            </div>
          ),
          duration: 3500,
          interactions: [
            { type: 'tap', x: 180, y: 400, delay: 2500 }
          ]
        },
        {
          id: 'mall-interactive-map',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Interactive Mall Map</h2>
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex-1 relative bg-stone-100 rounded-lg mb-4 overflow-hidden">
                  {/* Simplified mall map layout */}
                  <div className="absolute inset-5 bg-white/80 rounded border" />
                  <div className="absolute left-[30%] top-[20%] w-16 h-10 bg-primary/10 rounded animate-pulse border border-primary flex items-center justify-center">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="absolute right-[25%] bottom-[30%] w-16 h-10 bg-primary/20 rounded animate-pulse border border-primary flex items-center justify-center">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <div className="absolute left-[20%] bottom-[20%] w-16 h-10 bg-primary/10 rounded border border-primary flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="absolute left-[60%] top-[60%] h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div className="absolute right-2 top-2 bg-white/80 rounded p-2 text-xs shadow-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                      <span>Your matches</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>You are here</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-3 mb-4">
                  <h3 className="text-sm font-medium mb-1">Sports World</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Current special: 20% off running shoes - matched to your running interest
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs">
                      <MapPin className="h-3 w-3 mr-1" /> Directions
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Info className="h-3 w-3 mr-1" /> Details
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button className="flex-1">
                    <Gift className="h-4 w-4 mr-2" />
                    View All Offers
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Map
                  </Button>
                </div>
              </div>
            </div>
          ),
          duration: 4000
        }
      ]
    },
    
    eventDiscovery: {
      title: 'Event Discovery',
      screens: [
        {
          id: 'event-discovery-home',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Overlapp</h2>
                <p className="text-xs text-muted-foreground">Weekend Events Nearby</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/10">
                  <h3 className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    This Weekend (Apr 19-21)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    10 events match your interests
                  </p>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="h-28 bg-primary/10 relative">
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-white">92% match</Badge>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="h-10 w-10 text-primary/40" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold">Downtown Music Festival</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 mb-2">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        <span>Saturday, Apr 20 • 2:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                              <UserCircle className="h-3 w-3 text-primary" />
                            </div>
                          ))}
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-[10px] font-medium">+4</span>
                          </div>
                        </div>
                        <Button size="sm" variant="default" className="h-7 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="h-28 bg-primary/5 relative">
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary/80 text-white">85% match</Badge>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="h-10 w-10 text-primary/30" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold">Wellness Seminar</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 mb-2">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        <span>Sunday, Apr 21 • 10:00 AM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                              <UserCircle className="h-3 w-3 text-primary" />
                            </div>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3000,
          interactions: [
            { type: 'tap', x: 300, y: 215, delay: 1800 }
          ]
        },
        {
          id: 'event-detail-view',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Event Details</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="h-40 bg-primary/10 flex items-center justify-center relative">
                  <Music className="h-12 w-12 text-primary/40" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-white">92% match</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1">Downtown Music Festival</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    <span>Saturday, Apr 20 • 2:00 PM - 10:00 PM</span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Interest Overlap Analysis</h4>
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <div className="relative h-20 w-full mb-2">
                        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-1/3 h-16 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                          <div className="bg-primary/40 w-full h-full absolute left-0 scale-[0.65]" />
                          <span className="relative font-bold text-primary z-10">92%</span>
                        </div>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-16 aspect-square rounded-full bg-primary/5 flex items-center justify-center">
                          <UserCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-16 aspect-square rounded-full bg-primary/5 flex items-center justify-center">
                          <Music className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Music Genre Match</span>
                          <span>97%</span>
                        </div>
                        <Progress value={97} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs mb-1">
                          <span>Local Events Interest</span>
                          <span>88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Friends Attending</h4>
                    <div className="flex items-center mb-3">
                      <div className="flex -space-x-3 mr-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                            <UserCircle className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">+4</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Invite Friends
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Ticket className="h-4 w-4 mr-2" />
                      Get Tickets
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3500,
          interactions: [
            { type: 'tap', x: 180, y: 480, delay: 2500 }
          ]
        },
        {
          id: 'event-ticket-purchase',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Purchase Tickets</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/10">
                  <h3 className="text-sm font-medium">Downtown Music Festival</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>Saturday, Apr 20 • 2:00 PM</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">General Admission</p>
                      <p className="text-xs text-muted-foreground">Access to all stages</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$49.99</p>
                      <div className="flex items-center mt-1">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">-</Button>
                        <span className="mx-2 text-sm">2</span>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">+</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-sm">VIP Package</p>
                        <Badge className="ml-2 text-[10px]" variant="secondary">Recommended</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Priority access + lounge</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$99.99</p>
                      <div className="flex items-center mt-1">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">-</Button>
                        <span className="mx-2 text-sm">1</span>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">+</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-medium">$199.97</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Service Fee</span>
                    <span className="font-medium">$12.00</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total</span>
                    <span>$211.97</span>
                  </div>
                </div>
                
                <Button className="w-full mb-2">
                  Complete Purchase
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Your tickets will be linked to your Overlapp digital identity
                </p>
              </div>
            </div>
          ),
          duration: 3500
        }
      ]
    },
    
    fitnessContext: {
      title: 'Fitness Class Discovery',
      screens: [
        {
          id: 'fitness-notification',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Overlapp</h2>
                <p className="text-xs text-muted-foreground">Fitness & Wellness</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="h-36 bg-green-50 flex items-center justify-center mb-3">
                  <Running className="h-16 w-16 text-green-500/40" />
                </div>
                <div className="p-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100 mb-4 relative overflow-hidden">
                    <div className="absolute -right-2 -top-2 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800">5K Run Tonight!</h3>
                    <p className="text-sm text-green-700/80 mt-1 mb-4">
                      A community running group is forming at Riverside Park (0.3 miles away) at 6:30 PM.
                    </p>
                    <div className="mb-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Running</Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 ml-1">Outdoors</Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 ml-1">Beginner Friendly</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">Join Group</Button>
                      <Button variant="outline" className="flex-1 text-green-700 border-green-200">View Details</Button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Why we notified you</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground mr-2" />
                        <p className="text-sm">Based on your fitness interests</p>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Running</span>
                        <span>95% match</span>
                      </div>
                      <Progress value={95} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs mb-1">
                        <span>Outdoor Activities</span>
                        <span>88% match</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3500,
          interactions: [
            { type: 'tap', x: 130, y: 265, delay: 2500 }
          ]
        },
        {
          id: 'fitness-join-group',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Community 5K Run</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="h-40 bg-green-50 flex items-center justify-center relative">
                  <Running className="h-16 w-16 text-green-500/40" />
                  <div className="absolute bottom-3 left-3 flex items-center">
                    <div className="flex items-center bg-white/80 px-2 py-1 rounded-full text-xs">
                      <MapPin className="h-3 w-3 text-green-600 mr-1" />
                      <span>Riverside Park</span>
                    </div>
                    <div className="flex items-center bg-white/80 px-2 py-1 rounded-full text-xs ml-2">
                      <Clock className="h-3 w-3 text-green-600 mr-1" />
                      <span>Today, 6:30 PM</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1">Community 5K Run</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join fellow runners for an evening community run. All skill levels welcome! The route follows the scenic riverside path.
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="p-3 border rounded-lg bg-green-50/50">
                      <h4 className="text-sm font-medium mb-2 text-green-800">Quick Registration</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Running className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm">Running Experience</span>
                          </div>
                          <Badge variant="outline" className="bg-white">Beginner</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm">Preferred Pace</span>
                          </div>
                          <Badge variant="outline" className="bg-white">Casual</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm">Share DIU Data</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-white">Fitness</Badge>
                            <Button size="sm" variant="ghost" className="h-6 p-0">
                              <Info className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Who's Going</h4>
                    <div className="flex items-center mb-3">
                      <div className="flex -space-x-3 mr-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center">
                            <UserCircle className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">+8</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="text-green-600 font-medium">2 friends</span> are attending
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Confirm Participation
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Invite Friends
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3500,
          interactions: [
            { type: 'tap', x: 130, y: 465, delay: 2500 }
          ]
        },
        {
          id: 'fitness-confirmation',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Registration Confirmed</h2>
              </div>
              <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Medal className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-center">You're all set!</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-64">
                  You've successfully registered for the Community 5K Run at Riverside Park tonight.
                </p>
                
                <div className="w-full bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Event</span>
                    <span className="text-sm">Community 5K Run</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Location</span>
                    <span className="text-sm">Riverside Park (East Entrance)</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Date & Time</span>
                    <span className="text-sm">Today, 6:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-800">Group Size</span>
                    <span className="text-sm">12 participants</span>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Event details have been linked to your Overlapp digital identity.
                  </p>
                </div>
              </div>
            </div>
          ),
          duration: 3500
        }
      ]
    },
    
    cafeNetworking: {
      title: 'Café Networking',
      screens: [
        {
          id: 'cafe-check-in',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Overlapp</h2>
                <p className="text-xs text-muted-foreground">Professional Networking</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="h-36 bg-amber-50 flex items-center justify-center mb-3">
                  <Coffee className="h-16 w-16 text-amber-500/40" />
                </div>
                <div className="p-4">
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-4 relative overflow-hidden">
                    <div className="absolute -right-2 -top-2 h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-800">Now at Coworking Café</h3>
                    <p className="text-sm text-amber-700/80 mt-1 mb-3">
                      We've detected you're at Creative Hub Café. 5 other professionals are here who share your interests.
                    </p>
                    <div className="mb-3 flex flex-wrap gap-1">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Entrepreneurship</Badge>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Design</Badge>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Technology</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1 bg-amber-600 hover:bg-amber-700">Connect Now</Button>
                      <Button variant="outline" className="flex-1 text-amber-700 border-amber-200">Not Now</Button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Professional Privacy Controls</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-3">
                        Select which aspects of your professional profile to share
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-amber-600" />
                            <span className="text-sm">Current Role</span>
                          </div>
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            Visible
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Network className="h-4 w-4 mr-2 text-amber-600" />
                            <span className="text-sm">AI Project Interest</span>
                          </div>
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            Visible
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-amber-600" />
                            <span className="text-sm">Mutual Connections</span>
                          </div>
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            Hidden
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3500,
          interactions: [
            { type: 'tap', x: 130, y: 270, delay: 2500 }
          ]
        },
        {
          id: 'cafe-potential-matches',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Professionals Nearby</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-100">
                  <div className="flex items-center mb-2">
                    <Coffee className="h-5 w-5 text-amber-600 mr-2" />
                    <p className="text-sm font-medium">Creative Hub Café</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    5 professionals with overlapping interests are here now
                  </p>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 border-b bg-amber-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">Alex Morgan</h3>
                            <p className="text-xs text-muted-foreground">UX Designer</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">
                          92% overlap
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-medium mb-2">Shared Interests</h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className="text-xs">AI Projects</Badge>
                        <Badge variant="outline" className="text-xs">UX Design</Badge>
                        <Badge variant="outline" className="text-xs">Startups</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        "Open to discussing new AI design projects and collaboration opportunities"
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 text-xs bg-amber-600 hover:bg-amber-700">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          View Full Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">Jamie Chen</h3>
                            <p className="text-xs text-muted-foreground">Software Developer</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          78% overlap
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-medium mb-2">Shared Interests</h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className="text-xs">Web Development</Badge>
                        <Badge variant="outline" className="text-xs">AI Projects</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        "Working on an open-source project, looking for collaborators"
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 text-xs">
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          View Full Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          duration: 3500,
          interactions: [
            { type: 'tap', x: 130, y: 260, delay: 2500 }
          ]
        },
        {
          id: 'cafe-connection-request',
          component: (
            <div className="bg-background text-foreground h-full flex flex-col">
              <div className="p-4 border-b flex items-center">
                <ChevronRight className="h-5 w-5 rotate-180 mr-2" />
                <h2 className="text-lg font-bold">Connect With Alex</h2>
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <UserCircle className="h-10 w-10 text-amber-600" />
                  </div>
                  <div className="mx-2 text-2xl text-amber-300">⟶</div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-4">
                  <h3 className="text-md font-bold text-amber-800 mb-1">Connection Request</h3>
                  <p className="text-sm text-amber-700/80 mb-3">
                    Send a personalized message to Alex about your shared interests in AI projects and design.
                  </p>
                  
                  <div className="bg-white rounded border p-3 mb-4">
                    <p className="text-sm">
                      Hi Alex, I noticed we're both at Creative Hub Café and share interests in AI projects and UX design. I'm working on an AI-powered interface project that might benefit from your design expertise. Would you be open to a quick chat?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-amber-600" />
                        <span className="text-sm">Share Current Role</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        <Zap className="h-3 w-3 text-amber-500" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Network className="h-4 w-4 mr-2 text-amber-600" />
                        <span className="text-sm">Share Contact Info</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        <Zap className="h-3 w-3 text-amber-500" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-amber-600" />
                        <span className="text-sm">Share Portfolio Link</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs opacity-50">
                        <Zap className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto flex gap-2">
                  <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
                    Send Connection Request
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save for Later
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Your privacy is protected. Only the information you select will be shared.
                </p>
              </div>
            </div>
          ),
          duration: 3500
        }
      ]
    }
  };

  // Order of journeys for auto-cycling - updated to reflect new digital-physical scenarios
  const journeyTypes: JourneyType[] = ['shoppingMall', 'eventDiscovery', 'fitnessContext', 'cafeNetworking'];
  
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

    const startTime = Date.now();
    
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
        className="mb-4 md:mb-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Experience Overlapp on Mobile</h2>
        <p className="text-muted-foreground max-w-lg mx-auto px-4">
          Watch a demo of how Overlapp connects your digital identity with physical contexts
        </p>
      </motion.div>

      <div className="relative flex flex-col items-center">
        {/* Mobile Device */}
        <div className="w-full max-w-[280px] mx-auto">
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
        </div>
        
        {/* Journey Selector & Controls */}
        <div className="mt-6 w-full flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-full px-2">
            {journeyTypes.map((type, index) => (
              <Button
                key={type}
                variant={index === currentJourneyIndex ? "default" : "outline"}
                size="sm"
                onClick={() => jumpToJourney(index)}
                className="px-3 text-xs md:text-sm whitespace-nowrap"
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
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
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