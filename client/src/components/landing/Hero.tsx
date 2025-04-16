import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  UserCircle,
  Store,
  Network,
  Users,
  ShoppingBag,
  Share2,
  Globe,
  Search,
  Laptop,
} from "lucide-react";
import MobileUserJourneySimulator from "./MobileUserJourneySimulator";

const slides = [
  {
    title: "common.landing.hero.slide1.title",
    description: "common.landing.hero.slide1.subtitle",
    gradientColors: "from-blue-500 to-purple-500",
    icon: <UserCircle />,
    secondaryIcon: <Users />,
    emoji: "👤",
  },
  {
    title: "common.landing.hero.slide2.title",
    description: "common.landing.hero.slide2.subtitle",
    gradientColors: "from-green-500 to-teal-500",
    icon: <Search />,
    secondaryIcon: <Network />,
    emoji: "🔍",
  },
  {
    title: "common.landing.hero.slide3.title",
    description: "common.landing.hero.slide3.subtitle",
    gradientColors: "from-amber-500 to-red-500",
    icon: <Globe />,
    secondaryIcon: <Laptop />,
    emoji: "🌐",
  },
];

export default function Hero() {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const isHebrew = i18n.language === 'he';

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prevKey) => prevKey + 1);
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Background gradient squares */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className={`absolute top-10 right-10 h-64 w-64 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradientColors} opacity-10 blur-3xl`}
        />
        <div
          className={`absolute bottom-10 left-10 h-64 w-64 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradientColors} opacity-10 blur-3xl`}
        />
      </div>

      <div className="container relative z-10 mx-auto grid items-center px-4 py-24 md:py-32">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="flex flex-col space-y-6">
            <motion.h1
              className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl"
              key={`title-${animationKey}-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {slides[currentSlide].emoji} {t(slides[currentSlide].title)}
            </motion.h1>
            <motion.p
              key={`desc-${animationKey}-${currentSlide}`}
              className="max-w-[600px] text-lg text-muted-foreground md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t(slides[currentSlide].description)}
            </motion.p>
            
            {isHebrew && currentSlide === 0 && (
              <motion.p
                key={`full-desc-${animationKey}`}
                className="max-w-[600px] text-sm text-muted-foreground md:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t("common.landing.hero.description")}
              </motion.p>
            )}
            
            <motion.div
              key={`cta-${animationKey}-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: isHebrew ? 0.3 : 0.2 }}
            >
              <Button size="lg" className="mr-4">
                {t(`common.landing.hero.slide${currentSlide + 1}.cta`)}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          
          {/* Mobile Device Simulator - replaces the YouTube video */}
          <div className="relative flex justify-center items-center">
            <MobileUserJourneySimulator 
              autoPlay={true} 
              loop={true} 
              className="max-w-full"
            />
          </div>
        </div>

        {/* Interactive Demo Section - Below the hero content */}
        <div className="mt-20 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              See Overlapp in Action
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <a href="/demo">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="py-6 px-8 w-full md:w-auto flex flex-col items-center gap-2"
                >
                  <Users className="h-6 w-6" />
                  <span>Social Discovery</span>
                </Button>
              </a>
              <a href="/demo">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="py-6 px-8 w-full md:w-auto flex flex-col items-center gap-2"
                >
                  <Store className="h-6 w-6" />
                  <span>Digital-Physical Integration</span>
                </Button>
              </a>
              <a href="/demo">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="py-6 px-8 w-full md:w-auto flex flex-col items-center gap-2"
                >
                  <UserCircle className="h-6 w-6" />
                  <span>Identity Management</span>
                </Button>
              </a>
              <a href="/demo">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="py-6 px-8 w-full md:w-auto flex flex-col items-center gap-2"
                >
                  <ShoppingBag className="h-6 w-6" />
                  <span>Marketplace Engagement</span>
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
