import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, QrCode, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = loginSchema.extend({
  displayName: z.string().min(1, "Display name is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [sharedProfileId, setSharedProfileId] = useState<string | null>(null);

  // Check for shared profile from QR code
  useEffect(() => {
    const storedProfileId = sessionStorage.getItem('sharedProfileId');
    if (storedProfileId) {
      setSharedProfileId(storedProfileId);
      setActiveTab("register"); // Default to registration for shared profiles
    }
  }, []);

  // Fetch shared profile data if available
  const { data: sharedProfile } = useQuery({
    queryKey: [`/api/users/${sharedProfileId}`],
    enabled: !!sharedProfileId,
  });

  // Redirect if already logged in
  if (user) {
    // If they came from a shared profile, redirect to overlap view
    if (sharedProfileId) {
      sessionStorage.removeItem('sharedProfileId'); // Clear stored ID
      navigate(`/social/overlap?targetUserId=${sharedProfileId}`);
      return null;
    }
    
    // Otherwise redirect to home
    navigate("/");
    return null;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      
      // If they came from a shared profile, redirect to overlap view
      if (sharedProfileId) {
        sessionStorage.removeItem('sharedProfileId'); // Clear stored ID
        navigate(`/social/overlap?targetUserId=${sharedProfileId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      
      // If they came from a shared profile, redirect to overlap view
      if (sharedProfileId) {
        sessionStorage.removeItem('sharedProfileId'); // Clear stored ID
        toast({
          title: "Account Created",
          description: "Your account has been created! We'll now show you what you have in common.",
          variant: "default",
        });
        navigate(`/social/overlap?targetUserId=${sharedProfileId}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen bg-background circle-pattern flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="gradient-primary gradient-text">Welcome to Overlapp</CardTitle>
          <CardDescription>
            {sharedProfileId ? 
              "Create an account to see what you have in common" : 
              "Sign in to your account or create a new one"
            }
          </CardDescription>
          
          {/* Show special message for QR scans */}
          {sharedProfileId && sharedProfile?.user && (
            <Alert className="mt-4 border-primary/20 bg-primary/5">
              <QrCode className="h-4 w-4 text-primary" />
              <AlertTitle className="flex items-center gap-2">
                <span>You scanned {sharedProfile.user.displayName || sharedProfile.user.username}'s profile</span>
              </AlertTitle>
              <AlertDescription>
                Create an account to see your overlapping interests and get personalized conversation starters.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gradient-primary text-white hover:opacity-90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gradient-secondary text-white hover:opacity-90"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}