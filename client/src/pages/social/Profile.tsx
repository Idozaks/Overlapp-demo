import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PostList from "@/components/social/PostList";
import type { User } from "@shared/schema";

export default function Profile() {
  const { id } = useParams();
  
  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${id}`],
  });

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: [`/api/users/${id}/posts`],
  });

  if (loadingUser || loadingPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback>{user.user.displayName?.[0] || "U"}</AvatarFallback>
                {user.user.avatar && (
                  <AvatarImage src={user.user.avatar} alt={user.user.displayName || "User"} />
                )}
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  {user.user.displayName || "Anonymous"}
                </h1>
                {user.user.bio && (
                  <p className="text-muted-foreground mb-4">{user.user.bio}</p>
                )}
                <Button>Follow</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Posts</h2>
          <PostList posts={posts?.posts || []} />
        </div>
      </div>
    </div>
  );
}
