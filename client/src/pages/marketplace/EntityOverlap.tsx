import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface EntityOverlapData {
  analysis: string;
  relevantInterests: string[];
  suggestedActivities: string[];
  overlapScore: number;
}

export default function EntityOverlap() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [, params] = useRoute('/marketplace/entity/:id/overlap');
  const entityId = params?.id ? parseInt(params.id) : 0;
  const { user: currentUser } = useAuth();

  // Query to fetch the entity details for the breadcrumb
  const { data: entityData, isLoading: loadingEntity } = useQuery({
    queryKey: [`/api/marketplace/entities/${entityId}`],
    enabled: !!entityId,
  });

  // Query to fetch the overlap analysis
  const { data: overlapData, isLoading: loadingOverlap, error: overlapError, refetch } = useQuery<EntityOverlapData>({
    queryKey: [`/api/marketplace/entities/${entityId}/overlap`],
    enabled: !!entityId && !!currentUser?.id,
    queryFn: async () => {
      console.log("Fetching overlap data for entity ID:", entityId);
      
      // First check if entity exists
      const entityCheckResponse = await fetch(`/api/marketplace/entities/${entityId}`);
      if (!entityCheckResponse.ok) {
        throw new Error(`Entity with ID ${entityId} not found`);
      }
      
      // Then fetch overlap data
      const response = await fetch(`/api/marketplace/entities/${entityId}/overlap`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Entity Overlap API error:", errorText);
        throw new Error('Failed to fetch entity overlap data: ' + errorText);
      }
      return response.json();
    }
  });

  // Function to regenerate analysis
  const regenerateAnalysis = async () => {
    setIsGenerating(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error regenerating analysis:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingEntity || loadingOverlap) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Analyzing your compatibility with this entity...</p>
        </div>
      </div>
    );
  }

  if (overlapError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Analysis Error</h1>
          <p className="mb-6 text-red-500">
            {overlapError instanceof Error ? overlapError.message : "Failed to load the overlap analysis"}
          </p>
          <Link href={`/marketplace/entity/${entityId}`}>
            <Button className="mr-2">Back to Entity</Button>
          </Link>
          <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const entity = entityData?.entity;
  
  if (!entity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Entity Not Found</h1>
          <p className="mb-6">The entity you are looking for doesn't exist or may have been removed.</p>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href={`/marketplace/entity/${entityId}`}>
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to {entity.name}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Compatibility Analysis</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={regenerateAnalysis}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Regenerating...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Regenerate Analysis</span>
            </>
          )}
        </Button>
      </div>
      
      {overlapData && (
        <>
          {/* Overlap Score Card with Visual Indicator */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                Compatibility Score 
                <Badge className="text-xl px-4 py-2">
                  {Math.round(overlapData.overlapScore * 100)}%
                </Badge>
              </CardTitle>
              
              {/* Visual Overlap Indicator */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <Progress 
                  value={Math.round(overlapData.overlapScore * 100)} 
                  className={`h-3 ${
                    overlapData.overlapScore > 0.7 
                      ? "bg-green-500/20" 
                      : overlapData.overlapScore > 0.4 
                        ? "bg-yellow-500/20" 
                        : "bg-orange-500/20"
                  }`}
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Quick Insights & Highlights */}
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <span className="text-xl mr-2">✨</span> Quick Insights
                  </h3>
                  <p className="text-sm text-muted-foreground italic mb-3">
                    {overlapData.relevantInterests.length > 0 
                      ? `You have ${overlapData.relevantInterests.length} interests that match with ${entity.name}, including ${overlapData.relevantInterests.slice(0, 2).join(' and ')}${overlapData.relevantInterests.length > 2 ? '...' : '!'}`
                      : "You have different interests than what this entity offers, which creates an opportunity to explore something new!"}
                  </p>
                  
                  {/* Compatibility Rating */}
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      {overlapData.overlapScore > 0.7 ? 'Perfect Match' : overlapData.overlapScore > 0.4 ? 'Good Match' : 'Exploration Opportunity'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Analysis Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  {overlapData.analysis.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Relevant Interests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Relevant Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {overlapData.relevantInterests.length > 0 ? (
                      overlapData.relevantInterests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No directly matching interests found. This could be an opportunity to explore something new!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Suggested Activities */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Suggested Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {overlapData.suggestedActivities.map((activity, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-sm">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Entity Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">About {entity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm text-muted-foreground">{entity.category}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">
                        {entity.entityType === 'PHYSICAL' ? 'Physical Location' : 'Digital Entity'}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{entity.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}