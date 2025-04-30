import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import ProfileEditForm from '@/components/profile/ProfileEdit';
import { Loader2 } from 'lucide-react';

export function OnboardingWrapper() {
  // Hooks must be called unconditionally at the top level
  const { user } = useAuth();
  const [location] = useLocation();
  
  // State for manual authentication verification
  const [authVerified, setAuthVerified] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once when the component mounts to verify authentication
  useEffect(() => {
    // Helper function to extract pending ID from multiple sources
    const extractPendingId = () => {
      // Check URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const pendingIdFromUrl = urlParams.get('pendingId');
      
      // Then check localStorage/sessionStorage
      const pendingIdFromLocal = localStorage.getItem('pendingOverlapUserId');
      const pendingIdFromSession = sessionStorage.getItem('pendingOverlapUserId');
      
      // Use the first available source
      const foundId = pendingIdFromUrl || pendingIdFromLocal || pendingIdFromSession;
      
      // If we found an ID, ensure it's stored for persistence
      if (foundId) {
        console.log('DEBUG-QR-ONBOARDING: pendingOverlapUserId found:', foundId);
        // Store it in both storage mechanisms for maximum reliability
        localStorage.setItem('pendingOverlapUserId', foundId);
        sessionStorage.setItem('pendingOverlapUserId', foundId);
      }
      
      return foundId;
    };
    
    // Check if the user is logged in by making an explicit API call
    const verifyAuthentication = async () => {
      try {
        console.log('DEBUG-QR-ONBOARDING: Verifying authentication state...');
        
        // Get the pending ID first (from URL, localStorage, or sessionStorage)
        const extractedPendingId = extractPendingId();
        setPendingUserId(extractedPendingId);
        
        // Make an explicit API call to verify authentication
        const response = await fetch('/api/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to verify authentication');
        }
        
        const userData = await response.json();
        console.log('DEBUG-QR-ONBOARDING: Authentication verified successfully:', userData);
        
        // Store the verified user data
        setVerifiedUser(userData);
        setAuthVerified(true);
        setIsLoading(false);
      } catch (error) {
        console.error('DEBUG-QR-ONBOARDING: Authentication verification failed:', error);
        
        // Check if this is from a QR signup
        const urlParams = new URLSearchParams(window.location.search);
        const isFromQrSignup = urlParams.get('source') === 'qr-signup';
        
        // Store error details for debugging
        localStorage.setItem('auth_error', 'Authentication verification failed during onboarding');
        
        // Redirect to appropriate page
        if (isFromQrSignup) {
          window.location.href = '/auth?error=auth_failed&source=qr-signup';
        } else {
          window.location.href = '/auth';
        }
      }
    };
    
    // Start the verification process
    verifyAuthentication();
  }, []);

  // When still loading or auth is unverified, show loading state
  if (isLoading || !authVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Verifying your account...</p>
      </div>
    );
  }

  // If we have verified auth but no user data, something is wrong
  if (!verifiedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <h2 className="text-lg font-medium text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-700">
            There was a problem verifying your account. Please try logging in again.
          </p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/auth'}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Once we have verified the user is authenticated, render the ProfileEditForm
  return (
    <ProfileEditForm 
      user={verifiedUser}
      isOnboarding={true} 
      onSuccess={(updatedUser: any) => {
        // After profile is completed, check for pending overlap
        console.log('DEBUG-QR-COMPLETION: onSuccess callback called with pendingUserId:', pendingUserId);
        console.log('DEBUG-QR-COMPLETION: updatedUser:', updatedUser);
        
        // Extract the user ID properly from the response
        const userId = updatedUser?.id || (updatedUser?.user?.id) || verifiedUser?.id;
        
        if (!userId) {
          console.error('DEBUG-QR-COMPLETION: Could not extract user ID from updatedUser:', updatedUser);
          // Handle error gracefully
          alert('Profile updated but there was an error getting your user information. Please try logging in again.');
          window.location.href = '/';
          return;
        }
        
        if (pendingUserId) {
          console.log('DEBUG-QR-COMPLETION: Redirecting to overlap view with targetUserId:', pendingUserId);
          // Remove from localStorage but keep in sessionStorage just in case we need it later
          localStorage.removeItem('pendingOverlapUserId');
          window.location.href = `/social/overlap?targetUserId=${pendingUserId}`;
        } else {
          console.log('DEBUG-QR-COMPLETION: No pendingUserId found, redirecting to profile');
          window.location.href = `/profile/${userId}`;
        }
      }}
    />
  );
}

export default OnboardingWrapper;