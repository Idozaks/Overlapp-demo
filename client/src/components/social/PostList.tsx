import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MessageSquare, Heart, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PostWithUser } from "@shared/schema";

interface PostListProps {
  posts: PostWithUser[];
}

export default function PostList({ posts }: PostListProps) {
  const [, navigate] = useLocation();

  const { mutate: likePost } = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("POST", `/api/posts/${postId}/like`, {
        userId: 1, // TODO: Get from auth context
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  if (!posts.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No posts yet. Be the first to share something!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="cursor-pointer" onClick={() => navigate(`/profile/${post.userId}`)}>
                <AvatarFallback>
                  {post.user?.displayName?.[0] || "U"}
                </AvatarFallback>
                {post.user?.avatar && (
                  <AvatarImage src={post.user.avatar} alt={post.user.displayName || "User"} />
                )}
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold hover:underline cursor-pointer" onClick={() => navigate(`/profile/${post.userId}`)}>
                      {post.user?.displayName || "Anonymous"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <p className="mt-2">{post.content}</p>

                {post.location && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location.placeName}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="py-4">
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => likePost(post.id)}>
                <Heart className="w-4 h-4" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Comment
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}