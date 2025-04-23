import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Save } from 'lucide-react';

interface TenantProfile {
  id: number;
  name: string;
  description?: string;
  tags: string[];
}

interface TenantWithProfile {
  id: number;
  tenantId: string;
  name: string;
  email: string;
  logoUrl?: string;
  profile: TenantProfile;
  settings?: {
    allowedDomains?: string[];
    customCss?: string;
    embedOptions?: {
      position?: string;
      theme?: string;
    };
  };
}

interface ProfileTabProps {
  tenant: TenantWithProfile;
  onUpdate: (updatedTenant: TenantWithProfile) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ tenant, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState(tenant.profile.name || tenant.name);
  const [description, setDescription] = useState(tenant.profile.description || '');
  const [tags, setTags] = useState<string[]>(tenant.profile.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    // Don't add duplicate tags
    if (tags.includes(newTag.trim())) {
      toast({
        title: 'Duplicate tag',
        description: 'This tag has already been added',
        variant: 'destructive',
      });
      return;
    }
    
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.put(`/api/widget/tenant/${tenant.tenantId}/profile`, {
        name: profileName,
        description,
        tags,
      });
      
      // Create updated tenant object
      const updatedTenant = {
        ...tenant,
        profile: {
          ...tenant.profile,
          name: profileName,
          description,
          tags,
        },
      };
      
      // Update in local storage
      localStorage.setItem('overlapp_tenant', JSON.stringify(updatedTenant));
      
      // Update parent state
      onUpdate(updatedTenant);
      
      toast({
        title: 'Profile updated',
        description: 'Your community profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
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
          <CardTitle>Community Profile</CardTitle>
          <CardDescription>
            Define your community profile to help users understand how they align with your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter community name"
                required
              />
              <p className="text-sm text-muted-foreground">
                This name will be displayed to users in the widget
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description of your community"
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Briefly describe your community to help users understand its purpose
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Community Interests & Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add an interest or tag"
                  />
                  <Button type="button" onClick={handleAddTag} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add interests, topics, or tags that represent your community. These will be used to calculate overlap with users.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No tags added yet</div>
                ) : (
                  tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
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
                  Save Changes
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;