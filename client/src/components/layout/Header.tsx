
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ChevronDown, Globe, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

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

  const profileMenuItems = [
    { label: 'Profile', path: '/profile' },
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
        
        <hr className="my-2" />
        
        {user ? (
          <>
            <Link
              href="/profile"
              className="px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <User size={16} />
              {t('nav.profile')}
            </Link>
            <Link
              href="/wallet"
              className="px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.wallet')}
            </Link>
            <Link
              href="/social/explore"
              className="px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.explore_users')}
            </Link>
            <Button 
              variant="ghost" 
              className="justify-start px-2"
              onClick={() => {
                logout();
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
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
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || ''} alt={user.displayName} />
                    <AvatarFallback>{user.displayName?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {profileMenuItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.path}>
                      {t(`nav.${item.label.toLowerCase().replace(/\s+/g, '_')}`)}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t('nav.login')}</Link>
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
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  Home,
  User,
  LogIn,
  Users,
  Wallet,
  Globe,
  Store,
  Settings,
  ChevronDown,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import Logo from "@/components/common/Logo";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-2 bg-background/90 backdrop-blur-sm shadow-sm" : "py-4 bg-transparent"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl">Overlapp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <Home className="w-4 h-4" />
                {t('common.nav.home')}
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  {t('common.nav.engage')}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/engage/persona">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('common.nav.engage_with_another_persona')}
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/engage/online">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {t('common.nav.engage_online_with_websites')}
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/engage/offline">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      {t('common.nav.engage_offline')}
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Social Topics */}
            <Link to="/social">
              <Button variant="ghost" className="gap-2">
                <Share2 className="w-4 h-4" />
                Social Export
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative overflow-hidden rounded-full w-8 h-8 p-0">
                    <Avatar>
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/explore">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Explore Users
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wallet">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Wallet
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="default" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Navigation */}
          {isMobile && (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                  <Menu className="w-6 h-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mt-4 px-4">
                  <div className="flex items-center justify-between mb-6">
                    <Link to="/" onClick={closeMobileMenu}>
                      <div className="flex items-center gap-2">
                        <Logo className="h-8 w-8" />
                        <span className="font-bold text-xl">Overlapp</span>
                      </div>
                    </Link>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="w-6 h-6" />
                      </Button>
                    </DrawerClose>
                  </div>
                  
                  <div className="space-y-4">
                    <Link to="/" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Home className="w-4 h-4" />
                        {t('common.nav.home')}
                      </Button>
                    </Link>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium ml-2">{t('common.nav.engage')}</p>
                      <Link to="/engage/persona" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start gap-2 pl-4">
                          <Users className="w-4 h-4" />
                          {t('common.nav.engage_with_another_persona')}
                        </Button>
                      </Link>
                      <Link to="/engage/online" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start gap-2 pl-4">
                          <Globe className="w-4 h-4" />
                          {t('common.nav.engage_online_with_websites')}
                        </Button>
                      </Link>
                      <Link to="/engage/offline" onClick={closeMobileMenu}>
                        <Button variant="ghost" className="w-full justify-start gap-2 pl-4">
                          <Store className="w-4 h-4" />
                          {t('common.nav.engage_offline')}
                        </Button>
                      </Link>
                    </div>
                    
                    <Link to="/social" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Users className="w-4 h-4" />
                        Social
                      </Button>
                    </Link>
                    
                    {user ? (
                      <>
                        <div className="space-y-2">
                          <p className="text-sm font-medium ml-2">Account</p>
                          <Link to="/profile" onClick={closeMobileMenu}>
                            <Button variant="ghost" className="w-full justify-start gap-2 pl-4">
                              <User className="w-4 h-4" />
                              Profile
                            </Button>
                          </Link>
                          <Link to="/explore" onClick={closeMobileMenu}>
                            <Button variant="ghost" className="w-full justify-start gap-2 pl-4">
                              <Users className="w-4 h-4" />
                              Explore Users
                            </Button>
                          </Link>
                          <Link to="/wallet" onClick={closeMobileMenu}>
                            <Button variant="ghost" className="w-full justify-start gap-2 pl-4">
                              <Wallet className="w-4 h-4" />
                              Wallet
                            </Button>
                          </Link>
                          <Link to="/settings" onClick={closeMobileMenu}>
                            <Button variant="ghost" className="w-full justify-start gap-2 pl-4">
                              <Settings className="w-4 h-4" />
                              Settings
                            </Button>
                          </Link>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Link to="/login" onClick={closeMobileMenu}>
                        <Button variant="default" className="w-full justify-start gap-2">
                          <LogIn className="w-4 h-4" />
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </header>
  );
}
