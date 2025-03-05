import { Menu, Search, Sun, Moon, User, Users, Bell, Calendar } from "lucide-react";
import Link from 'next/link';
import { Button, Tooltip } from '@nextui-org/react';


function Header({ isAuthenticated, setIsAuthenticated }) {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold">Overlapp</h1>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <Tooltip content="Social Hub">
                <Link href="/social">
                  <Button variant="ghost" size="icon" className="mr-1">
                    <Users className="h-5 w-5" />
                  </Button>
                </Link>
              </Tooltip>
              <Tooltip content="Events">
                <Link href="/events">
                  <Button variant="ghost" size="icon" className="mr-1">
                    <Calendar className="h-5 w-5" />
                  </Button>
                </Link>
              </Tooltip>
              <Button onClick={() => setIsAuthenticated(false)}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function EventsPage() {
  return (
    <div>
      <h1>Upcoming Events</h1>
      {/* Placeholder for event list */}
      <p>This section would display upcoming events.</p>
    </div>
  );
}

function CreateEventPage() {
  return (
    <div>
      <h1>Create New Event</h1>
      {/* Placeholder for event creation form */}
      <p>This section would contain a form to create new events.</p>
    </div>
  );
}


function EventDetailsPage() {
  return (
    <div>
      <h1>Event Details</h1>
      {/* Placeholder for event details */}
      <p>This section would display details of a specific event.</p>
    </div>
  );
}


export { Header, EventsPage, CreateEventPage, EventDetailsPage };