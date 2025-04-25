import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SimplifiedEngage() {
  const { t } = useTranslation();

  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simplified Engage</h1>
        <p className="text-muted-foreground">
          A stripped-down version for testing
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Test Card
          </CardTitle>
          <CardDescription>
            This is a test card to verify loading
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg" className="gap-2">
            <MapPin className="h-5 w-5" />
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimplifiedEngage;