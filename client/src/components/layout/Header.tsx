import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  ChevronDown, 
  Globe, 
  LogOut, 
  User,
  Users,
  Wallet,
  Settings,
  Home,
  Store,
  LogIn,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle logout functionality
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location === path;
  };

  const mainMenuItems = [
    { label: 'Home', path: '/' },
    { 
      label: 'Engage', 
      path: '/engage',
      subItems: [
        { label: 'Engage with another persona', path: '/engage/persona' },
        { label: 'Engage online with websites', path: '/engage/online' },
        { label: 'Engage offline', path: '/engage/offline' },
      ]
    },
  ];

  // Update profile path dynamically based on user ID
  // Create a direct hardcoded profile link for testing
  const profileUrl = user?.id ? `/profile/${user.id}` : '/profile';
  console.log('[Header] Current user profile URL:', profileUrl, 'User ID:', user?.id);
  
  const profileMenuItems = [
    { 
      label: 'Profile', 
      path: profileUrl,
      onClick: () => { console.log('[Header] Navigating to profile with ID:', user?.id); }
    },
    { label: 'Settings', path: '/settings' },
    { label: 'Wallet', path: '/wallet' },
    { label: 'Explore Users', path: '/social/explore' },
  ];

  const renderNavItems = () => (
    <>
      {mainMenuItems.map((item) => (
        item.subItems ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "flex items-center gap-1",
                  isActive(item.path) && "bg-accent"
                )}
              >
                {t(`nav.${item.label.toLowerCase()}`)}
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {item.subItems.map((subItem) => (
                <DropdownMenuItem key={subItem.label} asChild>
                  <Link 
                    href={subItem.path}
                    className={cn(
                      "cursor-pointer w-full",
                      isActive(subItem.path) && "bg-accent"
                    )}
                  >
                    {t(`nav.${subItem.label.toLowerCase().replace(/\s+/g, '_')}`)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            key={item.label}
            variant="ghost"
            className={cn(isActive(item.path) && "bg-accent")}
            asChild
          >
            <Link href={item.path}>
              {t(`nav.${item.label.toLowerCase()}`)}
            </Link>
          </Button>
        )
      ))}
      
      {/* Connection Export */}
      <Button variant="ghost" className={cn(isActive("/social") && "bg-accent")} asChild>
        <Link href="/social">
          <Share2 className="mr-2 h-4 w-4" />
          {t('nav.connection_export')}
        </Link>
      </Button>
    </>
  );

  const renderMobileMenu = () => (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-4 pt-12">
        {mainMenuItems.map((item) => (
          item.subItems ? (
            <div key={item.label} className="flex flex-col gap-2">
              <p className="font-semibold px-2">{t(`nav.${item.label.toLowerCase()}`)}</p>
              <div className="flex flex-col pl-4 gap-2">
                {item.subItems.map((subItem) => (
                  <Link 
                    key={subItem.label}
                    href={subItem.path}
                    className={cn(
                      "px-2 py-1 rounded hover:bg-accent",
                      isActive(subItem.path) && "bg-accent"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(`nav.${subItem.label.toLowerCase().replace(/\s+/g, '_')}`)}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                "px-2 py-1 rounded hover:bg-accent",
                isActive(item.path) && "bg-accent"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {t(`nav.${item.label.toLowerCase()}`)}
            </Link>
          )
        ))}
        
        {/* Connection Export Link in Mobile Menu */}
        <Link
          href="/social"
          className={cn(
            "px-2 py-1 rounded hover:bg-accent flex items-center gap-2",
            isActive("/social") && "bg-accent"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <Share2 size={16} />
          {t('nav.connection_export')}
        </Link>
        
        <hr className="my-2" />
        
        {user ? (
          <>
            <Link
              href={profileUrl}
              className="px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
              onClick={() => {
                console.log('[Header Mobile] Navigating to profile with URL:', profileUrl);
                setMobileOpen(false);
              }}
            >
              <User size={16} />
              {t('nav.profile')}
            </Link>
            <Link
              href="/wallet"
              className="px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Wallet size={16} />
              {t('nav.wallet')}
            </Link>
            <Link
              href="/social/explore"
              className="px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Users size={16} />
              {t('nav.explore_users')}
            </Link>
            <Button 
              variant="ghost" 
              className="justify-start px-2"
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
            >
              <LogOut size={16} className="mr-2" />
              {t('nav.logout')}
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-2 py-1 rounded hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn size={16} className="mr-2" />
              {t('nav.login')}
            </Link>
            <Link
              href="/register"
              className="px-2 py-1 rounded hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.register')}
            </Link>
          </>
        )}
        
        <div className="mt-auto flex items-center justify-between">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md ${
      isScrolled ? "py-2 shadow-sm" : "py-4"
    }`}>
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Overlapp Logo" className="h-8 w-8" />
            <span className="font-bold text-lg hidden sm:inline-block">Overlapp</span>
          </Link>
        </div>

        {isMobile ? (
          renderMobileMenu()
        ) : (
          <nav className="flex items-center gap-2 mr-4">
            {renderNavItems()}
          </nav>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || ''} alt={user.displayName || user.username} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0) || user.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('nav.account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Direct fixed link for profile with current user ID */}
                <DropdownMenuItem asChild>
                  <Link href={profileUrl}>
                    <User className="mr-2 h-4 w-4" />
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                
                {/* Other menu items */}
                {profileMenuItems.slice(1).map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link 
                      href={item.path}
                      onClick={item.onClick}
                    >
                      {/* Icon mapping based on label */}
                      {item.label === 'Settings' && <Settings className="mr-2 h-4 w-4" />}
                      {item.label === 'Wallet' && <Wallet className="mr-2 h-4 w-4" />}
                      {item.label === 'Explore Users' && <Users className="mr-2 h-4 w-4" />}
                      {t(`nav.${item.label.toLowerCase().replace(/\s+/g, '_')}`)}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('nav.login')}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">{t('nav.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;