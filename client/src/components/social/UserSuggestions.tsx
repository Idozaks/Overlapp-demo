import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export default function UserSuggestions() {
  const [, navigate] = useLocation();
  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!data?.users?.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No users found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.users.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
              <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={user.displayName || "User"} />
              )}
            </Avatar>
            <div>
              <h4 className="font-medium hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                {user.displayName || "Anonymous"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {user.bio?.slice(0, 30) || "No bio yet"}
                {user.bio?.length > 30 && "..."}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Follow
          </Button>
        </div>
      ))}
    </div>
  );
}