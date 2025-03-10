import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Create a digital profile in seconds",
      subtitle: "Quick and easy setup to express your true interests and preferences",
      ctaText: "Get Started",
      gradientColors: "from-primary/20 via-primary/10 to-transparent",
      route: "/signup",
      animation: {
        type: "profile",
        duration: 2
      }
    },
    {
      id: 2,
      title: "Find the most accurate matches",
      subtitle: "Discover precise matches in all areas of life that align with your interests",
      ctaText: "Explore Matches",
      gradientColors: "from-blue-500/20 via-blue-500/10 to-transparent",
      route: "/demo",
      animation: {
        type: "matching",
        duration: 2.5
      }
    },
    {
      id: 3,
      title: "Quick overlap check with new people",
      subtitle: "Meeting someone new? Find your common interests in seconds!",
      ctaText: "Try It Now",
      gradientColors: "from-green-500/20 via-green-500/10 to-transparent",
      route: "/demo",
      animation: {
        type: "overlap",
        duration: 1.5
      }
    },
    {
      id: 4,
      title: "Smart online shopping experience",
      subtitle: "Online stores will show you exactly what matches your interests - no more guesswork!",
      ctaText: "See How It Works",
      gradientColors: "from-purple-500/20 via-purple-500/10 to-transparent",
      route: "/demo",
      animation: {
        type: "online-store",
        duration: 2
      }
    },
    {
      id: 5,
      title: "Smart physical shopping",
      subtitle: "Get personalized recommendations in stores and restaurants instantly",
      ctaText: "Learn More",
      gradientColors: "from-yellow-500/20 via-yellow-500/10 to-transparent",
      route: "/demo",
      animation: {
        type: "physical-store",
        duration: 2
      }
    }
  ];

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 20000); // 20 seconds per slide
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleCTAClick = (route: string) => {
    navigate(route);
  };

  // Animation variants for each slide type
  const getAnimationVariants = (type: string) => {
    switch (type) {
      case "profile":
        return {
          animate: {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            transition: { repeat: Infinity, duration: 2 }
          }
        };
      case "matching":
        return {
          animate: {
            x: [0, 20, -20, 0],
            transition: { repeat: Infinity, duration: 2.5 }
          }
        };
      case "overlap":
        return {
          animate: {
            scale: [1, 1.2, 1],
            transition: { repeat: Infinity, duration: 1.5 }
          }
        };
      case "online-store":
        return {
          animate: {
            y: [0, -10, 0],
            transition: { repeat: Infinity, duration: 2 }
          }
        };
      case "physical-store":
        return {
          animate: {
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 2 }
          }
        };
      default:
        return {};
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      <AnimatedGradient />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
        >
          Overlap - Your way to truly connect with what interests you!
        </motion.h1>

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
              className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${slides[currentSlide].gradientColors} p-6 mb-8 backdrop-blur-sm flex items-center justify-center`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-5xl">
                {currentSlide === 0 ? "🛍️" : 
                 currentSlide === 1 ? "📱" : 
                 currentSlide === 2 ? "🤝" : "🔍"}
              </span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slides[currentSlide].title}
            </motion.h2>

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