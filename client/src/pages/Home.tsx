import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ARDemo from "@/components/landing/ARDemo";
import RetailerDemo from "@/components/landing/RetailerDemo";
import PremiumFeatures from "@/components/landing/PremiumFeatures";
import OverlappAnimation from "@/components/landing/OverlappAnimation";
import PhysicalDigitalOverlap from "@/components/landing/PhysicalDigitalOverlap";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Connection visualization */}
      <div className="py-8 md:py-16 bg-gradient-to-b from-background to-background/90">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Visualizing <span className="text-primary">Connections</span>
          </h2>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Overlapp discovers meaningful connections between people, businesses, and interests, 
            creating a network of shared experiences.
          </p>
          <OverlappAnimation className="mt-8" />
        </div>
      </div>
      
      <BenefitsSection />
      <Features />
      
      {/* Physical-Digital Overlap Visualization */}
      <div className="py-8 md:py-16 bg-gradient-to-b from-background/90 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Where <span className="text-primary">Digital</span> Meets <span className="gradient-text gradient-primary">Physical</span>
          </h2>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover how your digital identity connects with real-world experiences,
            revealing new opportunities and connections.
          </p>
          <PhysicalDigitalOverlap className="mt-8" />
        </div>
      </div>
      
      <ARDemo />
      <RetailerDemo />
      <PremiumFeatures />
    </div>
  );
}