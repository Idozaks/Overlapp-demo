import { FC, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, BookOpen, Calendar, PencilIcon } from "lucide-react";

// Fallback user data for MVP
const fallbackUser = {
  name: "Guest User",
  username: "guest_user",
  bio: "I'm interested in technology, design, and connecting with like-minded individuals.",
  location: "Tel Aviv, Israel",
  joinedDate: "May 2025",
  interests: [
    "Technology", "Programming", "Web Development", 
    "Artificial Intelligence", "Machine Learning", 
    "Data Science", "UX/UI Design", "Startups",
    "Music", "Movies", "Education", "Shopping",
    "Photography", "Literature", "Social Media"
  ]
};

// Profile data structure type - for localStorage
interface OnboardingProfile {
  name?: string;
  email?: string;
  location?: string;
  occupation?: string;
  bio?: string;
  interests?: string[];
}

interface MvpUserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MvpUserProfile: FC<MvpUserProfileProps> = ({ isOpen, onClose }) => {
  // Initialize with fallback data, but try to load from localStorage
  const [user, setUser] = useState({
    ...fallbackUser,
    // We'll populate this with real values from localStorage
  });

  // Load profile data from localStorage when component mounts
  useEffect(() => {
    try {
      // Try to get user profile from localStorage - using the 'userData' key from OnboardingPage
      const storedUserData = localStorage.getItem('userData');
      
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        console.log('Loaded user data from localStorage:', userData);
        
        // Extract interest names from the indices
        let interestNames: string[] = [];
        
        // Handle both numeric interest indices and string arrays (enriched interests)
        if (userData.interests && Array.isArray(userData.interests)) {
          // Get interest names from the static INTERESTS array
          const INTERESTS = [
            "Technology", "Art & Design", "Food & Cooking", "Fitness", "Travel", 
            "Music", "Reading", "Photography", "Gaming", "Fashion", "Gardening", 
            "Movies", "Science", "Sports", "Podcasts", "Hiking", "Crafts", 
            "Writing", "Dancing", "Yoga", "Meditation", "Camping", "Cycling", 
            "Coffee", "Wine", "Pets", "Volunteering"
          ];
          
          // Convert interest indices to names if they are numbers
          if (userData.interests.length > 0 && typeof userData.interests[0] === 'number') {
            interestNames = userData.interests.map((id: number) => INTERESTS[id]);
          }
        }
        
        // Add enriched interests if available
        if (userData.enrichedInterests && Array.isArray(userData.enrichedInterests)) {
          interestNames = [...interestNames, ...userData.enrichedInterests];
        }
        
        // Update user with stored profile data
        setUser(prev => ({
          ...prev,
          name: userData.name || prev.name,
          username: userData.name ? userData.name.toLowerCase().replace(/\s+/g, '_') : prev.username,
          // No bio field in userData, so keeping the default
          // Use the enriched + regular interests if available
          interests: interestNames.length > 0 ? interestNames : prev.interests,
        }));
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error);
    }
  }, []);
  const [, navigate] = useLocation();
  
  // Handle edit profile - in MVP this would lead to onboarding
  const handleEditProfile = () => {
    onClose();
    navigate("/onboarding");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">Profile</DialogTitle>
          <DialogDescription>
            Your profile and interests
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-auto py-2">
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/20">
                <User className="h-8 w-8 text-primary" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <PencilIcon className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </div>
          
          <div className="space-y-4 mb-5">
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {user.joinedDate}</span>
            </div>
          </div>
          
          <div className="mb-5">
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-sm">{user.bio}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="py-1">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-shrink-0 mt-3 pt-2 border-t">
          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MvpUserProfile;