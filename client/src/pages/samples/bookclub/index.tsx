import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BookOpen, ArrowLeft, Calendar, Users, MessageSquare, FileText } from 'lucide-react';

/**
 * BookClub Community Sample Website
 * 
 * This is a demo website that showcases the OverlapLite widget in a literature-focused
 * community context. The widget allows visitors to see their overlap with the BookClub community.
 */
const BookClubSamplePage: React.FC = () => {
  // Load and initialize the widget when component mounts
  useEffect(() => {
    const loadWidget = () => {
      // Clear any existing widgets
      const existingWidget = document.getElementById('overlapp-widget-container');
      if (existingWidget) {
        document.body.removeChild(existingWidget);
      }
      
      // Load widget script
      const script = document.createElement('script');
      script.src = `${window.location.origin}/widget/init.js`;
      script.async = true;
      script.id = 'overlapp-widget-script';
      
      script.onload = () => {
        // Initialize with BookClub community tenant ID
        if (window.OverlapWidget) {
          window.OverlapWidget.init({
            tenantId: 'bookclub-community-123',
            position: 'bottom-right',
            theme: 'light',
          });
        }
      };
      
      document.head.appendChild(script);
    };

    // Initialize the background overlap processing
    const initializeBackgroundProcessing = () => {
      // In a real implementation, this would make an API call to start the analysis
      console.log('Starting background overlap analysis...');
    };

    loadWidget();
    initializeBackgroundProcessing();
    
    return () => {
      // Clean up
      const widgetScript = document.getElementById('overlapp-widget-script');
      if (widgetScript) {
        document.head.removeChild(widgetScript);
      }
      
      const widgetContainer = document.getElementById('overlapp-widget-container');
      if (widgetContainer) {
        document.body.removeChild(widgetContainer);
      }
    };
  }, []);

  // Demo book club data
  const featuredBooks = [
    {
      title: 'The Midnight Library',
      author: 'Matt Haig',
      cover: 'https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg',
      description: 'Between life and death there is a library, and within that library, the shelves go on forever.'
    },
    {
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      cover: 'https://m.media-amazon.com/images/I/713nNxO9V9L._AC_UF1000,1000_QL80_.jpg',
      description: 'From the Nobel Prize-winning author, a haunting tale of artificial intelligence and human connection.'
    },
    {
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      cover: 'https://m.media-amazon.com/images/I/81LoC1G3UXL._AC_UF1000,1000_QL80_.jpg',
      description: 'A lone astronaut must save the earth from disaster in this propulsive science-fiction thriller.'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Science Fiction Book Club',
      date: 'May 15, 2025',
      time: '7:00 PM'
    },
    {
      title: 'Author Spotlight: Margaret Atwood',
      date: 'May 22, 2025',
      time: '6:30 PM'
    },
    {
      title: 'Mystery Novel Reading Circle',
      date: 'May 29, 2025',
      time: '7:00 PM'
    }
  ];

  const bookClubInterests = [
    'Contemporary Fiction', 'Classic Literature', 'Science Fiction', 
    'Fantasy', 'Historical Fiction', 'Mystery', 'Biography', 
    'Poetry', 'Literary Analysis', 'Author Studies', 
    'Book to Film Adaptations', 'Writing Workshops'
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-800 text-white">
        <div className="container mx-auto py-4 px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <BookOpen className="w-8 h-8 mr-2" />
            <h1 className="text-2xl font-bold">Readers' Haven Book Club</h1>
          </div>
          
          <nav className="flex flex-wrap gap-2 md:gap-4">
            <Button variant="ghost" className="text-white hover:text-amber-200">Home</Button>
            <Button variant="ghost" className="text-white hover:text-amber-200">Books</Button>
            <Button variant="ghost" className="text-white hover:text-amber-200">Events</Button>
            <Button variant="ghost" className="text-white hover:text-amber-200">Discussions</Button>
            <Button variant="ghost" className="text-white hover:text-amber-200">About</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg bg-white bg-opacity-90 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4 text-amber-800">Join Our Reading Community</h2>
            <p className="text-lg mb-6">
              Connect with fellow book lovers, discover new titles, and engage in thoughtful literary discussions.
            </p>
            <div className="flex gap-3">
              <Button className="bg-amber-600 hover:bg-amber-700">Join Now</Button>
              <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-100">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-amber-800 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            This Month's Featured Books
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredBooks.map((book, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                  <p className="text-amber-700 mb-2">by {book.author}</p>
                  <p className="text-gray-600 text-sm">{book.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 bg-amber-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-amber-800 flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Upcoming Events
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <div className="flex items-center text-amber-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <Button variant="outline" className="w-full mt-2 border-amber-600 text-amber-600 hover:bg-amber-50">
                  RSVP
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Interests */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-amber-800 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Our Community Interests
          </h2>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {bookClubInterests.map((interest, index) => (
              <span key={index} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
          
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="font-bold text-lg mb-3 text-amber-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              See How Your Interests Overlap
            </h3>
            <p className="mb-4 text-gray-700">
              Analyze how your Digital Identity Unit (DIU) overlaps with our BookClub community!
            </p>
            
            <button 
              onClick={() => {
                // Find the widget container and trigger the overlap button
                const widgetContainer = document.getElementById('overlapp-widget-container');
                if (widgetContainer) {
                  // First find and click the QR code button to open the widget
                  const qrButton = widgetContainer.querySelector('button[aria-label="Open Overlap Widget"]');
                  if (qrButton) {
                    (qrButton as HTMLButtonElement).click();
                    
                    // Set a short timeout to allow widget to initialize and then find and click the simulate scan button
                    setTimeout(() => {
                      const scanButton = widgetContainer.querySelector('button:not([aria-label])');
                      if (scanButton) {
                        (scanButton as HTMLButtonElement).click();
                        
                        // After scan simulation, find and click the Overlap! button
                        setTimeout(() => {
                          const overlapButton = Array.from(widgetContainer.querySelectorAll('button')).find(
                            btn => btn.textContent && btn.textContent.includes('Overlap')
                          );
                          if (overlapButton) {
                            (overlapButton as HTMLButtonElement).click();
                          }
                        }, 1200);
                      }
                    }, 500);
                  }
                }
              }}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md transition flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="12" r="6" fill="rgba(255,255,255,0.7)" />
                <circle cx="16" cy="12" r="6" fill="rgba(255,255,255,0.7)" />
                <path d="M14 12a4 4 0 11-8 0 4 4 0 018 0z" fill="rgba(0,150,0,0.5)" />
              </svg>
              <span>Overlapp!</span>
              <span className="text-xs ml-1 bg-green-500 rounded px-1">Analyze DIU</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">Readers' Haven Book Club</h3>
              </div>
              <p className="max-w-md text-sm">
                A community of passionate readers dedicated to exploring literature
                across genres and fostering meaningful discussions about books.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Home</a></li>
                  <li><a href="#" className="hover:text-white">Books</a></li>
                  <li><a href="#" className="hover:text-white">Events</a></li>
                  <li><a href="#" className="hover:text-white">Discussions</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-3">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Email Us</a></li>
                  <li><a href="#" className="hover:text-white">Join Newsletter</a></li>
                  <li><a href="#" className="hover:text-white">Location</a></li>
                  <li><a href="#" className="hover:text-white">FAQ</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-amber-800 mt-8 pt-6 text-sm text-center">
            <p>&copy; 2025 Readers' Haven Book Club. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button asChild variant="outline" className="bg-white shadow-md">
          <Link to="/samples">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Samples
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default BookClubSamplePage;