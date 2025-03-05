import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Interest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function InterestManager() {
  const [newInterest, setNewInterest] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interests, isLoading } = useQuery<{ interests: Interest[] }>({
    queryKey: ['/api/interests'],
    queryFn: async () => {
      const response = await apiRequest('/api/interests');
      return response.json();
    }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interests?.interests.map((interest) => (
                  <div
                    key={interest.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{interest.name}</p>
                      <Badge variant="secondary">{interest.category}</Badge>
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