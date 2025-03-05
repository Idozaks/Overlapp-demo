
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export interface EventData {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  creatorId: number;
  creatorName: string;
  creatorAvatar?: string;
  attendees: number;
  tags: string[];
  isPrivate: boolean;
  isAttending?: boolean;
}

interface EventCardProps {
  event: EventData;
  onRsvp?: (eventId: number, attending: boolean) => void;
}

export default function EventCard({ event, onRsvp }: EventCardProps) {
  const formattedDate = new Date(`${event.date}T${event.time}`);
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>{event.creatorName[0]}</AvatarFallback>
              {event.creatorAvatar && <AvatarImage src={event.creatorAvatar} />}
            </Avatar>
            <Link href={`/profile/${event.creatorId}`} className="text-sm hover:underline">
              {event.creatorName}
            </Link>
          </div>
          {event.isPrivate && <Badge variant="outline">Private</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <Link href={`/events/${event.id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
            {event.title}
          </h3>
        </Link>
        <p className="text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{format(formattedDate, 'PPP')} at {format(formattedDate, 'p')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{event.attendees} {event.attendees === 1 ? 'attendee' : 'attendees'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-4">
          {event.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 pt-3">
        {onRsvp && (
          <Button 
            variant={event.isAttending ? "outline" : "default"} 
            size="sm" 
            className="w-full"
            onClick={() => onRsvp(event.id, !event.isAttending)}
          >
            {event.isAttending ? "Cancel RSVP" : "RSVP"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
