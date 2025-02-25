import { Menu, Home, Sparkles, Mail, Globe, Network } from 'lucide-react';
// ... other imports

// ... other code

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

// ... rest of the code