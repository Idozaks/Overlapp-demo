import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight, Shield, ShoppingBag, Cloud, Globe, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { HiSparkles, HiLockClosed, HiGlobeAlt, HiCube, HiShoppingBag, HiStar } from "react-icons/hi2";

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
      heroIcon: <HiSparkles className="w-16 h-16" />,
      gradientColors: "from-primary/20 via-primary/10 to-transparent",
      route: "/signup"
    },
    {
      id: 2,
      titleKey: "common.landing.hero.slide2.title",
      subtitleKey: "common.landing.hero.slide2.subtitle",
      ctaKey: "common.landing.hero.slide2.cta",
      icon: <Shield className="w-8 h-8" />,
      heroIcon: <HiLockClosed className="w-16 h-16" />,
      gradientColors: "from-blue-500/20 via-blue-500/10 to-transparent",
      route: "/features"
    },
    {
      id: 3,
      titleKey: "common.landing.hero.slide3.title",
      subtitleKey: "common.landing.hero.slide3.subtitle",
      ctaKey: "common.landing.hero.slide3.cta",
      icon: <Globe className="w-8 h-8" />,
      heroIcon: <HiGlobeAlt className="w-16 h-16" />,
      gradientColors: "from-green-500/20 via-green-500/10 to-transparent",
      route: "/features"
    },
    {
      id: 4,
      titleKey: "common.landing.hero.slide4.title",
      subtitleKey: "common.landing.hero.slide4.subtitle",
      ctaKey: "common.landing.hero.slide4.cta",
      icon: <Cloud className="w-8 h-8" />,
      heroIcon: <HiCube className="w-16 h-16" />,
      gradientColors: "from-purple-500/20 via-purple-500/10 to-transparent",
      route: "/demo"
    },
    {
      id: 5,
      titleKey: "common.landing.hero.slide5.title",
      subtitleKey: "common.landing.hero.slide5.subtitle",
      ctaKey: "common.landing.hero.slide5.cta",
      icon: <ShoppingBag className="w-8 h-8" />,
      heroIcon: <HiShoppingBag className="w-16 h-16" />,
      gradientColors: "from-pink-500/20 via-pink-500/10 to-transparent",
      route: "/demo"
    },
    {
      id: 6,
      titleKey: "common.landing.hero.slide6.title",
      subtitleKey: "common.landing.hero.slide6.subtitle",
      ctaKey: "common.landing.hero.slide6.cta",
      icon: <CreditCard className="w-8 h-8" />,
      heroIcon: <HiStar className="w-16 h-16" />,
      gradientColors: "from-yellow-500/20 via-yellow-500/10 to-transparent",
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

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // 8 seconds
    return () => clearInterval(interval);
  }, [currentSlide]); // Reset timer when currentSlide changes

  const handleCTAClick = (route: string) => {
    navigate(route);
  };

  const handlePrevSlide = () => {
    handleSlideChange((currentSlide - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    handleSlideChange((currentSlide + 1) % slides.length);
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
            {/* Hero Icon with Gradient Background */}
            <motion.div 
              className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${slides[currentSlide].gradientColors} p-6 mb-8 backdrop-blur-sm`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-full h-full flex items-center justify-center text-primary">
                {slides[currentSlide].heroIcon}
              </div>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t(slides[currentSlide].titleKey)}
            </motion.h1>

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
                  <div key={index} className="p-6 rounded-lg bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all">
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevSlide}
            className="rounded-full hover:bg-background/80 backdrop-blur-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>

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

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextSlide}
            className="rounded-full hover:bg-background/80 backdrop-blur-sm"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}