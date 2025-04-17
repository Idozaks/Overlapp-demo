import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  BookmarkIcon,
  Filter,
  Search,
  Tag,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIButton } from '@/components/ui/ai-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Interest = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  iconUrl: string | null;
};

const ExploreInterests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tabValue, setTabValue] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch all interests
  const { data: interestsData, isLoading } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests'],
  });
  
  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: string[] }>({
    queryKey: ['/api/interests/categories'],
  });
  
  // Update categories when data is loaded
  useEffect(() => {
    if (categoriesData?.categories) {
      setCategories(['all', ...categoriesData.categories]);
    }
  }, [categoriesData]);
  
  const interests = interestsData?.interests || [];
  
  // Filter interests based on search query and category
  const filteredInterests = interests.filter((interest: Interest) => {
    const matchesSearch = interest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interest.description && interest.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || interest.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group interests by category
  const interestsByCategory = filteredInterests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setTabValue(value);
    if (value !== 'all') {
      setCategoryFilter(value);
    } else {
      setCategoryFilter('all');
    }
  };
  
  // Uncomment if you want to use tabs instead of dropdown
  // useEffect(() => {
  //   if (categoriesData?.categories && categoriesData.categories.length > 0) {
  //     if (!categoriesData.categories.includes(tabValue) && tabValue !== 'all') {
  //       setTabValue('all');
  //     }
  //   }
  // }, [categoriesData, tabValue]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookmarkIcon className="h-8 w-8 text-primary" />
          Explore Interests
        </h1>
        <p className="text-muted-foreground">
          Discover and join interests that match your passions and connect with like-minded people.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interests..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="h-[220px] flex flex-col">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : categoryFilter === 'all' ? (
        // View all interests grouped by category
        <div className="space-y-8">
          {Object.entries(interestsByCategory).map(([category, interests]) => (
            <div key={category}>
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold">{category}</h2>
                <Badge variant="outline" className="ml-3">
                  {interests.length} {interests.length === 1 ? 'interest' : 'interests'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {interests.map((interest) => (
                  <InterestCard key={interest.id} interest={interest} />
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(interestsByCategory).length === 0 && (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No interests found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Category-specific view
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredInterests.map((interest) => (
            <InterestCard key={interest.id} interest={interest} />
          ))}
          
          {filteredInterests.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No interests found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Interest card component
const InterestCard = ({ interest }: { interest: Interest }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {interest.iconUrl ? (
            <img
              src={interest.iconUrl}
              alt={interest.name}
              className="w-5 h-5"
            />
          ) : (
            <BookmarkIcon className="w-5 h-5 text-primary" />
          )}
          <CardTitle className="text-lg">{interest.name}</CardTitle>
        </div>
        <CardDescription>
          <Badge variant="outline" className="mt-1">
            {interest.category}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {interest.description || `Explore the world of ${interest.name} and connect with others who share your passion.`}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/interests/${interest.id}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ExploreInterests;