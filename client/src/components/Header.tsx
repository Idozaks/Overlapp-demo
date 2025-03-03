import * as React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Menu, Home, Sparkles, Mail, Globe, Network, Users, Compass, Wallet } from 'lucide-react'; // Added imports for new icons
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="flex items-center"> 
        <img src="/overlapp-logo.png" alt="Overlapp Logo" className="h-12" />
      </Link>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/">
              <NavigationMenuLink>
                {t('common.nav.home')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/demo">
              <NavigationMenuLink>
                {t('common.nav.demo')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/contact">
              <NavigationMenuLink>
                {t('common.nav.contact')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/analytics/interactions">
              <NavigationMenuLink>
                {t('common.nav.interactions')}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
              <Home className="w-4 h-4" />
              {t('common.nav.home')}
            </Link>
            <Link href="/demo" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
              <Sparkles className="w-4 h-4" />
              {t('common.nav.demo')}
            </Link>
            <Link href="/contact" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
              <Mail className="w-4 h-4" />
              {t('common.nav.contact')}
            </Link>
            <Link href="/analytics/interactions" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
              <Network className="w-4 h-4" />
              {t('common.nav.interactions')}
            </Link>
            <Link href="/social" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
              <Users className="w-4 h-4" />
              Social
            </Link>
            <Link href="/explore" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            <Link href="/wallet" className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
              <Wallet className="w-4 h-4" />
              Wallet
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}