import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MatchCardCarousel from '@/components/MatchCardCarousel';
import { MatchProfile } from '@/components/MatchCard/MatchCard';
import { Icons } from '@/components/ui/icons';
import { Users, MessageCircle, Settings } from 'lucide-react';

// Import demo matches
import demoMatches from '@/data/demo-matches.json';

const Lobby: React.FC = () => {
  const [, setLocation] = useLocation();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the matches
    const loadMatches = async () => {
      setLoading(true);
      // In a real app, we would fetch the matches from the API
      // For now, we're using the demo matches
      await new Promise(resolve => setTimeout(resolve, 800));
      setMatches(demoMatches);
      setSelectedMatch(demoMatches[0]);
      setLoading(false);
    };

    loadMatches();
  }, []);

  const handleMatchSelected = (match: MatchProfile) => {
    setSelectedMatch(match);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Icons.logo className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] bg-clip-text text-transparent">
              Overlapp
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => alert('Settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-t-[#4D7FE8] border-r-[#40E0D0] border-b-[#4D7FE8] border-l-[#40E0D0] animate-spin" />
            <p className="mt-4 text-gray-600">Finding your matches...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome to Overlapp!</h2>
              <p className="text-gray-600 mt-2">
                We found {matches.length} people who share your interests
              </p>
            </div>

            {/* Match Carousel */}
            <div className="mb-10">
              <MatchCardCarousel 
                matches={matches} 
                onMatchSelected={handleMatchSelected} 
              />
            </div>

            {/* Connection Actions */}
            {selectedMatch && (
              <Card className="mb-8">
                <CardContent className="p-5">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Connect with {selectedMatch.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      className="bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] hover:opacity-90"
                      onClick={() => alert(`Starting chat with ${selectedMatch.name}`)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </Button>
                    <Button variant="outline" onClick={() => alert('View Profile')}>
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex flex-col items-center">
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Matches</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs mt-1">Chats</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center" onClick={() => setLocation('/profile')}>
            <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0]" />
            <span className="text-xs mt-1">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;