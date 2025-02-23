import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen">
          <header className="p-4 border-b">
            <div className="container mx-auto flex justify-between items-center">
              <nav className="flex gap-4">
                <a href="/" className="text-foreground hover:text-primary">Home</a>
                <a href="/social" className="text-foreground hover:text-primary">Social</a>
                <a href="/social/explore" className="text-foreground hover:text-primary">Explore</a>
                <a href="/wallet" className="text-foreground hover:text-primary">Wallet</a>
              </nav>
              <LanguageSwitcher />
            </div>
          </header>
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