import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MapPin } from "lucide-react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/posts", {
        content,
        userId: 1, // TODO: Get from auth context
      });
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      toast({
        title: "Success",
        description: "Your post has been created",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex justify-between items-center">
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => {
            // TODO: Implement location selection
            toast({
              title: "Coming Soon",
              description: "Location tagging will be available soon!",
            });
          }}
        >
          <MapPin className="w-4 h-4" />
          Add Location
        </Button>
        <Button 
          onClick={() => createPost()}
          disabled={!content.trim() || isPending}
        >
          {isPending ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}