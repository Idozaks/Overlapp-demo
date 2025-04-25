import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, RefreshCw } from 'lucide-react';

export function SimplifiedWidget() {
  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simplified Widget</h1>
        <p className="text-muted-foreground">
          A stripped-down version for testing
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Test Widget
          </CardTitle>
          <CardDescription>
            This is a test widget to verify loading
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg" className="gap-2">
            <RefreshCw className="h-5 w-5" />
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimplifiedWidget;