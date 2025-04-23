import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, BarChart3, Settings, ExternalLink, Users, Percent } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import SettingsTab from './tabs/SettingsTab';
import ProfileTab from './tabs/ProfileTab';
import CodeTab from './tabs/CodeTab';

interface TenantWithProfile {
  id: number;
  tenantId: string;
  name: string;
  email: string;
  logoUrl?: string;
  settings?: {
    allowedDomains?: string[];
    customCss?: string;
    embedOptions?: {
      position?: string;
      theme?: string;
    };
  };
  profile: {
    id: number;
    name: string;
    description?: string;
    tags: string[];
  };
}

interface AnalyticsSummary {
  viewCount: number;
  scanCount: number;
  overlapCount: number;
  chatClickCount: number;
  scanRate: number;
  overlapRate: number;
  chatRate: number;
  averageScore: number;
  totalSessions: number;
  completedSessions: number;
}

const DashboardPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<TenantWithProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    // Check if we have tenant info in localStorage
    const storedTenant = localStorage.getItem('overlapp_tenant');
    if (!storedTenant) {
      setLocation('/tenant/login');
      return;
    }
    
    // Parse the stored tenant info
    try {
      const tenantData = JSON.parse(storedTenant);
      setTenant(tenantData);
      
      // Fetch analytics data
      fetchAnalytics(tenantData.tenantId);
    } catch (error) {
      console.error('Error parsing tenant data:', error);
      localStorage.removeItem('overlapp_tenant');
      setLocation('/tenant/login');
    }
  }, []);

  const fetchAnalytics = async (tenantId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/widget/tenant/${tenantId}/analytics`);
      setAnalytics(response.data.summary);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('overlapp_tenant');
    setLocation('/tenant/login');
  };

  if (loading && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OverlapLite" className="w-8 h-8" />
            <h1 className="text-xl font-bold">OverlapLite Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {tenant && (
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {tenant.name}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {tenant && (
          <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{tenant.name}</h2>
                <p className="text-muted-foreground">
                  Manage your widget settings and view analytics
                </p>
              </div>
              <Button asChild>
                <Link href="/tenant/preview">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview Widget
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.viewCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Widget impressions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scan Rate</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.scanRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">QR code scan conversion</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.averageScore || 0}%</div>
                  <p className="text-xs text-muted-foreground">Average overlap score</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chat Rate</CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.chatRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Click-to-chat conversion</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Community Profile</TabsTrigger>
                <TabsTrigger value="settings">Widget Settings</TabsTrigger>
                <TabsTrigger value="code">Embed Code</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                {analytics && <OverviewTab analytics={analytics} />}
              </TabsContent>
              <TabsContent value="profile">
                {tenant && (
                  <ProfileTab
                    tenant={tenant}
                    onUpdate={(updatedTenant) => setTenant(updatedTenant)}
                  />
                )}
              </TabsContent>
              <TabsContent value="settings">
                {tenant && (
                  <SettingsTab
                    tenant={tenant}
                    onUpdate={(updatedTenant) => setTenant(updatedTenant)}
                  />
                )}
              </TabsContent>
              <TabsContent value="code">
                {tenant && <CodeTab tenant={tenant} />}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;