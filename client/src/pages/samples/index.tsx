import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { BookOpen, Dumbbell, Code, Users } from 'lucide-react';

/**
 * Sample Sites Page
 * 
 * This page allows visitors to browse and access different sample websites
 * that demonstrate the OverlapLite widget in various contexts.
 */
const SampleSitesPage: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<string>('');
  
  const sampleSites = [
    {
      id: 'bookclub',
      name: 'BookClub Community',
      description: 'A literature-focused community with interests in fiction genres, authors, and reading habits.',
      icon: <BookOpen className="w-12 h-12 text-amber-500" />,
      color: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-800',
      path: '/samples/bookclub'
    },
    {
      id: 'fitness',
      name: 'Fitness Studio',
      description: 'A fitness community with interests in workout types, nutrition, and wellness goals.',
      icon: <Dumbbell className="w-12 h-12 text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-800',
      path: '/samples/fitness'
    },
    {
      id: 'techstartup',
      name: 'Tech Startup',
      description: 'A professional community with interests in programming languages, design tools, and industry trends.',
      icon: <Code className="w-12 h-12 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      path: '/samples/techstartup'
    },
    {
      id: 'neighborhood',
      name: 'Local Neighborhood',
      description: 'A community organization with interests in local events, hobbies, and civic involvement.',
      icon: <Users className="w-12 h-12 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-800',
      path: '/samples/neighborhood'
    }
  ];

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">OverlapLite Demo Websites</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore these sample websites to see the OverlapLite widget in action in different contexts.
          Each site demonstrates how the widget adapts to different community profiles.
        </p>
      </div>
      
      <div className="mb-6 md:hidden">
        <Select
          value={selectedSite}
          onValueChange={(value) => setSelectedSite(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a sample website" />
          </SelectTrigger>
          <SelectContent>
            {sampleSites.map(site => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedSite && (
          <div className="mt-4 flex justify-center">
            <Button asChild size="lg">
              <Link to={sampleSites.find(s => s.id === selectedSite)?.path || '#'}>
                Visit {sampleSites.find(s => s.id === selectedSite)?.name}
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 hidden md:grid">
        {sampleSites.map(site => (
          <Card key={site.id} className={`border-2 ${site.color} overflow-hidden transition-all hover:shadow-md`}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-lg bg-white border">
                {site.icon}
              </div>
              <div>
                <CardTitle className={site.textColor}>{site.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base min-h-[60px]">
                {site.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={site.path}>Visit Website</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SampleSitesPage;