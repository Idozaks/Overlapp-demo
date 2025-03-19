import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Calendar, 
  Share2,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

// Define types for our entities data
interface EntityContent {
  id: number;
  entityId: number;
  contentType: string;
  content: string;
  createdAt: string;
}

interface Entity {
  id: number;
  name: string;
  category: string;
  description: string;
  type: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  content?: EntityContent[];
}

export default function EntityDetail() {
  const [, params] = useRoute('/marketplace/entity/:id');
  const entityId = params?.id ? parseInt(params.id) : 0;

  const { data, isLoading } = useQuery({
    queryKey: [`/api/marketplace/entities/${entityId}`],
    enabled: !!entityId,
  });

  const entity: Entity | undefined = data?.entity;

  // Group content by type for easier rendering
  const groupedContent = React.useMemo(() => {
    if (!entity?.content) return {};
    
    return entity.content.reduce((acc, item) => {
      if (!acc[item.contentType]) {
        acc[item.contentType] = [];
      }
      acc[item.contentType].push(item);
      return acc;
    }, {} as Record<string, EntityContent[]>);
  }, [entity]);

  // Function to render formatted date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="w-8 h-8 mr-2" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-64 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-10 w-40 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div>
            <Skeleton className="h-60 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Entity Not Found</h1>
        <p className="mb-6">The entity you are looking for doesn't exist or may have been removed.</p>
        <Link href="/marketplace">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{entity.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Heart size={16} />
            <span>Save</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 size={16} />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="secondary">{entity.category}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {entity.type === 'physical' ? (
                  <MapPin size={14} />
                ) : (
                  <Globe size={14} />
                )}
                {entity.type === 'physical' ? 'Physical Location' : 'Digital Entity'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(entity.createdAt)}
              </Badge>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-muted-foreground mb-4">{entity.description}</p>
            
            {entity.latitude && entity.longitude && (
              <div className="rounded-lg border overflow-hidden h-64 bg-muted flex items-center justify-center mb-4">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Location: {entity.latitude.toFixed(6)}, {entity.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Content</h2>
            
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Content</TabsTrigger>
                {Object.keys(groupedContent).map(contentType => (
                  <TabsTrigger key={contentType} value={contentType}>
                    {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {entity.content?.map(item => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between mb-2">
                          <Badge variant="outline">
                            {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                        <p>{item.content}</p>
                      </CardContent>
                    </Card>
                  ))}

                  {!entity.content?.length && (
                    <p className="text-muted-foreground text-center py-4">
                      No content available for this entity.
                    </p>
                  )}
                </div>
              </TabsContent>
              
              {Object.entries(groupedContent).map(([contentType, items]) => (
                <TabsContent key={contentType} value={contentType}>
                  <div className="space-y-4">
                    {items.map(item => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          <p>{item.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        
        <div>
          <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Related Entities</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Other entities in the {entity.category} category
            </p>
            
            <div className="space-y-3">
              {/* This would be populated with actual related entities in a real implementation */}
              <div className="p-3 rounded-md border hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Sample Related Entity</h3>
                    <p className="text-xs text-muted-foreground">
                      {entity.category}
                    </p>
                  </div>
                  {entity.type === 'physical' ? (
                    <MapPin size={16} className="text-muted-foreground" />
                  ) : (
                    <Globe size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground py-2">
                No related entities available.
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3">Entity Information</h2>
            <Separator className="my-3" />
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">
                  {entity.type === 'physical' ? 'Physical Location' : 'Digital Entity'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground">{entity.category}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Added On</p>
                <p className="text-sm text-muted-foreground">{formatDate(entity.createdAt)}</p>
              </div>
              
              {entity.latitude && entity.longitude && (
                <div>
                  <p className="text-sm font-medium">Coordinates</p>
                  <p className="text-sm text-muted-foreground">
                    {entity.latitude.toFixed(6)}, {entity.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}