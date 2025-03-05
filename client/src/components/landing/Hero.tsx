import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight, Shield, ShoppingBag, Brain, Globe, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    title: "Your Digital Identity, Reimagined",
    subtitle: "Seamlessly bridge your digital and physical worlds with AI-powered personalization.",
    cta: "Get Started",
    icon: <Globe className="w-8 h-8" />,
    route: "/signup"
  },
  {
    id: 2,
    title: "Secure & Future-Ready",
    subtitle: "Control your identity with quantum-resistant encryption and advanced privacy controls.",
    cta: "Learn More",
    icon: <Shield className="w-8 h-8" />,
    route: "/features"
  },
  {
    id: 3,
    title: "Seamless Physical Integration",
    subtitle: "Merge real-world interactions with smart location-based features for on-the-spot convenience.",
    cta: "Explore Features",
    icon: <Globe className="w-8 h-8" />,
    route: "/features"
  },
  {
    id: 4,
    title: "Personalized AI Insights",
    subtitle: "Get real-time recommendations, curated product suggestions, and data-driven tips.",
    cta: "See How It Works",
    icon: <Brain className="w-8 h-8" />,
    route: "/demo"
  },
  {
    id: 5,
    title: "Experience AR Shopping",
    subtitle: "Instantly discover prices, reviews, and personalized offers just by pointing your camera.",
    cta: "Try the Demo",
    icon: <ShoppingBag className="w-8 h-8" />,
    route: "/demo"
  },
  {
    id: 6,
    title: "Choose Your Experience",
    subtitle: "Unlock the full potential of Overlapp with our flexible plans.",
    cta: "Sign Up",
    icon: <CreditCard className="w-8 h-8" />,
    route: "/signup",
    pricing: [
      { name: "Basic", description: "Essential features for digital identity management", price: "Free" },
      { name: "Premium", description: "Full AR + AI personalization", price: "Premium" },
      { name: "Enterprise", description: "Custom solutions for advanced needs", price: "Custom" }
    ]
  }
];

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCTAClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      <AnimatedGradient />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              {slides[currentSlide].icon}
              <motion.h1 
                className="text-4xl md:text-6xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
            </div>

            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            {currentSlide === 5 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {slides[5].pricing.map((plan, index) => (
                  <div key={plan.name} className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <h3 className="font-semibold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    <p className="font-bold">{plan.price}</p>
                  </div>
                ))}
              </motion.div>
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                onClick={() => handleCTAClick(slides[currentSlide].route)}
                className="gap-2"
              >
                {slides[currentSlide].cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? "bg-primary w-4" : "bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}