import React, { useState } from 'react';
import { Tenant } from '@shared/schema';
import { RefreshCw, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsTabProps {
  tenant: Tenant;
  onSave: (settings: any) => void;
  isSaving: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ tenant, onSave, isSaving }) => {
  const [activeTab, setActiveTab] = useState<string>('appearance');
  
  // Initialize settings from tenant or with defaults
  const [settings, setSettings] = useState({
    appearance: {
      theme: tenant.settings?.appearance?.theme || 'light',
      position: tenant.settings?.appearance?.position || 'bottom-right',
      customColors: tenant.settings?.appearance?.customColors || false,
      primaryColor: tenant.settings?.appearance?.primaryColor || '#3b82f6',
      borderRadius: tenant.settings?.appearance?.borderRadius || 8,
    },
    behavior: {
      autoOpen: tenant.settings?.behavior?.autoOpen || false,
      autoOpenDelay: tenant.settings?.behavior?.autoOpenDelay || 5,
      showOnMobile: tenant.settings?.behavior?.showOnMobile || true,
      persistOverlap: tenant.settings?.behavior?.persistOverlap || true,
      allowAnonymous: tenant.settings?.behavior?.allowAnonymous || true,
    },
    advanced: {
      enableAnalytics: tenant.settings?.advanced?.enableAnalytics || true,
      domainRestriction: tenant.settings?.advanced?.domainRestriction || false,
      allowedDomains: tenant.settings?.advanced?.allowedDomains || [],
      chatEnabled: tenant.settings?.advanced?.chatEnabled || true,
    },
  });

  // Update a specific setting
  const updateSetting = (category: keyof typeof settings, name: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: value,
      },
    }));
  };

  // Save all settings
  const handleSaveSettings = () => {
    onSave(settings);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Widget Settings</h1>
          <p className="text-muted-foreground">
            Customize how your widget looks and behaves
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Appearance</CardTitle>
                <CardDescription>
                  Customize how your widget looks on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup
                    value={settings.appearance.theme}
                    onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system">Match System</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Widget Position</Label>
                  <Select
                    value={settings.appearance.position}
                    onValueChange={(value) => updateSetting('appearance', 'position', value)}
                  >
                    <SelectTrigger>
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
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-colors">Use Custom Colors</Label>
                  <Switch
                    id="custom-colors"
                    checked={settings.appearance.customColors}
                    onCheckedChange={(checked) => updateSetting('appearance', 'customColors', checked)}
                  />
                </div>
                
                {settings.appearance.customColors && (
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="primary-color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">
                        {settings.appearance.primaryColor}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="border-radius">Border Radius</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.appearance.borderRadius}px
                    </span>
                  </div>
                  <Slider
                    id="border-radius"
                    min={0}
                    max={20}
                    step={1}
                    value={[settings.appearance.borderRadius]}
                    onValueChange={(values) => updateSetting('appearance', 'borderRadius', values[0])}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  These settings affect the visual appearance of your widget
                </p>
              </CardFooter>
            </Card>
            
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Widget Preview</h3>
              <div className="bg-card border rounded-lg h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Preview functionality will be available soon</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Behavior Settings */}
        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>Widget Behavior</CardTitle>
              <CardDescription>
                Configure how the widget behaves on your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-open" className="mb-1 block">Auto-Open Widget</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically open the widget after a delay
                  </p>
                </div>
                <Switch
                  id="auto-open"
                  checked={settings.behavior.autoOpen}
                  onCheckedChange={(checked) => updateSetting('behavior', 'autoOpen', checked)}
                />
              </div>
              
              {settings.behavior.autoOpen && (
                <div className="space-y-2 pl-6 border-l-2 border-muted">
                  <div className="flex justify-between">
                    <Label htmlFor="auto-open-delay">Auto-Open Delay (seconds)</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.behavior.autoOpenDelay}s
                    </span>
                  </div>
                  <Slider
                    id="auto-open-delay"
                    min={1}
                    max={30}
                    step={1}
                    value={[settings.behavior.autoOpenDelay]}
                    onValueChange={(values) => updateSetting('behavior', 'autoOpenDelay', values[0])}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-on-mobile" className="mb-1 block">Show on Mobile</Label>
                  <p className="text-sm text-muted-foreground">
                    Display the widget on mobile devices
                  </p>
                </div>
                <Switch
                  id="show-on-mobile"
                  checked={settings.behavior.showOnMobile}
                  onCheckedChange={(checked) => updateSetting('behavior', 'showOnMobile', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="persist-overlap" className="mb-1 block">Persist Overlap Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Remember overlap results between visits
                  </p>
                </div>
                <Switch
                  id="persist-overlap"
                  checked={settings.behavior.persistOverlap}
                  onCheckedChange={(checked) => updateSetting('behavior', 'persistOverlap', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-anonymous" className="mb-1 block">Allow Anonymous Overlap</Label>
                  <p className="text-sm text-muted-foreground">
                    Let visitors see overlap without creating an account
                  </p>
                </div>
                <Switch
                  id="allow-anonymous"
                  checked={settings.behavior.allowAnonymous}
                  onCheckedChange={(checked) => updateSetting('behavior', 'allowAnonymous', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                These settings control how the widget interacts with visitors
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced widget settings and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-analytics" className="mb-1 block">Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect anonymous usage data to improve your widget
                  </p>
                </div>
                <Switch
                  id="enable-analytics"
                  checked={settings.advanced.enableAnalytics}
                  onCheckedChange={(checked) => updateSetting('advanced', 'enableAnalytics', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="chat-enabled" className="mb-1 block">Enable Chat Functionality</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow visitors to initiate chats after overlap
                  </p>
                </div>
                <Switch
                  id="chat-enabled"
                  checked={settings.advanced.chatEnabled}
                  onCheckedChange={(checked) => updateSetting('advanced', 'chatEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="domain-restriction" className="mb-1 block">Domain Restriction</Label>
                  <p className="text-sm text-muted-foreground">
                    Only allow widget to work on specific domains
                  </p>
                </div>
                <Switch
                  id="domain-restriction"
                  checked={settings.advanced.domainRestriction}
                  onCheckedChange={(checked) => updateSetting('advanced', 'domainRestriction', checked)}
                />
              </div>
              
              {settings.advanced.domainRestriction && (
                <div className="space-y-2 pl-6 border-l-2 border-muted">
                  <Label>Allowed Domains</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter domains where the widget is allowed (one per line)
                  </p>
                  <textarea
                    className="w-full min-h-[100px] p-2 text-sm rounded-md border bg-background"
                    placeholder="example.com&#10;subdomain.example.com"
                    value={settings.advanced.allowedDomains.join('\n')}
                    onChange={(e) => updateSetting('advanced', 'allowedDomains', e.target.value.split('\n').filter(d => d.trim()))}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                These settings provide additional control over widget functionality
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTab;