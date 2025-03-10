import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu,
  Home,
  Users,
  Globe,
  Wallet,
  User,
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const NavigationLinks = () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/"
            className="flex items-center gap-2 p-2"
          >
            <Home className="w-4 h-4" />
            {t('common.nav.home')}
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Engage
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-4 w-[200px]">
              <NavigationMenuLink href="/engage/persona" className="block p-2 hover:bg-accent rounded-md">
                Engage with another persona
              </NavigationMenuLink>
              <NavigationMenuLink href="/engage/online" className="block p-2 hover:bg-accent rounded-md">
                Engage online with websites
              </NavigationMenuLink>
              <NavigationMenuLink href="/engage/offline" className="block p-2 hover:bg-accent rounded-md">
                Engage offline
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {user && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Social
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-2 p-4 w-[200px]">
                <NavigationMenuLink href="/social" className="block p-2 hover:bg-accent rounded-md">
                  Social Hub
                </NavigationMenuLink>
                <NavigationMenuLink href="/social/explore" className="block p-2 hover:bg-accent rounded-md">
                  Explore Users
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <header className="p-4 border-b">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center mr-4">
            <a href="/" className="flex items-center">
              <img src="/logo.png" alt="Overlapp Logo" className="h-16 transition-all hover:scale-105 shadow-sm hover:shadow-accent rounded-lg" />
            </a>
          </div>

          <div className="hidden lg:block">
            <NavigationLinks />
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{user.displayName || user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}/edit`)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wallet')}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </DropdownMenuItem>
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
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Sign In
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-4">
                  <NavigationLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}