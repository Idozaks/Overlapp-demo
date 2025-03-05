import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight, Shield, ShoppingBag, Brain, Globe, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      titleKey: "common.landing.hero.slide1.title",
      subtitleKey: "common.landing.hero.slide1.subtitle",
      ctaKey: "common.landing.hero.slide1.cta",
      icon: <Globe className="w-8 h-8" />,
      route: "/signup"
    },
    {
      id: 2,
      titleKey: "common.landing.hero.slide2.title",
      subtitleKey: "common.landing.hero.slide2.subtitle",
      ctaKey: "common.landing.hero.slide2.cta",
      icon: <Shield className="w-8 h-8" />,
      route: "/features"
    },
    {
      id: 3,
      titleKey: "common.landing.hero.slide3.title",
      subtitleKey: "common.landing.hero.slide3.subtitle",
      ctaKey: "common.landing.hero.slide3.cta",
      icon: <Globe className="w-8 h-8" />,
      route: "/features"
    },
    {
      id: 4,
      titleKey: "common.landing.hero.slide4.title",
      subtitleKey: "common.landing.hero.slide4.subtitle",
      ctaKey: "common.landing.hero.slide4.cta",
      icon: <Brain className="w-8 h-8" />,
      route: "/demo"
    },
    {
      id: 5,
      titleKey: "common.landing.hero.slide5.title",
      subtitleKey: "common.landing.hero.slide5.subtitle",
      ctaKey: "common.landing.hero.slide5.cta",
      icon: <ShoppingBag className="w-8 h-8" />,
      route: "/demo"
    },
    {
      id: 6,
      titleKey: "common.landing.hero.slide6.title",
      subtitleKey: "common.landing.hero.slide6.subtitle",
      ctaKey: "common.landing.hero.slide6.cta",
      icon: <CreditCard className="w-8 h-8" />,
      route: "/signup",
      pricing: [
        { 
          nameKey: "common.landing.pricing.basic.name",
          descriptionKey: "common.landing.pricing.basic.description",
          priceKey: "common.landing.pricing.basic.price"
        },
        { 
          nameKey: "common.landing.pricing.premium.name",
          descriptionKey: "common.landing.pricing.premium.description",
          priceKey: "common.landing.pricing.premium.price"
        },
        { 
          nameKey: "common.landing.pricing.enterprise.name",
          descriptionKey: "common.landing.pricing.enterprise.description",
          priceKey: "common.landing.pricing.enterprise.price"
        }
      ]
    }
  ];

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
                {t(slides[currentSlide].titleKey)}
              </motion.h1>
            </div>

            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t(slides[currentSlide].subtitleKey)}
            </motion.p>

            {currentSlide === 5 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {slides[5].pricing.map((plan, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <h3 className="font-semibold mb-2">{t(plan.nameKey)}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{t(plan.descriptionKey)}</p>
                    <p className="font-bold">{t(plan.priceKey)}</p>
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
                {t(slides[currentSlide].ctaKey)}
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