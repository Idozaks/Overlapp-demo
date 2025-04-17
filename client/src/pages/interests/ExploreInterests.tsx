import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookMarked, Filter, Search, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Interest = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
};

const ExploreInterests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch all interests
  const { data: interestsData, isLoading: isLoadingInterests } = useQuery<{interests: Interest[]}>({
    queryKey: ['/api/interests'],
  });

  // Fetch categories for filtering
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<{categories: string[]}>({
    queryKey: ['/api/interests/categories'],
  });

  const interests = interestsData?.interests || [];
  const categories = categoriesData?.categories || [];

  // Filter interests based on search term and category
  const filteredInterests = interests.filter((interest: Interest) => {
    const matchesSearch = interest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interest.description && interest.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || interest.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Interests</h1>
          <p className="text-muted-foreground">
            Discover new interests and connect with like-minded people
          </p>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center relative">
          <Input
            type="text"
            placeholder="Search interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
          <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
        </div>
        
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="flex items-center gap-2" onClick={() => {
          setSearchTerm('');
          setCategoryFilter('');
        }}>
          <Filter className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {/* Display interests grid */}
      {isLoadingInterests ? (
        // Loading skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredInterests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredInterests.map((interest: Interest) => (
            <Card key={interest.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {interest.iconUrl ? (
                    <img
                      src={interest.iconUrl}
                      alt={interest.name}
                      className="w-6 h-6"
                    />
                  ) : (
                    <BookMarked className="w-5 h-5 text-primary" />
                  )}
                  <CardTitle className="text-lg">{interest.name}</CardTitle>
                </div>
                <CardDescription className="text-xs uppercase tracking-wide">
                  {interest.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-3">
                  {interest.description || `Explore more about ${interest.name}`}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/interests/${interest.id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No interests found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExploreInterests;