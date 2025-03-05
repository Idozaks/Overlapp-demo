
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Share2, Users, ChevronLeft, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { EventData } from "@/components/social/EventCard";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// Mock data for demonstration
const MOCK_EVENTS: Record<number, EventData> = {
  1: {
    id: 1,
    title: "Overlapp Coding Hackathon",
    description: "Join us for a weekend of coding, collaboration, and fun as we build new features for Overlapp together!\n\nThis hackathon is open to developers of all skill levels. We'll form teams on the first day and work on innovative features that extend the Overlapp platform.\n\n## Schedule\n\n**Day 1**\n- 9:00 AM: Registration & Breakfast\n- 10:00 AM: Opening Ceremony\n- 11:00 AM: Team Formation\n- 12:00 PM: Lunch\n- 1:00 PM - 8:00 PM: Coding Session\n\n**Day 2**\n- 9:00 AM: Breakfast\n- 10:00 AM - 3:00 PM: Coding Session\n- 3:00 PM: Project Submissions\n- 4:00 PM: Presentations\n- 6:00 PM: Awards & Closing\n\n## Prizes\n\n- 1st Place: $1,000\n- 2nd Place: $500\n- 3rd Place: $250\n- Best UI/UX: $200\n- Most Innovative: $200\n\n## What to Bring\n\n- Laptop & charger\n- Any hardware you'll need\n- Your creativity and enthusiasm!\n\nFood and drinks will be provided throughout the event.",
    location: "Tech Hub, Downtown",
    date: "2023-07-15",
    time: "09:00",
    creatorId: 1,
    creatorName: "Sarah Chen",
    creatorAvatar: "https://i.pravatar.cc/150?img=1",
    attendees: 42,
    tags: ["coding", "hackathon", "networking"],
    isPrivate: false,
    isAttending: true
  },
  2: {
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
  }
};

// Mock comments for demonstration
const MOCK_COMMENTS = [
  {
    id: 1,
    userId: 2,
    userName: "Marcus Johnson",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    content: "Looking forward to this event! Will there be any pre-hackathon workshops?",
    timestamp: "2023-07-10T14:23:00Z"
  },
  {
    id: 2,
    userId: 1,
    userName: "Sarah Chen",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    content: "Yes! We'll be hosting a Git and collaboration tools workshop the day before. I'll update the event details soon.",
    timestamp: "2023-07-10T15:45:00Z"
  },
  {
    id: 3,
    userId: 3,
    userName: "Emma Rodriguez",
    content: "Is there a specific theme for the hackathon projects?",
    timestamp: "2023-07-11T09:12:00Z"
  }
];

export default function EventDetail() {
  const { id } = useParams();
  const eventId = id ? parseInt(id) : null;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  // In a real implementation, these would fetch from the API
  const { data: event, isLoading: loadingEvent } = useQuery<EventData>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && !isNaN(eventId),
    queryFn: async () => {
      // Mock data for demo
      return MOCK_EVENTS[eventId!] || null;
    }
  });

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: [`/api/events/${eventId}/comments`],
    enabled: !!eventId && !isNaN(eventId),
    queryFn: async () => {
      // Mock data for demo
      return MOCK_COMMENTS;
    }
  });

  const { data: attendees, isLoading: loadingAttendees } = useQuery({
    queryKey: [`/api/events/${eventId}/attendees`],
    enabled: !!eventId && !isNaN(eventId),
    queryFn: async () => {
      // Mock data for demo
      return [
        { id: 1, name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?img=1" },
        { id: 2, name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?img=2" },
        { id: 4, name: "Alex Thompson", avatar: "https://i.pravatar.cc/150?img=4" },
        { id: 5, name: "Lisa Wang", avatar: "https://i.pravatar.cc/150?img=5" }
      ];
    }
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (attending: boolean) => {
      if (!user?.id) {
        throw new Error("You must be logged in to RSVP.");
      }
      // In a real implementation:
      // await apiRequest(`/api/events/${eventId}/rsvp`, {
      //   method: attending ? 'POST' : 'DELETE',
      // });
      
      // For demo, we'll just console.log
      console.log(`${attending ? 'RSVP' : 'Cancel RSVP'} for event ${eventId}`);
      return { attending };
    },
    onSuccess: (data) => {
      // Update local data
      queryClient.setQueryData([`/api/events/${eventId}`], (old: any) => ({
        ...old,
        isAttending: data.attending,
        attendees: data.attending ? old.attendees + 1 : old.attendees - 1
      }));
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) {
        throw new Error("You must be logged in to comment.");
      }
      // In a real implementation:
      // await apiRequest(`/api/events/${eventId}/comments`, {
      //   method: 'POST',
      //   body: { content },
      // });
      
      // For demo, just return a new comment
      return {
        id: Date.now(),
        userId: user.id,
        userName: user.displayName || user.username,
        userAvatar: user.avatar,
        content,
        timestamp: new Date().toISOString()
      };
    },
    onSuccess: (newComment) => {
      // Update comments list
      queryClient.setQueryData([`/api/events/${eventId}/comments`], (old: any) => 
        old ? [...old, newComment] : [newComment]
      );
      setCommentText("");
    }
  });

  const handleRsvp = () => {
    if (event) {
      rsvpMutation.mutate(!event.isAttending);
    }
  };

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText.trim());
    }
  };

  // Handle invalid eventId
  if (!eventId || isNaN(eventId)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Invalid event ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle loading state
  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading event...</div>
      </div>
    );
  }

  // Handle event not found
  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Event not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/events')}>
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(`${event.date}T${event.time}`);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/events')}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{event.creatorName[0]}</AvatarFallback>
                      {event.creatorAvatar && <AvatarImage src={event.creatorAvatar} />}
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        Hosted by{" "}
                        <Link href={`/profile/${event.creatorId}`} className="font-medium hover:underline">
                          {event.creatorName}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleShareEvent}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  {user && (
                    <Button
                      size="sm"
                      variant={event.isAttending ? "outline" : "default"}
                      onClick={handleRsvp}
                      disabled={rsvpMutation.isPending}
                    >
                      {rsvpMutation.isPending ? (
                        <div className="animate-pulse">Processing...</div>
                      ) : (
                        event.isAttending ? "Cancel RSVP" : "RSVP"
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{format(eventDate, 'EEEE')}</p>
                    <p className="text-muted-foreground">{format(eventDate, 'MMMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{format(eventDate, 'p')}</p>
                    <p className="text-muted-foreground">Local time</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-muted-foreground">
                      {event.location.toLowerCase().includes('virtual') ? 'Online event' : 'In-person'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                
                {event.isPrivate && (
                  <Badge variant="outline">Private Event</Badge>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {event.description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="discussion">
            <TabsList>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="attendees">Attendees ({event.attendees})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discussion" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {user ? (
                    <div className="mb-6">
                      <Textarea
                        placeholder="Add to the discussion..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAddComment}
                          disabled={!commentText.trim() || addCommentMutation.isPending}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-lg mb-6 text-center">
                      <p className="mb-2">Please sign in to join the discussion</p>
                      <Button variant="outline" asChild>
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </div>
                  )}
                  
                  {loadingComments ? (
                    <div className="animate-pulse">Loading comments...</div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-6">
                      {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                            {comment.userAvatar && <AvatarImage src={comment.userAvatar} />}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link href={`/profile/${comment.userId}`} className="font-medium hover:underline">
                                {comment.userName}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.timestamp), 'PPp')}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No comments yet. Be the first to start the discussion!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="attendees" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {loadingAttendees ? (
                    <div className="animate-pulse">Loading attendees...</div>
                  ) : attendees && attendees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {attendees.map(attendee => (
                        <Link href={`/profile/${attendee.id}`} key={attendee.id}>
                          <div className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                              {attendee.avatar && <AvatarImage src={attendee.avatar} />}
                            </Avatar>
                            <span className="font-medium">{attendee.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No attendees yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Date and Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(eventDate, 'EEEE, MMMM d, yyyy')} at {format(eventDate, 'p')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Attendees</p>
                  <div className="flex items-center mt-1">
                    <div className="flex -space-x-2 mr-2">
                      {attendees?.slice(0, 3).map(attendee => (
                        <Avatar key={attendee.id} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                          {attendee.avatar && <AvatarImage src={attendee.avatar} />}
                        </Avatar>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.attendees} {event.attendees === 1 ? 'person' : 'people'} going
                    </p>
                  </div>
                </div>
              </div>
              
              {user && user.id === event.creatorId && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Host Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Edit Event
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">
                      Cancel Event
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Similar Events</h3>
              <p className="text-sm text-muted-foreground">Check out these events with similar tags</p>
              
              <div className="mt-4 space-y-4">
                {Object.values(MOCK_EVENTS)
                  .filter(e => e.id !== event.id && e.tags.some(tag => event.tags.includes(tag)))
                  .slice(0, 2)
                  .map(similarEvent => (
                    <Link key={similarEvent.id} href={`/events/${similarEvent.id}`}>
                      <div className="bg-muted/40 hover:bg-muted rounded-lg p-3 transition-colors">
                        <h4 className="font-medium">{similarEvent.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(`${similarEvent.date}T${similarEvent.time}`), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
