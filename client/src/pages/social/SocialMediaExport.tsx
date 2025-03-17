import React from 'react';
import { useQuery } from '@tanstack/react-query';
import SocialMediaExport from '@/components/profile/SocialMediaExport';
import type { User } from '@shared/schema';

export default function SocialMediaExportPage() {
  // Fetch the current user data
  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: ['/api/user'],
    retry: false,
  });

  if (loadingUser) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-muted rounded animate-pulse mb-4 w-1/3"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
            <div className="h-48 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !user.user) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to access the Social Media Export feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Social Media Profile Export</h1>
        <p className="text-muted-foreground mb-8">
          Share your Overlapp identity across your favorite social platforms with optimized formatting and privacy controls.
        </p>
        
        <SocialMediaExport userId={user.user.id} />
      </div>
    </div>
  );
}