import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Filter, MapPin, Globe, ShoppingBag } from 'lucide-react';
import EntityCard from '@/components/marketplace/EntityCard';
import CategoryNavigation from '@/components/marketplace/CategoryNavigation';

// Define types for our entities data
interface EntityContent {
  id: number;
  entityId: number;
  title: string;
  description: string;
  url?: string;
  thumbnailUrl?: string;
  type: string;
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

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['/api/marketplace/categories'],
  });

  // Fetch entities based on selected category
  const { data: entitiesData, isLoading: loadingEntities } = useQuery({
    queryKey: ['/api/marketplace/entities', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === 'all' 
        ? '/api/marketplace/entities'
        : `/api/marketplace/entities?category=${encodeURIComponent(selectedCategory)}`;
      return fetch(url).then(res => res.json());
    },
  });

  // Filter entities based on search query
  const filteredEntities = entitiesData?.entities?.filter((entity: Entity) => {
    if (!searchQuery) return true;
    return (
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleEntityClick = (entityId: number) => {
    setLocation(`/marketplace/entity/${entityId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover digital and physical locations across different categories
          </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search entities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Categories sidebar */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <h3 className="font-medium mb-4">Categories</h3>
            
            {loadingCategories ? (
              <div className="space-y-2">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <CategoryNavigation 
                categories={categoriesData?.categories || []}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryChange}
              />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-12 md:col-span-9">
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Globe size={16} />
                All Entities
              </TabsTrigger>
              <TabsTrigger value="physical" className="flex items-center gap-2">
                <MapPin size={16} />
                Physical
              </TabsTrigger>
              <TabsTrigger value="digital" className="flex items-center gap-2">
                <ShoppingBag size={16} />
                Digital
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredEntities ? `${filteredEntities.length} entities found` : 'Loading entities...'}
            </p>
          </div>

          {loadingEntities ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntities?.map((entity: Entity) => (
                <EntityCard 
                  key={entity.id} 
                  entity={entity} 
                  onClick={() => handleEntityClick(entity.id)}
                />
              ))}
              
              {filteredEntities?.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No entities found for the selected category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}