import { Switch, Route, useLocation, useRoute, Link } from "wouter";
import React, { lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { DemoProvider } from "@/hooks/use-demo";
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
import InterestSuggestionsPage from "@/pages/social/InterestSuggestionsPage";
import Matches from "@/pages/social/Matches";
import UserOverlap from "@/pages/social/UserOverlap";
import SocialMediaExportPage from "@/pages/social/SocialMediaExport";
import WalletDashboard from "@/pages/wallet/Dashboard";
import InterestManager from "@/pages/admin/InterestManager";
import ExploreInterests from "@/pages/interests/ExploreInterests";
import InterestDetail from "@/pages/interests/InterestDetail";
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
  Shield,
  InfoIcon,
  UserCheck,
  Share2,
  RefreshCw,
  Store,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  BookmarkIcon
} from "lucide-react";
import "./lib/i18n";
import About from "@/pages/About"; // Import the About component
import Marketplace from "@/pages/marketplace"; // Import the Marketplace component
import EntityOverlap from "@/pages/marketplace/EntityOverlap"; // Import the EntityOverlap component
import ChatPage from "@/pages/chat"; // Import the Chat component
import Animation from "./pages/Animation"; // Import the Animation component
import MvpPromo from "@/pages/MvpPromo"; // Import the MVP Promotional page
import { SimulationController } from "@/components/demo"; // Import the SimulationController component
import DashboardPage from "@/pages/tenant-dashboard/DashboardPage"; // Import the Tenant Dashboard page
import LoginPage from "@/pages/tenant-dashboard/LoginPage"; // Import the Tenant Login page
import PreviewPage from "@/pages/tenant-dashboard/PreviewPage"; // Import the Widget Preview page
import SampleSitesPage from "@/pages/samples"; // Import the Sample Sites page
import BookClubSamplePage from "@/pages/samples/bookclub"; // Import the BookClub sample site


function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/signup" component={Signup} />
      <Route path="/demo" component={Demo} />
      <Route path="/retailer/:id" component={RetailerDetails} />
      <Route path="/contact" component={Contact} />
      <Route path="/social" component={SocialHub} />
      <Route path="/social/explore" component={ExploreUsers} />
      <Route path="/social/matches" component={Matches} />
      <Route path="/social/overlap" component={UserOverlap} />
      <Route path="/social/export" component={SocialMediaExportPage} />
      <Route path="/profile/:id?" component={Profile} />
      <Route path="/profile/:id/edit" component={ProfileEdit} />
      <Route path="/profile/:id/interests/suggestions" component={InterestSuggestionsPage} />
      <Route path="/wallet" component={WalletDashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/entity/:id/overlap" component={EntityOverlap} />
      <Route path="/interests" component={ExploreInterests} />
      <Route path="/interests/:id" component={InterestDetail} />
      <Route path="/marketplace/entity/:id" component={() => {
        const [, params] = useRoute('/marketplace/entity/:id');
        const entityId = params?.id ? parseInt(params.id) : 0;
        
        const { data, isLoading } = useQuery({
          queryKey: [`/api/marketplace/entities/${entityId}`],
          enabled: !!entityId,
        });
        
        const entity = data?.entity;
        
        if (isLoading) {
          return (
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center mb-6">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <p>Loading entity details...</p>
              </div>
            </div>
          );
        }
        
        if (!entity) {
          return (
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Entity Not Found</h1>
              <p className="mb-6">The entity you are looking for doesn't exist or may have been removed.</p>
              <Link href="/marketplace">
                <Button>Back to Marketplace</Button>
              </Link>
            </div>
          );
        }
        
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <Link href="/marketplace">
                  <Button variant="ghost" size="sm">Back to Marketplace</Button>
                </Link>
                <h1 className="text-2xl font-bold ml-4">{entity.name}</h1>
              </div>
              {user && (
                <Link href={`/marketplace/entity/${entityId}/overlap`}>
                  <Button>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Analyze Overlap
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge variant="secondary">{entity.category}</Badge>
                    <Badge variant="outline">
                      {entity.type === 'physical' ? 'Physical Location' : 'Digital Entity'}
                    </Badge>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">About</h2>
                  <p className="text-muted-foreground mb-4">{entity.description}</p>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Content</h2>
                  <div className="space-y-4">
                    {entity.content?.map(item => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-2">
                            <Badge variant="outline">
                              {item.contentType ? `${item.contentType.charAt(0).toUpperCase()}${item.contentType.slice(1)}` : 'Content'}
                            </Badge>
                          </div>
                          <p>{item.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {!entity.content?.length && (
                      <p className="text-muted-foreground text-center py-4">
                        No content available for this entity.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-card rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-3">Entity Information</h2>
                  <Separator className="my-3" />
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">
                        {entity.type === 'physical' ? 'Physical Location' : 'Digital Entity'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm text-muted-foreground">{entity.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }} />
      {user?.isAdmin && <Route path="/admin/interests" component={InterestManager} />}
      <Route path="/engage" component={lazy(() => import('./pages/engage/EngageIndex'))} />
      <Route path="/engage/persona" component={lazy(() => import('./pages/engage/EngagePersona'))} />
      <Route path="/engage/online" component={lazy(() => import('./pages/engage/EngageOnline'))} />
      <Route path="/engage/offline" component={lazy(() => import('./pages/engage/EngageOffline'))} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/animation" component={Animation} />
      <Route path="/mvp-promo" component={MvpPromo} />
      
      {/* OverlapLite Widget Tenant Dashboard Routes */}
      <Route path="/tenant/login" component={LoginPage} />
      <Route path="/tenant/dashboard" component={DashboardPage} />
      <Route path="/tenant/preview" component={PreviewPage} />
      
      {/* Sample Websites for OverlapLite Demo */}
      <Route path="/samples" component={SampleSitesPage} />
      <Route path="/samples/bookclub" component={BookClubSamplePage} />
      
      {/* Widget Routes */}
      <Route path="/widget" component={lazy(() => import("@/pages/widget/WidgetPage"))} />
      <Route path="/widget/demo" component={lazy(() => import("@/pages/widget/DemoPage"))} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function Header() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const NavigationLinks = () => (
    <nav className="flex flex-col lg:flex-row gap-6">
      <a href="/" className="text-foreground hover:text-primary whitespace-nowrap">
        Home
      </a>
      {user ? (
        <>
          <a href="/social" className="text-foreground hover:text-primary whitespace-nowrap">
            Social
          </a>
          <a href="/social/explore" className="text-foreground hover:text-primary whitespace-nowrap">
            Explore
          </a>
          <a href="/social/matches" className="text-foreground hover:text-primary whitespace-nowrap flex items-center">
            <UserCheck className="w-4 h-4 mr-1" /> Matches
          </a>
          <a href="/social/export" className="text-foreground hover:text-primary whitespace-nowrap flex items-center">
            <RefreshCw className="w-4 h-4 mr-1" /> Social Export
          </a>
          <a href="/marketplace" className="text-foreground hover:text-primary whitespace-nowrap flex items-center">
            <Store className="w-4 h-4 mr-1" /> Marketplace
          </a>
          <a href="/interests" className="text-foreground hover:text-primary whitespace-nowrap flex items-center">
            <BookmarkIcon className="w-4 h-4 mr-1" /> Interests
          </a>
          <a href="/wallet" className="text-foreground hover:text-primary whitespace-nowrap">
            Wallet
          </a>
          <a href="/chat" className="text-foreground hover:text-primary whitespace-nowrap flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" /> Chat
          </a>
          {user.isAdmin && (
            <a href="/admin/interests" className="text-foreground hover:text-primary whitespace-nowrap">
              Manage Interests
            </a>
          )}
        </>
      ) : (
        <>
          <a href="/demo" className="text-foreground hover:text-primary whitespace-nowrap">
            Demo
          </a>
          <a href="/marketplace" className="text-foreground hover:text-primary whitespace-nowrap flex items-center">
            <Store className="w-4 h-4 mr-1" /> Marketplace
          </a>
        </>
      )}
      <a href="/contact" className="text-foreground hover:text-primary whitespace-nowrap">
        Contact
      </a>
      <a href="/about" className="text-foreground hover:text-primary whitespace-nowrap">
        About
      </a>
      <a href="/mvp-promo" className="text-foreground hover:text-primary whitespace-nowrap flex items-center font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm">
        <Sparkles className="w-3 h-3 mr-1" /> MVP Promo
      </a>
      <a href="/tenant/login" className="text-foreground hover:text-primary whitespace-nowrap flex items-center font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm">
        <RefreshCw className="w-3 h-3 mr-1" /> OverlapLite
      </a>
      <a href="/samples" className="text-foreground hover:text-primary whitespace-nowrap flex items-center font-semibold bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm">
        <Sparkles className="w-3 h-3 mr-1" /> Demo Sites
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/social/matches')}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Find Matches
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/social/export')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Social Media Export
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/marketplace')}>
                      <Store className="w-4 h-4 mr-2" />
                      Marketplace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/interests')}>
                      <BookmarkIcon className="w-4 h-4 mr-2" />
                      Interests
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/chat')}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
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
        <DemoProvider>
          <div className="min-h-screen">
            <Header />
            <main>
              <Router />
            </main>
          </div>
          <SimulationController />
          <Toaster />
        </DemoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;