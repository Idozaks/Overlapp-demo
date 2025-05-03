import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

// Define interests
const INTERESTS = [
  "Technology",
  "Art & Design",
  "Food & Cooking",
  "Fitness",
  "Travel",
  "Music",
  "Reading",
  "Photography",
  "Gaming",
  "Fashion",
  "Gardening",
  "Movies",
  "Science",
  "Sports",
  "Podcasts",
  "Hiking",
  "Crafts",
  "Writing",
  "Dancing",
  "Yoga",
  "Meditation",
  "Camping",
  "Cycling",
  "Coffee",
  "Wine",
  "Pets",
  "Volunteering"
];

interface OnboardingPageProps {
  onComplete?: (userData: any) => void;
}

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    avatar: '/avatars/avatar1.svg',
    interests: [] as number[]
  });
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: '100%' },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: '-100%' }
  };
  
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };
  
  // Handle avatar selection
  const handleAvatarSelect = (avatar: string) => {
    setUserData({ ...userData, avatar });
  };
  
  // Handle name input
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, name: e.target.value });
  };
  
  // Handle interest toggle
  const handleInterestToggle = (interestId: number) => {
    const newInterests = [...userData.interests];
    
    if (newInterests.includes(interestId)) {
      // Remove interest if already selected
      const index = newInterests.indexOf(interestId);
      newInterests.splice(index, 1);
    } else {
      // Add interest if not selected
      newInterests.push(interestId);
    }
    
    setUserData({ ...userData, interests: newInterests });
  };
  
  // Move to next step
  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Show success toast
      toast({
        title: "Profile created successfully!",
        description: "Your connections are ready to explore."
      });
      
      // If onComplete prop is provided, call it with userData
      if (onComplete) {
        onComplete(userData);
      } else {
        // Otherwise, save to localStorage and navigate
        localStorage.setItem('userData', JSON.stringify(userData));
        setLocation('/hybrid');
      }
    }
  };
  
  // Move to previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Validate if user can proceed to next step
  const canProceed = () => {
    if (step === 1) {
      // For step 1, avatar is pre-selected, so just basic name validation
      return userData.name.trim().length > 0;
    } else if (step === 2) {
      // For step 2, at least 1 interest must be selected
      return userData.interests.length > 0;
    }
    
    return true;
  };
  
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <div className="gradient-primary text-white p-1.5 rounded-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold ml-2 bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] bg-clip-text text-transparent">Overlapp</h1>
        </div>
        <div className="gradient-primary gradient-text font-medium">
          Step {step} of 3
        </div>
      </header>
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flex-grow flex flex-col p-6 max-w-md mx-auto w-full"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Create Your Profile</h2>
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  Choose an avatar
                </label>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {["Lisa", "Dustin", "Maggie", "Willow", "Felix", "Harper", "Zoe", "Morgan", "Ash"].map((name, index) => (
                    <div 
                      key={index}
                      className={`
                        rounded-lg p-2 cursor-pointer transition-all duration-300
                        ${userData.avatar === `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : 'hover:bg-muted/50'}
                      `}
                      onClick={() => handleAvatarSelect(`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`)}
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
                        alt={`Avatar ${name}`}
                        className="w-full h-auto rounded-full"
                      />
                    </div>
                  ))}
                </div>
                
                <label className="block text-sm font-medium mb-2">
                  Your name (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={userData.name}
                  onChange={handleNameChange}
                  className="mb-4"
                />
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Select Your Interests</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Choose what you're interested in to personalize your experience
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {INTERESTS.map((interest, index) => (
                  <Badge
                    key={index}
                    variant={userData.interests.includes(index) ? "default" : "outline"}
                    className={`
                      cursor-pointer text-sm py-1.5 px-3
                      ${userData.interests.includes(index) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted/50'}
                    `}
                    onClick={() => handleInterestToggle(index)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Selected: {userData.interests.length} interests
              </p>
            </>
          )}
          
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] bg-clip-text text-transparent">Ready to Spark?</h2>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <img 
                    src={userData.avatar} 
                    alt="Selected avatar" 
                    className="w-20 h-20 mr-4 rounded-full shadow-sm"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {userData.name || "Anonymous Explorer"}
                    </h3>
                    <p className="text-gray-500 font-medium">
                      {userData.interests.length} interests selected
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-700">Selected Interests:</h4>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interestId) => (
                      <Badge 
                        key={interestId}
                        className="bg-gradient-to-r from-[#4D7FE8]/10 to-[#40E0D0]/10 text-[#4D7FE8] border-[#4D7FE8]/20"
                      >
                        {INTERESTS[interestId]}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 border-t border-gray-100 pt-4 mt-4">
                  Your profile is stored locally and can be deleted at any time.
                </p>
              </div>
              
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] hover:opacity-90 transition-opacity text-white px-8 py-6 rounded-lg"
                  onClick={handleNextStep}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Enter Overlapp
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 1}
          className="text-gray-600"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={handleNextStep}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-[#4D7FE8] to-[#40E0D0] hover:opacity-90 transition-opacity text-white"
        >
          {step === 3 ? (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enter Overlapp
            </>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}