import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next"; //Using the standard i18next hook
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";

const slides = [
  {
    title: "common.landing.hero.slide1.title",
    description: "common.landing.hero.slide1.subtitle",
    gradientColors: "from-blue-500 to-purple-500",
    scene: "personal-profile"
  },
  {
    title: "common.landing.hero.slide2.title",
    description: "common.landing.hero.slide2.subtitle",
    gradientColors: "from-green-500 to-teal-500",
    scene: "retail-experience"
  },
  {
    title: "common.landing.hero.slide3.title",
    description: "common.landing.hero.slide3.subtitle",
    gradientColors: "from-amber-500 to-red-500",
    scene: "business-networking"
  }
];

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<any>(null);
  const currentIndex = useRef(0);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      api?.scrollNext();
    }, 20000); // 20 seconds per slide for longer viewing time

    return () => clearInterval(interval);
  }, [api]);

  const changeSlide = (index: number) => {
    setCurrentSlide(index);
    currentIndex.current = index;
    // Reset animation state when slide changes
    setAnimationKey(prevKey => prevKey + 1);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-background/90 pt-20">
      <div className="container mx-auto px-4 py-12 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t(slides[currentSlide].title)}
          </motion.h1>
          <motion.p
            key={`desc-${animationKey}-${currentSlide}`}
            className="text-xl md:text-2xl text-foreground/80 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t(slides[currentSlide].description)}
          </motion.p>

          <motion.div
            className="flex justify-center gap-2 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => changeSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-primary scale-110"
                    : "bg-primary/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all duration-300"
            >
              {t('common.landing.hero.slide1.cta')} <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
              asChild
            >
              <Link to="/about">
                {t('common.landing.hero.slide2.cta')} <Search className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Subtitle Section */}
        <motion.div 
          className="mt-16 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-lg md:text-xl mb-6 font-medium">
            {t('common.landing.hero.subtitle')} {/* Added translation key */}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-lg bg-background/50 border border-border/50 shadow-sm">
              <p className="text-md">{t('common.landing.hero.subtitle1')}</p> {/* Added translation key */}
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50 shadow-sm">
              <p className="text-md">{t('common.landing.hero.subtitle2')}</p> {/* Added translation key */}
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50 shadow-sm">
              <p className="text-md">{t('common.landing.hero.subtitle3')}</p> {/* Added translation key */}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}