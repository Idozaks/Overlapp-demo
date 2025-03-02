import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ProfileEditForm from "@/components/profile/ProfileEdit";
import type { User } from "@shared/schema";

export default function ProfileEditPage() {
  const { id } = useParams();
  const userId = id ? parseInt(id) : null;
  const [, setLocation] = useLocation();

  const { data: user, isLoading: loadingUser } = useQuery<{ user: User }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && !isNaN(userId)
  });

  if (!userId || isNaN(userId)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Invalid user ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingUser) {
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
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
            <ProfileEditForm 
              user={user.user} 
              onSuccess={() => setLocation(`/profile/${userId}`)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
