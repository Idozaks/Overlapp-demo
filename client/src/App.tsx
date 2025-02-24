import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Signup from "@/pages/auth/Signup";
import Demo from "@/pages/Demo";
import RetailerDetails from "@/pages/RetailerDetails";
import Contact from "@/pages/Contact";
import SocialHub from "@/pages/social/SocialHub";
import ExploreUsers from "@/pages/social/ExploreUsers";
import Profile from "@/pages/social/Profile";
import WalletDashboard from "@/pages/wallet/Dashboard";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Loader2, HomeIcon, UsersIcon, CompassIcon, WalletIcon, PlayIcon, MailIcon } from "lucide-react";
import "./lib/i18n"; // Import i18n configuration

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/demo" component={Demo} />
      <Route path="/retailer/:id" component={RetailerDetails} />
      <Route path="/contact" component={Contact} />
      <Route path="/social" component={SocialHub} />
      <Route path="/social/explore" component={ExploreUsers} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/wallet" component={WalletDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Header() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  return (
    <header className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <nav className="flex gap-6">
          <a href="/" className="text-foreground hover:text-primary flex items-center gap-2">
            <HomeIcon className="w-4 h-4" />
            Home
          </a>
          {user ? (
            <>
              <a href="/social" className="text-foreground hover:text-primary flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Social
              </a>
              <a href="/social/explore" className="text-foreground hover:text-primary flex items-center gap-2">
                <CompassIcon className="w-4 h-4" />
                Explore
              </a>
              <a href="/wallet" className="text-foreground hover:text-primary flex items-center gap-2">
                <WalletIcon className="w-4 h-4" />
                Wallet
              </a>
            </>
          ) : (
            <a href="/demo" className="text-foreground hover:text-primary flex items-center gap-2">
              <PlayIcon className="w-4 h-4" />
              Demo
            </a>
          )}
          <a href="/contact" className="text-foreground hover:text-primary flex items-center gap-2">
            <MailIcon className="w-4 h-4" />
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.displayName || user.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logoutMutation.mutate();
                  navigate("/");
                }}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Logout"
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/signup")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen">
          <Header />
          <main>
            <Router />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;