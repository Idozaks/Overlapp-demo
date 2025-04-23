import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Tenant, TenantProfile } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, Settings, Code, BarChart4, User, RefreshCw } from 'lucide-react';

import OverviewTab from './tabs/OverviewTab';
import SettingsTab from './tabs/SettingsTab';
import ProfileTab from './tabs/ProfileTab';
import CodeTab from './tabs/CodeTab';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch tenant data
  const { data: tenant, isLoading: isTenantLoading, error: tenantError } = useQuery({
    queryKey: ['/api/widget/tenant/me'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/widget/tenant/me');
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, redirect to login
          navigate('/tenant/login');
          throw new Error('You must be logged in to access this page');
        }
        throw new Error('Failed to fetch tenant data');
      }
      return response.json();
    },
  });

  // Fetch tenant profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/widget/tenant/profile', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      const response = await apiRequest('GET', `/api/widget/tenant/profile/${tenant.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet, return null
          return null;
        }
        throw new Error('Failed to fetch tenant profile');
      }
      return response.json();
    },
    enabled: !!tenant?.id,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/widget/tenant/logout');
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
    },
    onSuccess: () => {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/tenant/login');
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (profileData: { name: string, description?: string, tags: string[] }) => {
      if (!tenant?.id) throw new Error('Tenant ID is required');
      const response = await apiRequest('POST', '/api/widget/tenant/profile', {
        tenantId: tenant.id,
        ...profileData,
      });
      if (!response.ok) {
        throw new Error('Failed to create profile');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile created',
        description: 'Your profile has been created successfully',
      });
      // Invalidate profile query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/widget/tenant/profile', tenant?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Profile creation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { id: number, name: string, description?: string, tags: string[] }) => {
      const response = await apiRequest('PATCH', `/api/widget/tenant/profile/${profileData.id}`, profileData);
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      // Invalidate profile query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/widget/tenant/profile', tenant?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Profile update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update tenant settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      if (!tenant?.id) throw new Error('Tenant ID is required');
      const response = await apiRequest('PATCH', `/api/widget/tenant/${tenant.id}/settings`, { settings });
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      return response.json();
    },
    onSuccess: (updatedTenant) => {
      toast({
        title: 'Settings updated',
        description: 'Your widget settings have been updated successfully',
      });
      // Update tenant data in cache
      queryClient.setQueryData(['/api/widget/tenant/me'], updatedTenant);
    },
    onError: (error: Error) => {
      toast({
        title: 'Settings update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update tenant information mutation
  const updateTenantInfoMutation = useMutation({
    mutationFn: async (data: { name: string, email: string, logoUrl?: string }) => {
      if (!tenant?.id) throw new Error('Tenant ID is required');
      const response = await apiRequest('PATCH', `/api/widget/tenant/${tenant.id}`, data);
      if (!response.ok) {
        throw new Error('Failed to update tenant information');
      }
      return response.json();
    },
    onSuccess: (updatedTenant) => {
      toast({
        title: 'Information updated',
        description: 'Your account information has been updated successfully',
      });
      // Update tenant data in cache
      queryClient.setQueryData(['/api/widget/tenant/me'], updatedTenant);
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle profile save
  const handleProfileSave = (profileData: { name: string, description?: string, tags: string[] }) => {
    if (profile) {
      updateProfileMutation.mutate({ id: profile.id, ...profileData });
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  // Handle settings save
  const handleSettingsSave = (settings: any) => {
    updateSettingsMutation.mutate(settings);
  };

  // Handle tenant info update
  const handleTenantInfoUpdate = (data: { name: string, email: string, logoUrl?: string }) => {
    updateTenantInfoMutation.mutate(data);
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Show loading state
  if (isTenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
  if (tenantError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Unable to load dashboard</h1>
        <p className="mb-6 text-center text-muted-foreground">
          {tenantError instanceof Error ? tenantError.message : 'Unable to load tenant data'}
        </p>
        <button 
          onClick={() => navigate('/tenant/login')} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <a href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Overlapp Logo" className="h-8" />
              <span className="font-bold">OverlapLite</span>
            </a>
          </div>
          <div className="flex-1" />
          <nav className="flex items-center space-x-1">
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm flex items-center hover:bg-muted rounded-md"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="mb-6 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3 mb-4">
                  {tenant.logoUrl ? (
                    <img 
                      src={tenant.logoUrl} 
                      alt={tenant.name} 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-medium">{tenant.name}</h2>
                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">{tenant.email}</p>
                  </div>
                </div>
                
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  orientation="vertical"
                  className="w-full"
                >
                  <TabsList className="flex flex-col h-auto items-stretch space-y-1 bg-transparent p-0">
                    <TabsTrigger 
                      value="overview" 
                      className="justify-start px-3 py-2 h-9 font-normal"
                    >
                      <BarChart4 className="w-4 h-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="profile" 
                      className="justify-start px-3 py-2 h-9 font-normal"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Community Profile
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings" 
                      className="justify-start px-3 py-2 h-9 font-normal"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Widget Settings
                    </TabsTrigger>
                    <TabsTrigger 
                      value="code" 
                      className="justify-start px-3 py-2 h-9 font-normal"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Integration Code
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-medium mb-2 text-sm">Widget Status</h3>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span>Active</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Plan: </span>
                  {tenant.subscription?.plan || 'Free'}
                </div>
                {tenant.subscription?.currentPeriodEnd && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium">Renews: </span>
                    {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab tenant={tenant} />
              </TabsContent>
              
              <TabsContent value="profile" className="mt-0">
                <ProfileTab 
                  tenant={tenant} 
                  profile={profile} 
                  isLoading={isProfileLoading}
                  onSave={handleProfileSave}
                  onTenantInfoUpdate={handleTenantInfoUpdate}
                  isSaving={createProfileMutation.isPending || updateProfileMutation.isPending}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <SettingsTab 
                  tenant={tenant} 
                  onSave={handleSettingsSave}
                  isSaving={updateSettingsMutation.isPending}
                />
              </TabsContent>
              
              <TabsContent value="code" className="mt-0">
                <CodeTab tenant={tenant} profile={profile} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;