import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CreatePost from "@/components/social/CreatePost";
import PostList from "@/components/social/PostList";
import UserSuggestions from "@/components/social/UserSuggestions";
import { Loader2 } from "lucide-react";

export default function SocialHub() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ["/api/feed"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Feed Section */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <CreatePost />
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <PostList posts={feed?.posts || []} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Suggested Connections</h3>
                <UserSuggestions />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
