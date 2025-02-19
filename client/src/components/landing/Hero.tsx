import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight, Smartphone } from "lucide-react";
import { useLocation } from "wouter";

export default function Hero() {
  const [, navigate] = useLocation();

  return (
    <div className="relative min-h-[90vh] flex items-center">
      <AnimatedGradient />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Digital Identity,
            <span className="text-primary block mt-2">
              Reimagined
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Seamlessly bridge your digital and physical worlds with AI-powered personalization
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => navigate("/signup")}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate("/demo")}
            >
              View Demo <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}