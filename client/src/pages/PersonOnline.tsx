import { FC, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GptButton } from "@/components/ui/gpt-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  UserIcon,
  RefreshCw,
  SparklesIcon,
  Loader2,
  MessageCircleIcon,
  GlobeIcon,
  ArrowUpRightIcon,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type OnlineUser = {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  interests: string[];
  lastActive?: string;
  platform?: string;
  website?: string;
};

// Connection analysis result type
interface ConnectionAnalysis {
  compatibilityScore: number;
  compatibilityReasoning: string;
  conversationStarters: string[];
  sharedInterests: Array<string | { interest: string; explanation?: string }>;
  complementaryDifferences: Array<
    string | { interest: string; explanation?: string }
  >;
  recommendedActivities: Array<string | { activity: string; reason?: string }>;
}

const PersonOnline: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [connectionAnalysis, setConnectionAnalysis] =
    useState<ConnectionAnalysis | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const { toast } = useToast();

  // Get user data from localStorage if available
  const getUserDataFromStorage = () => {
    try {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        const userData = JSON.parse(storedData);
        console.log("Found user data in localStorage:", userData);

        // Combine both selected interests and enriched interests
        const allInterests = [
          ...(userData.interests || []).map((id: number) => {
            // If it's MVP mode, we have a global list of INTERESTS
            const INTERESTS = [
              "Music",
              "Art & Design",
              "Travel",
              "Food & Dining",
              "Fashion",
              "Technology",
              "Books",
              "Movies",
              "Gaming",
              "Sports & Fitness",
              "Photography",
              "Dancing",
              "Podcasts",
              "Hiking",
              "Cooking",
              "Pets",
              "Yoga",
              "Writing",
              "Programming",
              "Painting",
            ];
            return INTERESTS[id] || `Interest ${id}`;
          }),
          ...(userData.enrichedInterests || []),
        ];

        return {
          id: 0,
          username:
            userData.name?.toLowerCase().replace(/\s+/g, "_") || "current_user",
          displayName: userData.name || "Current User",
          bio: userData.bio || "App user interested in exploring connections.",
          interests: allInterests.filter(Boolean),
        };
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }

    // Fallback data if nothing in localStorage
    return {
      id: 0,
      username: "current_user",
      displayName: "Current User",
      bio: "Digital explorer interested in tech, design, and online communities.",
      interests: [
        "Technology",
        "Programming",
        "UX Design",
        "Online Communities",
        "Digital Art",
      ],
    };
  };

  // Get current user data either from localStorage or fallback
  const currentUser = getUserDataFromStorage();

  // Get online users
  const {
    data: onlineUsers,
    isLoading,
    refetch,
  } = useQuery<{ users: OnlineUser[] }>({
    queryKey: ["/api/users/online", searchQuery],
    enabled: true,
  });

  // Mutation for connection analysis
  const analyzeConnection = useMutation({
    mutationFn: async (targetUser: OnlineUser) => {
      try {
        console.log("Sending connection analysis request with data:", {
          userInterests: currentUser.interests,
          targetInterests: targetUser.interests,
        });

        // Set analysis dialog open right away to show progress
        setAnalysisOpen(true);

        const response = await apiRequest("/api/connections/analyze", {
          method: "POST",
          body: {
            userInterests: currentUser.interests,
            targetInterests: targetUser.interests,
            userBio: currentUser.bio,
            targetBio: targetUser.bio || "",
          },
        });

        console.log("Connection analysis response:", response);
        return response as unknown as ConnectionAnalysis;
      } catch (error) {
        console.error("Connection analysis error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Small delay to make the UI feel more natural
      setTimeout(() => {
        setConnectionAnalysis(data);
      }, 700);
    },
    onError: (error) => {
      setAnalysisOpen(false);
      toast({
        title: "Connection analysis failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not analyze connection potential",
        variant: "destructive",
      });
    },
  });

  // Effect to simulate progress when analyzing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (analyzeConnection.isPending) {
      setProgressValue(0); // Reset progress
      
      // Start the progress simulation
      interval = setInterval(() => {
        setProgressValue(prevProgress => {
          // Increment but simulate slowdown near high percentages
          // to give time for the actual API response
          if (prevProgress < 70) {
            return prevProgress + 5; // Faster in the beginning
          } else if (prevProgress < 90) {
            return prevProgress + 2; // Slower in the middle
          } else {
            return prevProgress + 0.5; // Very slow at the end
          }
        });
      }, 200); // Update every 200ms
    } else {
      // When analysis is complete, set to 100%
      if (progressValue > 0) {
        setProgressValue(100);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analyzeConnection.isPending, progressValue]);

  // Simulated online users data
  const mockOnlineUsers: OnlineUser[] = [
    {
      id: 1,
      username: "tech_enthusiast",
      displayName: "Alex Tech",
      bio: "Software developer with a passion for AI and machine learning.",
      interests: ["Programming", "AI", "Machine Learning", "Technology"],
      lastActive: "2 minutes ago",
      platform: "Tech Forum",
      website: "https://techforum.example.com",
    },
    {
      id: 2,
      username: "designguru",
      displayName: "Sam Designer",
      bio: "UX/UI designer working on innovative digital experiences.",
      interests: ["UX Design", "UI Design", "Digital Art", "Typography"],
      lastActive: "5 minutes ago",
      platform: "Design Community",
      website: "https://designcommunity.example.com",
    },
    {
      id: 3,
      username: "gaming_legend",
      displayName: "Pat Gamer",
      bio: "Professional gamer and game designer focusing on strategy games.",
      interests: ["Gaming", "Game Design", "E-sports", "Strategy Games"],
      lastActive: "10 minutes ago",
      platform: "Gaming Network",
      website: "https://gamingnetwork.example.com",
    },
    {
      id: 4,
      username: "content_creator",
      displayName: "Jordan Creator",
      bio: "Digital content creator specializing in educational videos and podcasts.",
      interests: [
        "Content Creation",
        "Digital Marketing",
        "Education",
        "Podcasting",
      ],
      lastActive: "15 minutes ago",
      platform: "Content Hub",
      website: "https://contenthub.example.com",
    },
    {
      id: 5,
      username: "crypto_investor",
      displayName: "Morgan Crypto",
      bio: "Blockchain enthusiast and cryptocurrency investor exploring new financial technologies.",
      interests: ["Blockchain", "Cryptocurrency", "Finance", "Technology"],
      lastActive: "25 minutes ago",
      platform: "Crypto Exchange",
      website: "https://cryptoexchange.example.com",
    },
  ];

  // Filter users based on search query
  const filterUsers = (users: OnlineUser[], query: string) => {
    if (!query) return users;

    const lowerQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery) ||
        user.bio?.toLowerCase().includes(lowerQuery) ||
        user.interests.some((interest) =>
          interest.toLowerCase().includes(lowerQuery),
        ) ||
        user.platform?.toLowerCase().includes(lowerQuery),
    );
  };

  // For demo purposes, use mock data
  const displayedUsers = filterUsers(
    onlineUsers?.users || mockOnlineUsers,
    searchQuery,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Find People Online</h1>
        <p className="text-muted-foreground mb-6">
          Discover people active on websites and platforms with similar
          interests
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, interest, or platform"
              className="pl-10"
            />
          </div>
          <Button type="submit">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">
            No online users match your search criteria.
          </p>
          <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedUsers.map((user) => (
            <Card
              key={user.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={user.profileImageUrl}
                        alt={user.displayName || user.username}
                      />
                      <AvatarFallback>
                        {(user.displayName || user.username)
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="font-medium">
                        {user.displayName || user.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{user.username}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <GlobeIcon className="w-3 h-3 mr-1" />
                        <span>{user.platform}</span>
                        <span className="mx-1">•</span>
                        <span>Active {user.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {user.bio && <p className="text-sm mb-4">{user.bio}</p>}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (user.website) {
                          window.open(user.website, "_blank");
                        }
                      }}
                    >
                      <ArrowUpRightIcon className="w-3 h-3 mr-2" />
                      Visit Platform
                    </Button>
                    <GptButton
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        analyzeConnection.mutate(user);
                      }}
                      isLoading={analyzeConnection.isPending && selectedUser?.id === user.id}
                      loadingText="Analyzing..."
                      className="gap-2"
                    >
                      <SparklesIcon className="w-4 h-4" /> 
                      Analyze Overlap
                    </GptButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Connection Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-teal-500" />
              Connection Analysis
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <span>
                  Your potential connection with{" "}
                  {selectedUser.displayName || selectedUser.username}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {analyzeConnection.isPending ? (
            <div className="py-8 space-y-4">
              <div className="flex flex-col items-center justify-center">
                <BrainCircuit className="w-12 h-12 text-teal-500 mb-4 animate-pulse" />
                <p className="text-lg font-medium mb-2">
                  Analyzing Psychology Profile
                </p>
                <p className="text-sm text-muted-foreground text-center mb-4 max-w-xs">
                  Our AI is analyzing the psychological overlap between your
                  profile and {" "}
                  {selectedUser?.displayName ||
                    selectedUser?.username ||
                    "'s profile"}.
                </p>

                {/* Dynamic progress that increases over time */}
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Analyzing profiles...</span>
                    <span className="font-medium">{Math.min(Math.round(progressValue), 99)}%</span>
                  </div>
                  <Progress value={Math.min(progressValue, 99)} className="h-2 [&>div]:bg-teal-500" />
                </div>
              </div>
            </div>
          ) : (
            connectionAnalysis && (
              <div className="my-2 overflow-y-auto pr-2 flex-grow">
                {/* Main Collapsible for Connection Analysis */}
                <Collapsible className="w-full space-y-2">
                  {/* Compatibility Score (Always visible) */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Compatibility Score</span>
                      <Badge
                        className={
                          (connectionAnalysis.compatibilityScore || 0) >= 80
                            ? "bg-green-500"
                            : (connectionAnalysis.compatibilityScore || 0) >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }
                      >
                        {connectionAnalysis.compatibilityScore || 0}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">
                      {connectionAnalysis.compatibilityReasoning ||
                        "Analysis in progress. Try again in a moment."}
                    </p>
                  </div>

                  {/* Collapsible Trigger Button */}
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 mt-4 border-teal-300 hover:bg-teal-50"
                    >
                      <BrainCircuit className="w-4 h-4 text-teal-500" />
                      <span>View Psychological Overlap</span>
                      <ChevronDown className="h-4 w-4 text-teal-400 transition-all group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>

                  {/* Collapsible Content */}
                  <CollapsibleContent className="space-y-4 pt-4">
                    {/* Conversation Starters */}
                    {connectionAnalysis.conversationStarters &&
                      connectionAnalysis.conversationStarters.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Conversation Starters
                          </h3>
                          <ul className="space-y-2">
                            {connectionAnalysis.conversationStarters.map(
                              (starter, i) => (
                                <li key={i} className="text-sm flex gap-2">
                                  <MessageCircleIcon className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                                  <span className="break-words">{starter}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Shared Interests */}
                    {connectionAnalysis.sharedInterests &&
                      connectionAnalysis.sharedInterests.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Shared Interests
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {connectionAnalysis.sharedInterests.map(
                              (interest, i) => (
                                <Badge key={i} variant="secondary">
                                  {typeof interest === "object" &&
                                  interest !== null &&
                                  "interest" in interest
                                    ? (interest as { interest: string })
                                        .interest
                                    : typeof interest === "string"
                                      ? interest
                                      : ""}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Complementary Differences */}
                    {connectionAnalysis.complementaryDifferences &&
                      connectionAnalysis.complementaryDifferences.length >
                        0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Complementary Differences
                          </h3>
                          <p className="text-sm text-muted-foreground break-words">
                            {connectionAnalysis.complementaryDifferences
                              .map((diff) =>
                                typeof diff === "object" &&
                                diff !== null &&
                                "interest" in diff
                                  ? (diff as { interest: string }).interest
                                  : String(diff),
                              )
                              .join(", ")}
                          </p>
                        </div>
                      )}

                    {/* Recommended Activities */}
                    {connectionAnalysis.recommendedActivities &&
                      connectionAnalysis.recommendedActivities.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Recommended Activities
                          </h3>
                          <ul className="space-y-1">
                            {connectionAnalysis.recommendedActivities.map(
                              (activity, i) => (
                                <li key={i} className="text-sm break-words">
                                  •{" "}
                                  {typeof activity === "object" &&
                                  activity !== null &&
                                  "activity" in activity
                                    ? (activity as { activity: string })
                                        .activity
                                    : String(activity)}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )
          )}

          <DialogFooter className="flex-shrink-0 mt-2 pt-2 border-t">
            <Button className="w-full" onClick={() => setAnalysisOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonOnline;
