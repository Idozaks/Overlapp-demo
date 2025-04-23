import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

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

const PreviewPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [tenant, setTenant] = useState<TenantWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState<string>('bottom-right');
  const [theme, setTheme] = useState<string>('light');
  
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
      
      // Set default position and theme from tenant settings
      if (tenantData.settings?.embedOptions) {
        setPosition(tenantData.settings.embedOptions.position || 'bottom-right');
        setTheme(tenantData.settings.embedOptions.theme || 'light');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing tenant data:', error);
      localStorage.removeItem('overlapp_tenant');
      setLocation('/tenant/login');
    }
  }, []);

  // Function to load and initialize the widget
  const loadWidget = () => {
    // If widget is already loaded, remove it first
    const existingWidget = document.getElementById('overlapp-widget-container');
    if (existingWidget) {
      document.body.removeChild(existingWidget);
    }
    
    // Load the widget script dynamically
    const script = document.createElement('script');
    script.src = `${window.location.origin}/widget/init.js`;
    script.async = true;
    script.id = 'overlapp-widget-script';
    
    script.onload = () => {
      // Initialize the widget
      if (tenant && window.OverlapWidget) {
        window.OverlapWidget.init({
          tenantId: tenant.tenantId,
          position: position as any,
          theme: theme as any,
        });
      }
    };
    
    document.head.appendChild(script);
  };

  // Apply settings changes and reload widget
  const applySettings = () => {
    loadWidget();
  };

  // Effect to load the widget when the component mounts or settings change
  useEffect(() => {
    if (!isLoading && tenant) {
      loadWidget();
    }
    
    return () => {
      // Clean up
      const widgetScript = document.getElementById('overlapp-widget-script');
      if (widgetScript) {
        document.head.removeChild(widgetScript);
      }
      
      const widgetContainer = document.getElementById('overlapp-widget-container');
      if (widgetContainer) {
        document.body.removeChild(widgetContainer);
      }
    };
  }, [isLoading, tenant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => setLocation('/tenant/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Widget Preview</h1>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-[600px] flex items-center justify-center relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <h2 className="text-xl font-semibold mb-4">Your Website Content</h2>
                <p className="text-center text-muted-foreground mb-4">
                  This is an example of how the OverlapLite Widget would appear on your website.
                  The widget is fully functional - you can interact with it to see the user experience.
                </p>
                <div className="w-full max-w-md rounded-lg border p-4 bg-background">
                  <p className="mb-4">Sample website content:</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
                    Vivamus hendrerit arcu sed erat molestie vehicula.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Community: {tenant?.profile.name}</span>
                    <Button size="sm" variant="secondary">Join Now</Button>
                  </div>
                </div>
              </div>
              
              {/* Widget will be dynamically inserted here by the script */}
            </div>
          </div>
          
          <div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Widget Position</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Widget Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full" onClick={applySettings}>
                  Apply Settings
                </Button>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Preview Instructions</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>1. The widget appears in the position you select</li>
                    <li>2. You can scan the QR code to test the full flow</li>
                    <li>3. Change settings and click "Apply" to see different configurations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;