
import * as React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Menu, Home, Sparkles, Mail, Globe, Network } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between p-4 border-b">
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
            <Link href="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              {t('common.nav.home')}
            </Link>
            <Link href="/demo" className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('common.nav.demo')}
            </Link>
            <Link href="/contact" className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              {t('common.nav.contact')}
            </Link>
            <Link href="/analytics/interactions" className="flex items-center">
              <Network className="mr-2 h-4 w-4" />
              {t('common.nav.interactions')}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
