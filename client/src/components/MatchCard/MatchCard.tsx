import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export interface MatchProfile {
  id: number;
  name: string;
  avatar: string;
  interests: string[];
  location: string;
  bio: string;
  matchPercentage: number;
}

interface MatchCardProps {
  profile: MatchProfile;
  isActive?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ profile, isActive = false }) => {
  const { name, avatar, interests, location, bio, matchPercentage } = profile;

  return (
    <Card className={`w-full h-full overflow-hidden transition-all duration-300 ${
      isActive ? 'shadow-lg' : 'shadow-md'
    }`}>
      <CardContent className="p-0">
        <div className="flex flex-col h-full">
          {/* Avatar and match percentage */}
          <div className="relative">
            <img 
              src={avatar} 
              alt={`${name}'s avatar`} 
              className="w-full aspect-square object-cover bg-gray-100"
            />
            <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md">
              <span className="font-bold bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] bg-clip-text text-transparent">
                {matchPercentage}% match
              </span>
            </div>
          </div>
          
          {/* Profile info */}
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{name}</h3>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {location}
            </div>
            
            <p className="text-gray-600 mb-3 flex-grow">{bio}</p>
            
            <div className="mb-3">
              <div className="text-sm font-medium mb-1 text-gray-700">Match Strength</div>
              <Progress 
                value={matchPercentage} 
                className="h-2 bg-gray-100"
                indicatorClassName="bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0]"
              />
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1 text-gray-700">Shared Interests</div>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-gradient-to-r from-[#4D7FE8]/10 to-[#40E0D0]/10 text-[#4D7FE8] border-[#4D7FE8]/20"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;