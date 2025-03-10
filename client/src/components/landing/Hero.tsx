import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight, Users, Sparkles, Store, Navigation } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { HiSparkles, HiUserGroup, HiGlobeAlt, HiShoppingBag } from "react-icons/hi2";

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Create your digital persona!",
      subtitle: "Express yourself authentically and let AI enrich your profile to discover perfect matches in all areas of life.",
      ctaText: "Get Started",
      icon: <HiSparkles className="w-16 h-16" />,
      gradientColors: "from-primary/20 via-primary/10 to-transparent",
      route: "/signup"
    },
    {
      id: 2,
      title: "Find precise matches",
      subtitle: "Build a profile that truly represents you and find matches that align with your authentic interests.",
      ctaText: "Discover More",
      icon: <HiUserGroup className="w-16 h-16" />,
      gradientColors: "from-blue-500/20 via-blue-500/10 to-transparent",
      route: "/features"
    },
    {
      id: 3,
      title: "Connect real preferences",
      subtitle: "Meet someone new? Perform a quick overlap check and discover common interests in seconds!",
      ctaText: "Try Demo",
      icon: <HiGlobeAlt className="w-16 h-16" />,
      gradientColors: "from-green-500/20 via-green-500/10 to-transparent",
      route: "/demo"
    },
    {
      id: 4,
      title: "Self-expression and AI enrichment",
      subtitle: "Enter restaurants and stores to instantly find products that match your preferences.",
      ctaText: "See How It Works",
      icon: <HiShoppingBag className="w-16 h-16" />,
      gradientColors: "from-purple-500/20 via-purple-500/10 to-transparent",
      route: "/demo"
    }
  ];

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

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
            <motion.div
              className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${slides[currentSlide].gradientColors} p-6 mb-8 backdrop-blur-sm`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-full h-full flex items-center justify-center text-primary">
                {slides[currentSlide].icon}
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-24"
            >
              <Button
                size="lg"
                onClick={() => handleCTAClick(slides[currentSlide].route)}
                className="gap-2"
              >
                {slides[currentSlide].ctaText}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? "bg-primary w-4" : "bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}