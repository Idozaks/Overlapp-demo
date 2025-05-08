import { FC, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SearchIcon, 
  MapPinIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  StarIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  SparklesIcon,
  Loader2,
  MessageCircleIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Store = {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  distance?: number;
  tags: string[];
  openHours?: string;
  rating?: number;
  imageUrl?: string;
  overlapScore?: number;
}

// Connection analysis result type
interface StoreAnalysis {
  overlapScore: number;
  analysisReasoning: string;
  matchingInterests: Array<string | { interest: string; explanation?: string }>;
  recommendations: string[];
  bestTimesToVisit: string[];
}

const StorePage: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [radius, setRadius] = useState<number>(5);
  const [location, setLocation] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [storeAnalysis, setStoreAnalysis] = useState<StoreAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();
  
  // Mock data for current user interests
  const currentUserInterests = ["Shopping", "Fashion", "Technology", "Books", "Coffee", "Organic Food"];

  // Get stores
  const { data: storesData, isLoading, refetch } = useQuery<{stores: Store[]}>({
    queryKey: userLocation 
      ? [`/api/stores/nearby/${radius}`, `?lat=${userLocation.lat}&lng=${userLocation.lng}&q=${searchQuery}`]
      : ['/api/stores/nearby', radius, searchQuery],
    enabled: !!userLocation,
  });
  
  // Mutation for store analysis
  const analyzeStore = useMutation({
    mutationFn: async (store: Store) => {
      try {
        console.log("Sending store analysis request for:", store.name);
        
        const response = await apiRequest('/api/stores/analyze', {
          method: 'POST',
          body: {
            storeId: store.id,
            userInterests: currentUserInterests
          }
        });
        
        console.log("Store analysis response:", response);
        return response as unknown as StoreAnalysis;
      } catch (error) {
        console.error("Store analysis error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setStoreAnalysis(data);
      setAnalysisOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Store analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze store overlap",
        variant: "destructive"
      });
    }
  });

  // Simulate getting current location
  useEffect(() => {
    const getUserLocation = () => {
      // For demo purposes, simulate a location (New York City coordinates)
      const demoLocation = { lat: 40.7128, lng: -74.0060 };
      setUserLocation(demoLocation);
      setLocation("New York City");
    };
    
    getUserLocation();
  }, []);

  // Simulated store data
  const mockStores: Store[] = [
    {
      id: 1,
      name: "Book Haven",
      category: "Bookstore",
      description: "An independent bookstore offering a curated selection of fiction, non-fiction, and specialty books.",
      address: "123 Reading St, New York, NY",
      distance: 0.7,
      tags: ["Books", "Reading", "Literature", "Coffee"],
      openHours: "9:00 AM - 9:00 PM",
      rating: 4.8,
      overlapScore: 75
    },
    {
      id: 2,
      name: "Tech Universe",
      category: "Electronics",
      description: "The latest gadgets, computers, and tech accessories with expert staff to help you find what you need.",
      address: "456 Digital Ave, New York, NY",
      distance: 1.2,
      tags: ["Technology", "Electronics", "Gadgets", "Computers"],
      openHours: "10:00 AM - 8:00 PM",
      rating: 4.5,
      overlapScore: 82
    },
    {
      id: 3,
      name: "Green Earth Market",
      category: "Grocery",
      description: "Organic produce, sustainable goods, and locally-sourced foods committed to environmental responsibility.",
      address: "789 Eco Blvd, New York, NY",
      distance: 0.9,
      tags: ["Organic", "Sustainable", "Local", "Food"],
      openHours: "8:00 AM - 10:00 PM",
      rating: 4.6,
      overlapScore: 68
    },
    {
      id: 4,
      name: "Fashion Forward",
      category: "Clothing",
      description: "Trendy and fashionable clothing for all styles, sizes, and occasions with seasonal collections.",
      address: "101 Style St, New York, NY",
      distance: 1.5,
      tags: ["Fashion", "Clothing", "Accessories", "Style"],
      openHours: "10:00 AM - 9:00 PM",
      rating: 4.3,
      overlapScore: 79
    },
    {
      id: 5,
      name: "The Coffee Lab",
      category: "Café",
      description: "Specialty coffee shop featuring single-origin beans, handcrafted beverages, and fresh pastries.",
      address: "202 Brew Lane, New York, NY",
      distance: 0.4,
      tags: ["Coffee", "Café", "Pastries", "Relaxation"],
      openHours: "6:00 AM - 7:00 PM",
      rating: 4.9,
      overlapScore: 88
    }
  ];

  // Filter stores based on active tab
  const filterStores = (stores: Store[], tab: string, query: string) => {
    let filtered = [...stores];
    
    // Apply search query filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(lowerQuery) || 
        store.category.toLowerCase().includes(lowerQuery) ||
        store.description.toLowerCase().includes(lowerQuery) ||
        store.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Apply category filter
    if (tab !== "all") {
      filtered = filtered.filter(store => store.category.toLowerCase() === tab.toLowerCase());
    }
    
    return filtered;
  };

  // For demo purposes, use mock data
  const displayedStores = filterStores(storesData?.stores || mockStores, activeTab, searchQuery);

  // Extract unique categories from stores
  const categories = [...new Set([
    "all", 
    ...(storesData?.stores || mockStores).map(store => store.category.toLowerCase())
  ])];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Find Stores Near You</h1>
        <p className="text-muted-foreground mb-6">
          Discover stores and businesses that match your interests
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
              <MapPinIcon className="w-5 h-5 text-primary" />
              <span>{location || "Detecting location..."}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Radius:</span>
            <Input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value) || 1)}
              className="w-20"
              min={1}
              max={50}
            />
            <span className="text-sm">miles</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or tag"
              className="pl-10"
            />
          </div>
          <Button type="submit">
            Search
          </Button>
        </form>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="overflow-x-auto flex w-full max-w-full">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize"
              >
                {category === "all" ? "All Categories" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="w-full h-40" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Skeleton className="h-5 w-36 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayedStores.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No stores found</h3>
          <p className="text-muted-foreground mb-4">
            Try changing your search criteria or increasing your radius.
          </p>
          <Button onClick={() => {
            setSearchQuery("");
            setActiveTab("all");
          }}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedStores.map((store) => (
            <Card key={store.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {store.imageUrl ? (
                  <div className="h-40 w-full bg-muted overflow-hidden">
                    <img 
                      src={store.imageUrl} 
                      alt={store.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-muted flex items-center justify-center">
                    <ShoppingBagIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{store.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TagIcon className="w-3 h-3 mr-1" />
                        <span>{store.category}</span>
                        
                        {store.rating && (
                          <>
                            <span className="mx-1">•</span>
                            <StarIcon className="w-3 h-3 text-yellow-500 mr-1" />
                            <span>{store.rating}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {store.distance} mi
                    </Badge>
                  </div>
                  
                  <p className="text-sm mb-4 line-clamp-2">{store.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MapPinIcon className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </div>
                    
                    {store.openHours && (
                      <div className="flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{store.openHours}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {store.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Overlap with Your Interests</span>
                      <div className="flex items-center mt-1">
                        <Progress value={store.overlapScore} className="h-1.5 w-32 mr-2" />
                        <span className="text-xs font-semibold">{store.overlapScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedStore(store);
                        analyzeStore.mutate(store);
                      }}
                      disabled={analyzeStore.isPending && selectedStore?.id === store.id}
                    >
                      {analyzeStore.isPending && selectedStore?.id === store.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing</>
                      ) : (
                        <><SparklesIcon className="w-4 h-4 mr-2" /> Analyze Fit</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Store Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              Store Analysis
            </DialogTitle>
            <DialogDescription>
              {selectedStore && (
                <span>How {selectedStore.name} matches your interests</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {storeAnalysis && (
            <div className="space-y-4 my-2 overflow-y-auto pr-2 flex-grow">
              {/* Overlap Score */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Match Score</span>
                  <Badge 
                    className={
                      (storeAnalysis.overlapScore || 0) >= 80 
                        ? "bg-green-500" 
                        : (storeAnalysis.overlapScore || 0) >= 60 
                        ? "bg-amber-500" 
                        : "bg-red-500"
                    }
                  >
                    {storeAnalysis.overlapScore || 0}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {storeAnalysis.analysisReasoning || "Analysis in progress. Try again in a moment."}
                </p>
              </div>
              
              {/* Matching Interests */}
              {storeAnalysis.matchingInterests && storeAnalysis.matchingInterests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Matching Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {storeAnalysis.matchingInterests.map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {typeof interest === 'object' && interest !== null && 'interest' in interest 
                          ? (interest as { interest: string }).interest 
                          : typeof interest === 'string' 
                            ? interest
                            : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              {storeAnalysis.recommendations && storeAnalysis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                  <ul className="space-y-2">
                    {storeAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <MessageCircleIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Best Times to Visit */}
              {storeAnalysis.bestTimesToVisit && storeAnalysis.bestTimesToVisit.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Best Times to Visit</h3>
                  <ul className="space-y-1">
                    {storeAnalysis.bestTimesToVisit.map((time, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex-shrink-0 mt-2 pt-2 border-t">
            <Button className="w-full" onClick={() => setAnalysisOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorePage;