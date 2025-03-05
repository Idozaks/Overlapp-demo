
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Filter, MapPin, Plus, Search } from "lucide-react";
import EventCard, { EventData } from "@/components/social/EventCard";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

// Mock data for demonstration
const MOCK_EVENTS: EventData[] = [
  {
    id: 1,
    title: "Overlapp Coding Hackathon",
    description: "Join us for a weekend of coding, collaboration, and fun as we build new features for Overlapp together!",
    location: "Tech Hub, Downtown",
    date: "2023-07-15",
    time: "09:00",
    creatorId: 1,
    creatorName: "Sarah Chen",
    creatorAvatar: "https://i.pravatar.cc/150?img=1",
    attendees: 42,
    tags: ["coding", "hackathon", "networking"],
    isPrivate: false
  },
  {
    id: 2,
    title: "AI & AR Workshop Series",
    description: "Learn about the latest in AI and AR technologies and how they're transforming digital identities.",
    location: "Virtual Event",
    date: "2023-07-22",
    time: "18:00",
    creatorId: 2,
    creatorName: "Marcus Johnson",
    creatorAvatar: "https://i.pravatar.cc/150?img=2",
    attendees: 156,
    tags: ["ai", "ar", "workshop", "virtual"],
    isPrivate: false
  },
  {
    id: 3,
    title: "Photography Enthusiasts Meetup",
    description: "Monthly meetup for photography lovers. Bring your camera and share techniques!",
    location: "Central Park",
    date: "2023-07-10",
    time: "16:30",
    creatorId: 3,
    creatorName: "Emma Rodriguez",
    attendees: 24,
    tags: ["photography", "outdoor", "hobby"],
    isPrivate: true,
    isAttending: true
  },
  {
    id: 4,
    title: "Digital Identity & Privacy Panel",
    description: "Join our expert panel discussing the future of digital identity and privacy concerns in the AI era.",
    location: "University Auditorium",
    date: "2023-08-05",
    time: "14:00",
    creatorId: 4,
    creatorName: "Dr. James Wilson",
    creatorAvatar: "https://i.pravatar.cc/150?img=4",
    attendees: 89,
    tags: ["privacy", "digital-identity", "panel", "education"],
    isPrivate: false
  }
];

export default function Events() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const { data: myRsvps } = useQuery<number[]>({
    queryKey: ['/api/users/me/events/rsvps'],
    enabled: !!user,
    // This would be replaced with a real API call in production
    queryFn: async () => {
      // Mock RSVP's for demo purposes
      return [3];
    }
  });

  // This would be replaced with a real API call in production
  const { data: eventsData, isLoading } = useQuery<EventData[]>({
    queryKey: ['/api/events', searchTerm, selectedCategory, selectedLocation],
    queryFn: async () => {
      // In a real implementation, we would query the backend:
      // return await apiRequest(`/api/events?search=${searchTerm}&category=${selectedCategory}&location=${selectedLocation}`);
      
      // For demo purposes, we'll filter the mock data based on search/filters
      return MOCK_EVENTS.map(event => ({
        ...event,
        isAttending: myRsvps?.includes(event.id)
      })).filter(event => {
        const matchesSearch = searchTerm === "" || 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          event.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === "all" || 
          event.tags.includes(selectedCategory);
        
        const matchesLocation = selectedLocation === "all" || 
          event.location.toLowerCase().includes(selectedLocation.toLowerCase());
        
        return matchesSearch && matchesCategory && matchesLocation;
      });
    }
  });

  const handleRsvp = async (eventId: number, attending: boolean) => {
    console.log(`${attending ? 'RSVP' : 'Cancel RSVP'} for event ${eventId}`);
    // In a real implementation, we would call the API to update the RSVP status
    // await apiRequest(`/api/events/${eventId}/rsvp`, {
    //   method: attending ? 'POST' : 'DELETE',
    // });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Events</h1>
        
        {user && (
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="discover" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="attending">Attending</TabsTrigger>
          {user && <TabsTrigger value="created">Created by Me</TabsTrigger>}
        </TabsList>

        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <span className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Categories" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="ar">AR</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Location" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="downtown">Downtown</SelectItem>
                    <SelectItem value="park">Park</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <TabsContent value="discover" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading events...</p>
            ) : eventsData && eventsData.length > 0 ? (
              eventsData.map(event => (
                <EventCard key={event.id} event={event} onRsvp={handleRsvp} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find events.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attending" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading events...</p>
            ) : eventsData && eventsData.filter(e => e.isAttending).length > 0 ? (
              eventsData.filter(e => e.isAttending).map(event => (
                <EventCard key={event.id} event={event} onRsvp={handleRsvp} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't RSVP'd to any events yet.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/events/?tab=discover">Discover Events</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {user && (
          <TabsContent value="created" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No events created</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any events yet.
                </p>
                <Button asChild>
                  <Link href="/events/create">Create Your First Event</Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
