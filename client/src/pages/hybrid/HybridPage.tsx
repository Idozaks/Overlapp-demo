import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Lobby from '@/views/Lobby';
import OnboardingPage from '../onboarding/OnboardingPage';

// This page handles the flow between onboarding and the main app
const HybridPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboardingStatus = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          // User data exists, onboarding complete
          setOnboardingComplete(true);
        }
      } catch (e) {
        console.error('Error checking onboarding status:', e);
      }
      setIsLoading(false);
    };
    
    checkOnboardingStatus();
  }, []);
  
  const handleOnboardingComplete = (userData: any) => {
    // Save user data to localStorage
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
      setOnboardingComplete(true);
    } catch (e) {
      console.error('Error saving user data:', e);
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-t-[#4D7FE8] border-r-[#40E0D0] border-b-[#4D7FE8] border-l-[#40E0D0] animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      {onboardingComplete ? (
        <Lobby />
      ) : (
        <OnboardingPage onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default HybridPage;