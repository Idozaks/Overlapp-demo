
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Scan, Users } from 'lucide-react';

export function EngagePersona() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');

  return (
    <div className="container py-12 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {t('engage.persona.title')}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('engage.persona.card_title')}</CardTitle>
          <CardDescription>
            {t('engage.persona.card_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="username" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="username" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{t('engage.persona.by_username')}</span>
              </TabsTrigger>
              <TabsTrigger value="qrcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span>{t('engage.persona.show_qr')}</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                <span>{t('engage.persona.scan_qr')}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="username">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder={t('engage.persona.enter_username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={!username.trim()}>
                  {t('engage.persona.find_persona')}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="qrcode">
              <div className="flex flex-col items-center space-y-4">
                <div className="border border-border w-64 h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">{t('engage.persona.your_qr_code')}</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t('engage.persona.qr_description')}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="scan">
              <div className="flex flex-col items-center space-y-4">
                <div className="border border-border w-64 h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">{t('engage.persona.camera_placeholder')}</p>
                </div>
                <Button>
                  {t('engage.persona.start_scanning')}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  {t('engage.persona.scan_description')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default EngagePersona;
