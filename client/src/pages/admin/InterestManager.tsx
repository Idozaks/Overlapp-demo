import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Interest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

const CATEGORY_EMOJIS: { [key: string]: string } = {
  'Sports & Fitness': '🏃‍♂️',
  'Arts & Culture': '🎨',
  'Technology': '💻',
  'Food & Dining': '🍳',
  'Travel': '✈️',
  'Music': '🎵',
  'Reading & Literature': '📚',
  'Gaming': '🎮',
  'Nature & Outdoors': '🌲',
  'Science': '🔬',
  'Fashion': '👗',
  'Photography': '📸',
  'Movies & TV': '🎬',
  'Health & Wellness': '🧘‍♀️',
  'DIY & Crafts': '🛠️',
  'Business': '💼',
  'Pets & Animals': '🐾',
  'Social Causes': '🤝',
  'Education': '📚',
  'AI_GENERATED': '🤖',
  'Uncategorized': '📌'
};

export default function InterestManager() {
  const [newInterest, setNewInterest] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interests, isLoading } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests'],
    queryFn: async () => {
      const response = await apiRequest('/api/interests');
      return response.json();
    }
  });

  // Group interests by category
  const groupedInterests = useMemo(() => {
    if (!interests?.interests) return {};
    return interests.interests.reduce((acc: { [key: string]: Interest[] }, interest) => {
      const category = interest.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(interest);
      return acc;
    }, {});
  }, [interests?.interests]);

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
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

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Current Interests</h3>
              <div className="space-y-4">
                {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
                  <div key={category} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {expandedCategories.has(category) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {CATEGORY_EMOJIS[category] || '📌'} {category}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({categoryInterests.length} interests)
                        </span>
                      </div>
                    </button>

                    {expandedCategories.has(category) && (
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryInterests.map((interest) => (
                          <div
                            key={interest.id}
                            className="flex items-center justify-between p-2 border rounded-lg bg-card"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{interest.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {interest.category}
                              </Badge>
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
                    )}
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