import { FC } from "react";
import { useLocation } from "wouter";
import {
  UserGroupIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import WebsiteAnalyzeSection from "@/components/home/WebsiteAnalyzeSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OverlapCard = {
  label: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
};

export const HomeSelector: FC = () => {
  const [, navigate] = useLocation();

  const cards: OverlapCard[] = [
    { label: "Person Nearby",       icon: UserGroupIcon,          onClick: () => navigate("/person-nearby") },
    { label: "Person Online",       icon: ComputerDesktopIcon,    onClick: () => navigate("/person-online") },
    { label: "Website",             icon: GlobeAltIcon,           onClick: () => navigate("/website-overlap") },
    { label: "Store",               icon: BuildingStorefrontIcon, onClick: () => navigate("/store") },
    { label: "Sign / Object",       icon: InformationCircleIcon,  onClick: () => navigate("/sign-object") },
    { label: "Online Service",      icon: Cog6ToothIcon,          onClick: () => navigate("/online-service") },
  ];

  return (
    <main className="min-h-screen p-6 md:p-8 bg-background">
      <h1 className="text-2xl font-bold mb-4">Overlapp Dashboard</h1>
      <p className="text-muted-foreground mb-8">Discover your digital-physical overlap with people, places, and content</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Access Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Overlap Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cards.map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4
                            hover:bg-muted hover:scale-105 transition-all shadow-sm"
                >
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="text-xs font-medium text-center">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Website Analysis Section */}
        <Card>
          <CardContent className="pt-6">
            <WebsiteAnalyzeSection />
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Overlap Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="people" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="people">People</TabsTrigger>
                <TabsTrigger value="places">Places</TabsTrigger>
                <TabsTrigger value="websites">Websites</TabsTrigger>
              </TabsList>
              <TabsContent value="people" className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">No recent people connections found.</p>
              </TabsContent>
              <TabsContent value="places" className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">No recent place visits found.</p>
              </TabsContent>
              <TabsContent value="websites" className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">No recent website analyses found.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Popular Now */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Now in Your Area</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sign in to discover trending locations and events in your area that 
              match your interests.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default HomeSelector;