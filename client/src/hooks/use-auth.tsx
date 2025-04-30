import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = LoginData & {
  displayName: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        console.log("[Auth] Fetching current user");
        const response = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log("[Auth] User not authenticated");
            return null;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch user");
        }

        const userData = await response.json();
        console.log("[Auth] User data fetched successfully:", userData);
        return userData;
      } catch (error) {
        console.error("[Auth] Error fetching user:", error);
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("[Auth] Attempting login");
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return await response.json();
    },
    onSuccess: (loggedInUser) => {
      console.log("[Auth] Login successful");
      queryClient.setQueryData(["/api/user"], loggedInUser);
      toast({
        title: "Success",
        description: "Successfully logged in",
      });
    },
    onError: (error: Error) => {
      console.error("[Auth] Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      console.log("[Auth] Attempting registration");
      
      // Preserve pendingOverlapUserId in registration flow
      const pendingUserId = localStorage.getItem('pendingOverlapUserId');
      console.log("[Auth] pendingOverlapUserId before registration:", pendingUserId);
      
      // Create headers with content type
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add the pending overlap user ID as a custom header if it exists
      if (pendingUserId) {
        headers["X-Pending-Overlap-User-ID"] = pendingUserId;
        console.log("[Auth] Adding pending overlap user ID to request headers:", pendingUserId);
      }
      
      const response = await fetch("/api/register", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      // Get the response data
      const responseData = await response.json();
      
      // Check for auth warnings from the server
      if (responseData._authWarning) {
        console.warn("[Auth] Server auth warning:", responseData._authWarning);
        toast({
          title: "Registration Notice",
          description: responseData._authWarning,
          variant: "default",
        });
        // Delete the warning property as we've processed it
        delete responseData._authWarning;
      }

      // After successful registration, make sure pendingOverlapUserId is still in localStorage
      if (pendingUserId) {
        console.log("[Auth] Restoring pendingOverlapUserId after registration:", pendingUserId);
        localStorage.setItem('pendingOverlapUserId', pendingUserId);
        // Also store in sessionStorage as a backup
        sessionStorage.setItem('pendingOverlapUserId', pendingUserId);
      }

      return responseData;
    },
    onSuccess: (newUser) => {
      console.log("[Auth] Registration successful", newUser);
      queryClient.setQueryData(["/api/user"], newUser);
      
      // Check for pendingOverlapUserId again
      const pendingUserId = localStorage.getItem('pendingOverlapUserId') || 
                           sessionStorage.getItem('pendingOverlapUserId');
      
      if (pendingUserId) {
        console.log("[Auth] Registration successful with pendingOverlapUserId:", pendingUserId);
        
        toast({
          title: "Success",
          description: "Account created successfully. Let's complete your profile!",
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully",
        });
      }
    },
    onError: (error: Error) => {
      console.error("[Auth] Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("[Auth] Attempting logout");
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      console.log("[Auth] Logout successful");
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    },
    onError: (error: Error) => {
      console.error("[Auth] Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error instanceof Error ? error : null,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}