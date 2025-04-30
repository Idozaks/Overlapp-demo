import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProfileEditForm from '@/components/profile/ProfileEdit';

/**
 * QrOnboarding Component
 * 
 * A dedicated component for the QR code onboarding flow that:
 * 1. Handles a new user coming from a QR code scan
 * 2. Stores the target user ID for later overlap viewing
 * 3. Routes the user to the appropriate next step: register, complete profile, or view overlap
 */
export default function QrOnboarding() {
  const [location, navigate] = useLocation();
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [hasStoredTargetId, setHasStoredTargetId] = useState(false);
  
  // Store target user ID (the user who shared the QR code)
  useEffect(() => {
    if (id) {
      // Store in both localStorage and sessionStorage for redundancy
      localStorage.setItem('pendingOverlapUserId', id);
      sessionStorage.setItem('pendingOverlapUserId', id);
      setHasStoredTargetId(true);
      
      console.log('QR Onboarding: Stored target user ID:', id);
    }
  }, [id]);
  
  // Check if the user is already authenticated
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        console.log('QR Onboarding: User already authenticated:', user.id);
        
        // Check if the user needs to complete their profile
        const isProfileComplete = 
          user.bio && 
          user.displayName && 
          ((user.location || user.occupation) ?? false);
      
        if (isProfileComplete) {
          // If profile is complete, redirect to overlap view
          toast({
            title: "Ready to connect!",
            description: "Let's see what you have in common.",
            variant: "default"
          });
          
          navigate(`/social/overlap?targetUserId=${id}`);
        } else {
          // If profile incomplete, direct to profile completion
          toast({
            title: "Almost there!",
            description: "Let's complete your profile first.",
            variant: "default"
          });
          
          navigate(`/profile/onboarding/${id}`);
        }
      } else {
        // Not authenticated, redirect to auth flow with parameters
        console.log('QR Onboarding: User not authenticated, redirecting to signup');
      }
    }
  }, [user, authLoading, id, navigate, toast]);

  // Loading state
  if (authLoading || !hasStoredTargetId) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing onboarding...</p>
        </div>
      </div>
    );
  }
  
  // User not authenticated - show registration prompt
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create Your Profile</CardTitle>
            <CardDescription>
              Create an account to connect and see what you have in common
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="rounded-full bg-primary/10 p-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">QR code scanned successfully</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              size="lg"
              onClick={() => navigate(`/auth?source=qr-signup&pendingId=${id}`)}
            >
              Create My Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // User is authenticated but hasn't been redirected yet
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Preparing your experience...</p>
      </div>
    </div>
  );
}