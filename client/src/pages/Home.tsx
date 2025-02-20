import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import VennDiagram from "@/components/landing/VennDiagram";
import ARDemo from "@/components/landing/ARDemo";
import RetailerDemo from "@/components/landing/RetailerDemo";
import PremiumFeatures from "@/components/landing/PremiumFeatures";
import PhygitalAI from "@/components/landing/PhygitalAI"; // Import the new component

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <PhygitalAI />
      <VennDiagram />
      <ARDemo />
      <RetailerDemo />
      <PremiumFeatures />
    </div>
  );
}