import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ARDemo from "@/components/landing/ARDemo";
import RetailerDemo from "@/components/landing/RetailerDemo";
import PremiumFeatures from "@/components/landing/PremiumFeatures";
import EnhancedOverlappAnimation from "@/components/landing/EnhancedOverlappAnimation";
// Import new components based on the Overlapp Strategy Overview
import MarketStrategy from "@/components/landing/MarketStrategy";
import UXPrinciples from "@/components/landing/UXPrinciples";
import MonetizationStrategies from "@/components/landing/MonetizationStrategies";
import BrandingCopy from "@/components/landing/BrandingCopy";
import CallToAction from "@/components/landing/CallToAction";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Connection visualization - Hidden on mobile */}
      <div className="hidden md:block py-8 md:py-16 bg-gradient-to-b from-background to-background/90">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Visualizing <span className="text-primary">Connections</span>
          </h2>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Overlapp discovers meaningful connections between people, businesses, and interests, 
            creating a network of shared experiences.
          </p>
          <div className="mb-8">
            <EnhancedOverlappAnimation className="mt-8" />
          </div>
        </div>
      </div>
      
      {/* Mobile-only text version of the connections section */}
      <div 
        className="block md:hidden py-8 bg-gradient-to-b from-background to-background/90"
        style={{ touchAction: 'auto', pointerEvents: 'auto' }}
      >
        {/* Significantly reduced height for mobile */}
        <div className="container mx-auto px-4 py-2">
          <h2 className="text-2xl font-bold text-center mb-2">
            Visualizing <span className="text-primary">Connections</span>
          </h2>
          <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto mb-2">
            Discover meaningful connections between people, businesses, and interests
          </p>
          <div className="text-center mb-2">
            <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-md">
              Visualization available on desktop
            </span>
          </div>
        </div>
      </div>
      
      {/* Market strategy section from the Overlapp Strategy Overview */}
      <MarketStrategy />
      
      <BenefitsSection />
      <Features />
      
      {/* Monetization strategies section from the Overlapp Strategy Overview */}
      <MonetizationStrategies />
      
      {/* UX/UI Design Principles from the Overlapp Strategy Overview */}
      <UXPrinciples />
      
      <ARDemo />
      <RetailerDemo />
      
      {/* Branding & Copywriting section from the Overlapp Strategy Overview */}
      <BrandingCopy />
      
      <PremiumFeatures />
      
      {/* Conference Simulation Preview Section */}
      <div className="py-16 bg-gradient-to-b from-background/80 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Experience <span className="text-primary">Neural Connections</span> in Action
          </h2>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            See how Overlapp's core technology creates meaningful connections between individuals
            in a simulated conference environment.
          </p>
          <div className="flex justify-center mt-8">
            <Link href="/conference-simulation">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Try The Interactive Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Call to Action section from the Overlapp Strategy Overview */}
      <CallToAction />
    </div>
  );
}