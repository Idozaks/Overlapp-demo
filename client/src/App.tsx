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
import ProfileEdit from "@/pages/social/ProfileEdit";
import WalletDashboard from "@/pages/wallet/Dashboard";
import InterestManager from "@/pages/admin/InterestManager";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { 
  Loader2, 
  HomeIcon, 
  UsersIcon, 
  CompassIcon, 
  WalletIcon, 
  PlayIcon, 
  MailIcon, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Shield
} from "lucide-react";
import "./lib/i18n";
import EventsPage from '@/components/events/EventsPage'; //Added import statement

function Router() {
  const { user } = useAuth();

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
      <Route path="/profile/:id/edit" component={ProfileEdit} />
      <Route path="/wallet" component={WalletDashboard} />
      {user?.isAdmin && <Route path="/admin/interests" component={InterestManager} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function Header() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const NavigationLinks = () => (
    <nav className="flex flex-col lg:flex-row gap-6">
      <a href="/" className="text-foreground hover:text-primary flex items-center gap-2 whitespace-nowrap">
        <HomeIcon className="w-4 h-4" />
        Home
      </a>
      {user ? (
        <>
          <a href="/social" className="text-foreground hover:text-primary flex items-center gap-2 whitespace-nowrap">
            <UsersIcon className="w-4 h-4" />
            Social
          </a>
          <a href="/social/explore" className="text-foreground hover:text-primary flex items-center gap-2 whitespace-nowrap">
            <CompassIcon className="w-4 h-4" />
            Explore
          </a>
          <a href="/wallet" className="text-foreground hover:text-primary flex items-center gap-2 whitespace-nowrap">
            <WalletIcon className="w-4 h-4" />
            Wallet
          </a>
          {user.isAdmin && (
            <a href="/admin/interests" className="text-foreground hover:text-primary flex items-center gap-2 whitespace-nowrap">
              <Shield className="w-4 h-4" />
              Manage Interests
            </a>
          )}
        </>
      ) : (
        <a href="/demo" className="text-foreground hover:text-primary flex items-center gap-2 whitespace-nowrap">
          <PlayIcon className="w-4 h-4" />
          Demo
        </a>
      )}
      <a href="/contact" className="text-foreground hover:text-primary flex items-center gap-2 whitespace-nowrap">
        <MailIcon className="w-4 h-4" />
        Contact
      </a>
    </nav>
  );

  return (
    <header className="p-4 border-b">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center mr-4">
            <a href="/" className="flex items-center">
              <img src="/logo.png" alt="Overlapp Logo" className="h-16 transition-all hover:scale-105 shadow-sm hover:shadow-accent rounded-lg" />
            </a>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <NavigationLinks />
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block overflow-x-auto pb-2 -mb-2">
            <NavigationLinks />
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher - Now visible in both mobile and desktop */}
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <span className="text-sm">
                        {user.displayName || user.username}
                        {user.isAdmin && <Shield className="w-3 h-3 ml-1 inline" />}
                      </span>
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}/edit`)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin/interests')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Manage Interests
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logoutMutation.mutate();
                        navigate("/");
                      }}
                      disabled={logoutMutation.isPending}
                      className="text-red-500 focus:text-red-500"
                    >
                      {logoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4 mr-2" />
                      )}
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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