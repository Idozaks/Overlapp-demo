import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, X, Trash2 } from 'lucide-react';

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

interface SettingsTabProps {
  tenant: TenantWithProfile;
  onUpdate: (updatedTenant: TenantWithProfile) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ tenant, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Initialize settings with defaults if not set
  const [position, setPosition] = useState(
    tenant.settings?.embedOptions?.position || 'bottom-right'
  );
  const [theme, setTheme] = useState(
    tenant.settings?.embedOptions?.theme || 'light'
  );
  const [allowedDomains, setAllowedDomains] = useState<string[]>(
    tenant.settings?.allowedDomains || []
  );
  const [newDomain, setNewDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl || '');

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    
    // Simple domain validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(newDomain.trim())) {
      toast({
        title: 'Invalid domain',
        description: 'Please enter a valid domain (e.g., example.com)',
        variant: 'destructive',
      });
      return;
    }
    
    // Check for duplicates
    if (allowedDomains.includes(newDomain.trim())) {
      toast({
        title: 'Duplicate domain',
        description: 'This domain has already been added',
        variant: 'destructive',
      });
      return;
    }
    
    setAllowedDomains([...allowedDomains, newDomain.trim()]);
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter(d => d !== domain));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDomain();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update widget settings
      const settingsResponse = await axios.put(`/api/widget/tenant/${tenant.tenantId}/settings`, {
        settings: {
          allowedDomains,
          embedOptions: {
            position,
            theme,
          },
        },
      });
      
      // Create updated tenant object with new settings
      const updatedTenant = {
        ...tenant,
        logoUrl,
        settings: {
          allowedDomains,
          embedOptions: {
            position,
            theme,
          },
        },
      };
      
      // Update in local storage
      localStorage.setItem('overlapp_tenant', JSON.stringify(updatedTenant));
      
      // Update parent state
      onUpdate(updatedTenant);
      
      toast({
        title: 'Settings updated',
        description: 'Your widget settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Widget Settings</CardTitle>
          <CardDescription>
            Customize how your widget appears and functions on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-sm text-muted-foreground">
                URL to your logo image that will be displayed in the widget
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Widget Position</Label>
              <Select
                value={position}
                onValueChange={setPosition}
              >
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
              <p className="text-sm text-muted-foreground">
                Where the widget will appear on your website
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme">Widget Theme</Label>
              <Select
                value={theme}
                onValueChange={setTheme}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Color theme for the widget
              </p>
            </div>
            
            <div className="space-y-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="domains">Allowed Domains</Label>
                <div className="flex gap-2">
                  <Input
                    id="domains"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="example.com"
                  />
                  <Button type="button" onClick={handleAddDomain} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Domains where the widget is allowed to be embedded (leave empty to allow all domains)
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {allowedDomains.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No domains restricted (widget can be embedded anywhere)</div>
                ) : (
                  allowedDomains.map((domain, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                      {domain}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveDomain(domain)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;