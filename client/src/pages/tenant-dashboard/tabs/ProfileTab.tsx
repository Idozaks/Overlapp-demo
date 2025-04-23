import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tenant, TenantProfile } from '@shared/schema';
import { RefreshCw, Save, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Form schema for profile
const profileSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  tags: z.array(z.string()).min(1, {
    message: 'Please add at least one interest or tag.',
  }),
});

// Form schema for tenant info
const tenantInfoSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  logoUrl: z.string().url({
    message: 'Please enter a valid URL for your logo.',
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type TenantInfoFormValues = z.infer<typeof tenantInfoSchema>;

interface ProfileTabProps {
  tenant: Tenant;
  profile: TenantProfile | null | undefined;
  isLoading: boolean;
  onSave: (data: { name: string, description?: string, tags: string[] }) => void;
  onTenantInfoUpdate: (data: { name: string, email: string, logoUrl?: string }) => void;
  isSaving: boolean;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  tenant,
  profile,
  isLoading,
  onSave,
  onTenantInfoUpdate,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = React.useState<string>('profile');
  const [newTag, setNewTag] = React.useState<string>('');
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      description: profile?.description || '',
      tags: profile?.tags || [],
    },
  });

  // Tenant info form
  const tenantInfoForm = useForm<TenantInfoFormValues>({
    resolver: zodResolver(tenantInfoSchema),
    defaultValues: {
      name: tenant.name,
      email: tenant.email,
      logoUrl: tenant.logoUrl || '',
    },
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        description: profile.description || '',
        tags: profile.tags,
      });
    }
  }, [profile, profileForm]);

  // Add a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = profileForm.getValues('tags') || [];
    const normalizedNewTag = newTag.trim();
    
    // Check if tag already exists
    if (currentTags.includes(normalizedNewTag)) {
      setNewTag('');
      return;
    }
    
    profileForm.setValue('tags', [...currentTags, normalizedNewTag]);
    setNewTag('');
  };

  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    const currentTags = profileForm.getValues('tags') || [];
    profileForm.setValue(
      'tags',
      currentTags.filter(t => t !== tag)
    );
  };

  // Handle profile form submission
  const handleProfileSubmit = (data: ProfileFormValues) => {
    onSave(data);
  };

  // Handle tenant info form submission
  const handleTenantInfoSubmit = (data: TenantInfoFormValues) => {
    onTenantInfoUpdate(data);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Profile</h1>
          <p className="text-muted-foreground">
            Manage your community profile and tenant information
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Community Profile</TabsTrigger>
          <TabsTrigger value="tenant-info">Tenant Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Edit Community Profile</CardTitle>
              <CardDescription>
                This information will be visible to visitors in the widget.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form 
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)} 
                  className="space-y-6"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Tech Enthusiasts Community" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your community or organization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell visitors about your community or organization..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description that will help visitors understand your community
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Interests & Tags</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {profileForm.watch('tags')?.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {profileForm.watch('tags')?.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                              No tags added yet
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a new interest or tag"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleAddTag}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription>
                          Add interests and tags that represent your community
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tenant-info">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your tenant account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...tenantInfoForm}>
                <form 
                  onSubmit={tenantInfoForm.handleSubmit(handleTenantInfoSubmit)} 
                  className="space-y-6"
                >
                  <FormField
                    control={tenantInfoForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Your organization or company name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={tenantInfoForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address for account notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={tenantInfoForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/logo.png" />
                        </FormControl>
                        <FormDescription>
                          URL to your organization's logo (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Account
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTab;