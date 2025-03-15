import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Smile, 
  Search, 
  SortAsc, 
  SortDesc, 
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Interest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InterestManager() {
  const [newInterest, setNewInterest] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "category">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interests, isLoading } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests'],
    queryFn: async () => {
      const response = await apiRequest('/api/interests');
      return response.json();
    }
  });
  
  const generateEmojisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/interests/generate-emojis', {
        method: 'POST'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate emojis for interests');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/interests'] });
      toast({
        title: "Success",
        description: data.message || `Successfully updated interests with matching emojis`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addInterestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/interests', {
        method: 'POST',
        body: JSON.stringify({
          name: newInterest,
          category: newCategory,
          isAiGenerated: false
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add interest');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interests'] });
      setNewInterest("");
      setNewCategory("");
      toast({
        title: "Success",
        description: "Interest added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteInterestMutation = useMutation({
    mutationFn: async (interestId: number) => {
      const response = await apiRequest(`/api/interests/${interestId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete interest');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interests'] });
      toast({
        title: "Success",
        description: "Interest deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const categorizeAllInterestsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/interests/categorize-all', {
        method: 'POST'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to categorize interests');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/interests'] });
      toast({
        title: "Success",
        description: data.message || `${data.totalProcessed} interests categorized successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get unique categories for the filter dropdown
  const uniqueCategories = useMemo(() => {
    if (!interests?.interests) return [];
    const categories = interests.interests.map(interest => interest.category);
    return ["All Categories", ...Array.from(new Set(categories))];
  }, [interests?.interests]);

  // Filter and sort interests
  const filteredAndSortedInterests = useMemo(() => {
    if (!interests?.interests) return [];
    
    // Start with all interests
    let filtered = [...interests.interests];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(interest => 
        interest.name.toLowerCase().includes(query) || 
        interest.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== "All Categories") {
      filtered = filtered.filter(interest => interest.category === categoryFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const fieldA = sortField === "name" ? a.name.toLowerCase() : a.category.toLowerCase();
      const fieldB = sortField === "name" ? b.name.toLowerCase() : b.category.toLowerCase();
      
      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
    
    return filtered;
  }, [interests?.interests, searchQuery, categoryFilter, sortField, sortDirection]);

  // Toggle sort direction
  const toggleSort = (field: "name" | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Interest Name</label>
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Enter new interest"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => addInterestMutation.mutate()}
                disabled={!newInterest || !newCategory || addInterestMutation.isPending}
                className="w-full"
              >
                {addInterestMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Interest
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => categorizeAllInterestsMutation.mutate()}
                  disabled={categorizeAllInterestsMutation.isPending}
                  className="w-full"
                  variant="secondary"
                >
                  {categorizeAllInterestsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Categorize All with AI
                </Button>
                
                <Button
                  onClick={() => generateEmojisMutation.mutate()}
                  disabled={generateEmojisMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {generateEmojisMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Smile className="w-4 h-4 mr-2" />
                  )}
                  Generate Matching Emojis
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Interests</h3>
                <div className="text-sm text-gray-500">
                  {filteredAndSortedInterests.length} of {interests?.interests.length} interests
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search interests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="w-full md:w-48">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Sort Controls */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Sort by:</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex items-center gap-1 ${sortField === "name" ? "bg-muted" : ""}`}
                  onClick={() => toggleSort("name")}
                >
                  Name
                  {sortField === "name" && (
                    sortDirection === "asc" ? 
                      <SortAsc className="h-4 w-4" /> : 
                      <SortDesc className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex items-center gap-1 ${sortField === "category" ? "bg-muted" : ""}`}
                  onClick={() => toggleSort("category")}
                >
                  Category
                  {sortField === "category" && (
                    sortDirection === "asc" ? 
                      <SortAsc className="h-4 w-4" /> : 
                      <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedInterests.map((interest) => (
                  <div
                    key={interest.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {interest.iconUrl && <span className="mr-2">{interest.iconUrl}</span>}
                        {interest.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{interest.category}</Badge>
                        {interest.isAiGenerated && (
                          <Badge variant="outline" className="border-blue-400 text-blue-500">AI Generated</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteInterestMutation.mutate(interest.id)}
                      disabled={deleteInterestMutation.isPending}
                    >
                      {deleteInterestMutation.isPending && deleteInterestMutation.variables === interest.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}