import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ChevronRight, User, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Define interests data (would normally come from API)
const INTERESTS = [
  { id: 1, name: 'Technology', category: 'Tech' },
  { id: 2, name: 'Art & Design', category: 'Creative' },
  { id: 3, name: 'Food & Cooking', category: 'Lifestyle' },
  { id: 4, name: 'Fitness', category: 'Health' },
  { id: 5, name: 'Travel', category: 'Lifestyle' },
  { id: 6, name: 'Music', category: 'Entertainment' },
  { id: 7, name: 'Reading', category: 'Education' },
  { id: 8, name: 'Photography', category: 'Creative' },
  { id: 9, name: 'Gaming', category: 'Entertainment' },
  { id: 10, name: 'Fashion', category: 'Lifestyle' },
  { id: 11, name: 'Gardening', category: 'Lifestyle' },
  { id: 12, name: 'Movies', category: 'Entertainment' },
  { id: 13, name: 'Science', category: 'Education' },
  { id: 14, name: 'Sports', category: 'Health' },
  { id: 15, name: 'Podcasts', category: 'Entertainment' },
];

// Avatar selection options
const AVATARS = [
  '/avatars/avatar1.png', 
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
];

// Form schema
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  avatar: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

// Enum for onboarding steps
enum OnboardingStep {
  ProfileSetup,
  InterestSelection,
  Complete
}

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // State management
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.ProfileSetup);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      avatar: '',
    },
  });

  // Handle avatar selection
  const handleAvatarSelect = (avatarPath: string) => {
    setSelectedAvatar(avatarPath);
    form.setValue('avatar', avatarPath);
  };
  
  // Handle interest toggle
  const toggleInterest = (interestId: number) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };
  
  // Move to next step
  const goToNextStep = () => {
    if (step === OnboardingStep.ProfileSetup) {
      setStep(OnboardingStep.InterestSelection);
    } else if (step === OnboardingStep.InterestSelection) {
      completeOnboarding();
    }
  };

  const onSubmitProfile = (data: ProfileValues) => {
    // In a real app, we would post this to the server
    console.log('Profile data:', data);
    goToNextStep();
  };
  
  // Complete onboarding and redirect to home
  const completeOnboarding = () => {
    // Gather all user data
    const userData = {
      ...form.getValues(),
      interests: selectedInterests
    };
    
    // Save to localStorage for the DIU (Device Identity Unit)
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Show success notification
    toast({
      title: "Onboarding complete!",
      description: "Your profile has been set up successfully.",
    });
    
    // Navigate to home page
    setLocation('/home');
  };
  
  // Render profile setup step
  const renderProfileSetup = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Choose an avatar</FormLabel>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {AVATARS.map((avatar, index) => (
                <div 
                  key={index}
                  className={`
                    cursor-pointer rounded-full p-1 transition-all
                    ${selectedAvatar === avatar ? 'ring-2 ring-primary' : 'hover:bg-muted'}
                  `}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
  
  // Render interest selection step
  const renderInterestSelection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <Badge
              key={interest.id}
              variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
              className={`
                text-sm py-2 px-3 cursor-pointer transition-all
                ${selectedInterests.includes(interest.id) ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}
              `}
              onClick={() => toggleInterest(interest.id)}
            >
              {interest.name}
            </Badge>
          ))}
        </div>
      </div>

      <Button 
        onClick={goToNextStep} 
        className="w-full"
        disabled={selectedInterests.length === 0}
      >
        Spark it!
        <Sparkles className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
  
  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card className="border-none shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === OnboardingStep.ProfileSetup && "Welcome to Overlapp"}
            {step === OnboardingStep.InterestSelection && "What are you into?"}
          </CardTitle>
          <CardDescription>
            {step === OnboardingStep.ProfileSetup && "Set up your profile to get started"}
            {step === OnboardingStep.InterestSelection && "Select interests to discover connections"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === OnboardingStep.ProfileSetup && renderProfileSetup()}
          {step === OnboardingStep.InterestSelection && renderInterestSelection()}
        </CardContent>
        
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <span className={step >= OnboardingStep.ProfileSetup ? "text-primary" : ""}>•</span>
            <span className={step >= OnboardingStep.InterestSelection ? "text-primary" : ""}>•</span>
          </div>
          <div>Step {step + 1}/2</div>
        </CardFooter>
      </Card>
    </div>
  );
}