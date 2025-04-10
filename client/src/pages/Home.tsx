import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ARDemo from "@/components/landing/ARDemo";
import RetailerDemo from "@/components/landing/RetailerDemo";
import PremiumFeatures from "@/components/landing/PremiumFeatures";
import EnhancedOverlappAnimation from "@/components/landing/EnhancedOverlappAnimation";

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
      
      <BenefitsSection />
      <Features />
      
      <ARDemo />
      <RetailerDemo />
      <PremiumFeatures />
    </div>
  );
}