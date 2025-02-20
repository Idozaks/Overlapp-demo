import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Signup from "@/pages/auth/Signup";
import Demo from "@/pages/Demo";
import RetailerDetails from "@/pages/RetailerDetails";
import Contact from "@/pages/Contact";
import SocialHub from "@/pages/social/SocialHub";
import Profile from "@/pages/social/Profile";
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
      <Route path="/profile/:id" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
        </head>
        <header className="p-4 border-b">
          <div className="container mx-auto flex justify-end">
            <LanguageSwitcher />
          </div>
        </header>
        <main>
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;