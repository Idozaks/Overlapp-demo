
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, ChevronRight, ChevronDown, Pencil, Check, X } from "lucide-react";
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
  const [editingInterest, setEditingInterest] = useState<{ id: number, name: string } | null>(null);
  const [editedName, setEditedName] = useState("");
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
        description: error.message || "Failed to add interest",
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
      return response.json();
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
        description: error.message || "Failed to delete interest",
        variant: "destructive",
      });
    },
  });

  const updateInterestMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number, name: string }) => {
      const response = await apiRequest(`/api/interests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update interest');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interests'] });
      setEditingInterest(null);
      setEditedName("");
      toast({
        title: "Success",
        description: "Interest updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update interest",
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

  const handleEditStart = (interest: Interest) => {
    setEditingInterest({ id: interest.id, name: interest.name });
    setEditedName(interest.name);
  };

  const handleEditCancel = () => {
    setEditingInterest(null);
    setEditedName("");
  };

  const handleEditSave = () => {
    if (editingInterest && editedName.trim()) {
      updateInterestMutation.mutate({ id: editingInterest.id, name: editedName.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
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

            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-medium">Interest Categories</h3>
              {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
                <div key={category} className="border rounded-lg">
                  <button
                    className="flex justify-between items-center w-full p-3 hover:bg-secondary/10 transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_EMOJIS[category] || '📌'}</span>
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline" className="ml-2">
                        {categoryInterests.length}
                      </Badge>
                    </div>
                    <div>
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {expandedCategories.has(category) && (
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryInterests.map((interest) => (
                        <div
                          key={interest.id}
                          className="flex items-center justify-between p-2 border rounded-lg bg-card"
                        >
                          {editingInterest && editingInterest.id === interest.id ? (
                            <div className="flex-1 flex items-center space-x-2">
                              <Input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                autoFocus
                                className="flex-1"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleEditSave}
                                disabled={updateInterestMutation.isPending}
                              >
                                {updateInterestMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4 text-green-500" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleEditCancel}
                                disabled={updateInterestMutation.isPending}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-1">
                                <p className="font-medium">{interest.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {interest.category}
                                </Badge>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditStart(interest)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
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
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
