
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Link as LinkIcon, Share2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function EngageOnline() {
  const { t } = useTranslation();

  return (
    <div className="container py-12 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">{t('engage.online.title')}</h1>
        <p className="text-muted-foreground">
          {t('engage.online.description')}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {t('engage.online.enter_website')}
          </CardTitle>
          <CardDescription>
            {t('engage.online.website_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="https://example.com" />
            <Button>{t('engage.online.analyze')}</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              {t('engage.online.share_profile')}
            </CardTitle>
            <CardDescription>
              {t('engage.online.share_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              {t('engage.online.create_share_link')}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {t('engage.online.recent_websites')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            {t('engage.online.no_recent_websites')}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EngageOnline;
