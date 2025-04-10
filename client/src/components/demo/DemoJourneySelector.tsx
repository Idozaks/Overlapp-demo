import React from 'react';
import { useDemo, JourneyType } from '@/hooks/use-demo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Map, 
  UserCircle, 
  ShoppingBag, 
  Play,
  ArrowRight 
} from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

interface JourneyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: JourneyType;
  progress?: number;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ 
  title, 
  description, 
  icon, 
  type, 
  progress = 0
}) => {
  const { startJourney } = useDemo();
  const [, navigate] = useLocation();
  
  const handleStartJourney = () => {
    startJourney(type);
    
    // Determine the first page to navigate to based on journey type
    const firstPageMap: Record<JourneyType, string> = {
      socialDiscovery: '/social',
      physicalIntegration: '/marketplace',
      identityManagement: '/profile/1/edit',
      marketplace: '/marketplace'
    };
    
    navigate(firstPageMap[type]);
  };
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              {icon}
            </div>
            {progress > 0 && (
              <div className="text-xs px-2 py-1 bg-secondary/20 rounded-full">
                {progress}% Complete
              </div>
            )}
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Experience a guided tour that showcases the key features of this journey.</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleStartJourney} 
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Journey
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface DemoJourneySelectorProps {
  className?: string;
}

export const DemoJourneySelector: React.FC<DemoJourneySelectorProps> = ({
  className = ''
}) => {
  const { isDemoMode, toggleDemoMode } = useDemo();
  const [, navigate] = useLocation();
  
  // Description content for each journey type
  const journeyDescriptions: Record<JourneyType, { title: string; description: string; icon: React.ReactNode }> = {
    socialDiscovery: {
      title: 'Social Discovery',
      description: 'Connect with like-minded individuals based on shared interests and values',
      icon: <Users className="h-6 w-6 text-primary" />
    },
    physicalIntegration: {
      title: 'Digital-Physical Integration',
      description: 'Bridge your digital identity with real-world experiences',
      icon: <Map className="h-6 w-6 text-primary" />
    },
    identityManagement: {
      title: 'Identity Management',
      description: 'Take control of your digital identity across platforms',
      icon: <UserCircle className="h-6 w-6 text-primary" />
    },
    marketplace: {
      title: 'Marketplace Engagement',
      description: 'Discover products and services aligned with your identity',
      icon: <ShoppingBag className="h-6 w-6 text-primary" />
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Interactive Demo Experiences</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a journey to experience Overlapp's key features through guided, 
          interactive tours with simulated user activities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.entries(journeyDescriptions).map(([type, info]) => (
          <JourneyCard
            key={type}
            title={info.title}
            description={info.description}
            icon={info.icon}
            type={type as JourneyType}
            // Get progress from localStorage if exists
            progress={(() => {
              try {
                const saved = localStorage.getItem('overlappDemoState');
                if (saved) {
                  const { currentJourney, currentStep, totalSteps } = JSON.parse(saved);
                  if (currentJourney === type && totalSteps) {
                    return Math.round((currentStep / totalSteps) * 100);
                  }
                }
                return 0;
              } catch (e) {
                return 0;
              }
            })()}
          />
        ))}
      </div>
      
      <div className="text-center mt-10">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mx-auto"
        >
          Return to Homepage
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DemoJourneySelector;