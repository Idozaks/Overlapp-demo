import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tenant, WidgetAnalytics } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ExternalLink, Users, QrCode, BarChart4, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverviewTabProps {
  tenant: Tenant;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ tenant }) => {
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | 'all'>('7d');
  
  // Fetch widget analytics
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['/api/widget/analytics', tenant.id, timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/widget/analytics/${tenant.id}?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    },
  });

  // Calculate stats from analytics
  const calculateStats = () => {
    if (!analytics || !analytics.length) {
      return {
        views: 0,
        scans: 0,
        completedOverlaps: 0,
        chatInitiations: 0,
        conversionRate: 0,
        chatRate: 0,
      };
    }

    const views = analytics.filter(a => a.eventType === 'view').length;
    const scans = analytics.filter(a => a.eventType === 'scan').length;
    const completedOverlaps = analytics.filter(a => a.eventType === 'overlap_complete').length;
    const chatInitiations = analytics.filter(a => a.eventType === 'click_to_chat').length;
    
    const conversionRate = views > 0 ? (scans / views) * 100 : 0;
    const chatRate = completedOverlaps > 0 ? (chatInitiations / completedOverlaps) * 100 : 0;

    return {
      views,
      scans,
      completedOverlaps,
      chatInitiations,
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      chatRate: parseFloat(chatRate.toFixed(1)),
    };
  };

  const stats = calculateStats();

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor your widget performance and user engagement
          </p>
        </div>
        <div className="flex mt-4 md:mt-0">
          <a 
            href={`/tenant/preview/${tenant.tenantId}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Preview Widget
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Widget Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
            <p className="text-xs text-muted-foreground">
              Total times your widget was shown
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scans}</div>
            <p className="text-xs text-muted-foreground">
              Scan conversion rate: {stats.conversionRate}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Overlaps</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOverlaps}</div>
            <p className="text-xs text-muted-foreground">
              Users who completed the overlap flow
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Initiations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.chatInitiations}</div>
            <p className="text-xs text-muted-foreground">
              Chat rate: {stats.chatRate}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-4">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analytics</h2>
            <TabsList>
              <TabsTrigger value="7d">Last 7 days</TabsTrigger>
              <TabsTrigger value="30d">Last 30 days</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="7d" className="mt-6">
            {renderAnalyticsContent(analytics, isAnalyticsLoading, '7d')}
          </TabsContent>
          
          <TabsContent value="30d" className="mt-6">
            {renderAnalyticsContent(analytics, isAnalyticsLoading, '30d')}
          </TabsContent>
          
          <TabsContent value="all" className="mt-6">
            {renderAnalyticsContent(analytics, isAnalyticsLoading, 'all')}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions with your widget
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !analytics || analytics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity to display
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.slice(0, 5).map((event, i) => (
                  <div key={i} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">
                        {getEventTypeLabel(event.eventType)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.sessionId ? `Session: ${event.sessionId.slice(0, 8)}...` : 'No session ID'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(event.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Widget Setup Checklist</CardTitle>
            <CardDescription>
              Make sure your widget is properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Account created</p>
                  <p className="text-sm text-muted-foreground">
                    Your widget account is active
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`mr-2 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs
                  ${tenant?.profile ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  {tenant?.profile ? '✓' : '!'}
                </div>
                <div>
                  <p className="font-medium">Community profile</p>
                  <p className="text-sm text-muted-foreground">
                    {tenant?.profile 
                      ? 'Your community profile is complete' 
                      : 'Set up your community profile to represent your community'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`mr-2 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs
                  ${analytics && analytics.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  {analytics && analytics.length > 0 ? '✓' : '!'}
                </div>
                <div>
                  <p className="font-medium">Widget integration</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics && analytics.length > 0 
                      ? 'Your widget is successfully integrated' 
                      : 'Add the widget to your website using the integration code'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`mr-2 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs
                  ${stats.completedOverlaps > 0 ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {stats.completedOverlaps > 0 ? '✓' : '○'}
                </div>
                <div>
                  <p className="font-medium">First user overlap</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.completedOverlaps > 0 
                      ? 'Users have completed overlap analysis' 
                      : 'Users will see overlap results after scanning'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to render analytics content
const renderAnalyticsContent = (analytics: any, isLoading: boolean, timeRange: string) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <h3 className="text-lg font-medium mb-2">No data available</h3>
        <p className="text-muted-foreground">
          {timeRange === 'all' 
            ? 'Your widget has not been used yet. Integrate it with your website to start collecting data.'
            : `No analytics data available for the selected time period.`}
        </p>
      </div>
    );
  }

  // In a real implementation, you would render charts or graphs here
  return (
    <div className="border rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Event Distribution</h3>
          <div className="h-64 bg-muted/30 rounded flex items-center justify-center">
            <p className="text-muted-foreground">Chart visualization would go here</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Daily Activity</h3>
          <div className="h-64 bg-muted/30 rounded flex items-center justify-center">
            <p className="text-muted-foreground">Chart visualization would go here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format event type labels
const getEventTypeLabel = (eventType: string) => {
  switch(eventType) {
    case 'view':
      return 'Widget Viewed';
    case 'scan':
      return 'QR Code Scanned';
    case 'overlap_complete':
      return 'Overlap Analysis Completed';
    case 'click_to_chat':
      return 'Chat Initiated';
    default:
      return eventType.replace(/_/g, ' ');
  }
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default OverviewTab;