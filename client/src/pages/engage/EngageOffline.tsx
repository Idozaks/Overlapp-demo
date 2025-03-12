
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Utensils, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EngageOffline() {
  const { t } = useTranslation();

  const categories = [
    {
      title: 'Restaurants',
      icon: <Utensils className="h-10 w-10 text-primary" />,
      description: 'Find restaurants with menus that match your preferences'
    },
    {
      title: 'Retail Stores',
      icon: <ShoppingCart className="h-10 w-10 text-primary" />,
      description: 'Discover products that interest you in nearby stores'
    }
  ];

  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">{t('engage.offline.title')}</h1>
        <p className="text-muted-foreground">
          {t('engage.offline.description')}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('engage.offline.scan_location')}
          </CardTitle>
          <CardDescription>
            {t('engage.offline.scan_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg" className="gap-2">
            <MapPin className="h-5 w-5" />
            {t('engage.offline.scan_nearby')}
          </Button>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mt-8">{t('engage.offline.categories')}</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {category.icon}
              </div>
              <CardTitle className="text-center">
                {t(`engage.offline.${category.title.toLowerCase().replace(/\s+/g, '_')}`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{category.description}</p>
              <Button variant="outline" className="w-full">
                {t('engage.offline.explore')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-muted rounded-lg p-6 mt-8">
        <h3 className="font-medium mb-2">{t('engage.offline.coming_soon')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('engage.offline.coming_soon_description')}
        </p>
      </div>
    </div>
  );
}

export default EngageOffline;
