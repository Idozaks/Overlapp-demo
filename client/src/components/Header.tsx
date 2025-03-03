
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  Menu, Globe, LogOut, User, Wallet 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "wouter";
import { useAuth } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="p-4 border-b">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/overlapp-logo.png" alt="Overlapp Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={cn("text-sm font-medium transition-colors hover:text-primary")}>
              {t('common.nav.home')}
            </Link>
            <Link href="/discover" className={cn("text-sm font-medium transition-colors hover:text-primary")}>
              {t('common.nav.discover')}
            </Link>
            <Link href="/about" className={cn("text-sm font-medium transition-colors hover:text-primary")}>
              {t('common.nav.about')}
            </Link>
            <Link href="/demos" className={cn("text-sm font-medium transition-colors hover:text-primary")}>
              {t('common.nav.demo')}
            </Link>
          </nav>

          {/* Authentication */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="hidden md:block">
                  <Button variant="ghost" size="sm">
                    {t('common.nav.dashboard')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate('/profile')}
                  className="hidden md:flex"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('common.auth.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    {t('common.auth.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-4">
                  <Link href="/" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {t('common.nav.home')}
                  </Link>
                  <Link href="/discover" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {t('common.nav.discover')}
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {t('common.nav.about')}
                  </Link>
                  <Link href="/demos" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {t('common.nav.demo')}
                  </Link>
                  
                  {user ? (
                    <>
                      <Link href="/dashboard" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                        {t('common.nav.dashboard')}
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        {t('common.nav.profile')}
                      </Link>
                      <Link href="/wallet" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                        <Wallet className="w-4 h-4" />
                        Wallet
                      </Link>
                      <button 
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded-md text-red-500"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        {t('common.auth.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                        {t('common.auth.login')}
                      </Link>
                      <Link href="/register" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md" onClick={() => setIsMenuOpen(false)}>
                        {t('common.auth.register')}
                      </Link>
                    </>
                  )}
                  
                  <div className="mt-4 border-t pt-4">
                    <LanguageSwitcher />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
