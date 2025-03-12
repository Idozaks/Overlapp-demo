
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Globe, Map } from 'lucide-react';

export function EngageIndex() {
  const { t } = useTranslation();

  const engagementOptions = [
    {
      title: "Engage with another persona",
      description: "Meet someone new and discover shared interests instantly",
      icon: <Users className="h-8 w-8 text-primary" />,
      path: "/engage/persona"
    },
    {
      title: "Engage online with websites",
      description: "Get personalized content from websites based on your profile",
      icon: <Globe className="h-8 w-8 text-primary" />,
      path: "/engage/online"
    },
    {
      title: "Engage offline",
      description: "Discover places and products that match your preferences in the real world",
      icon: <Map className="h-8 w-8 text-primary" />,
      path: "/engage/offline"
    }
  ];

  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('engage.title')}</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t('engage.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {engagementOptions.map((option, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="mb-4">{option.icon}</div>
              <CardTitle>{t(`engage.${option.title.toLowerCase().replace(/\s+/g, '_')}`)}</CardTitle>
              <CardDescription>
                {t(`engage.${option.title.toLowerCase().replace(/\s+/g, '_')}_desc`)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{option.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={option.path}>
                  {t('engage.start')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default EngageIndex;
