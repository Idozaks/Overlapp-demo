import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const slides = [
  {
    title: "common.landing.hero.slide1.title",
    description: "common.landing.hero.slide1.subtitle",
    gradientColors: "from-blue-500 to-purple-500",
    scene: "/attached_assets/Personal Profile.png",
    emoji: "🧑‍💼"
  },
  {
    title: "common.landing.hero.slide2.title",
    description: "common.landing.hero.slide2.subtitle",
    gradientColors: "from-green-500 to-teal-500", 
    scene: "/attached_assets/Retail Experience.png",
    emoji: "🛍️"
  },
  {
    title: "common.landing.hero.slide3.title",
    description: "common.landing.hero.slide3.subtitle",
    gradientColors: "from-amber-500 to-red-500",
    scene: "/attached_assets/Business Networking.png",
    emoji: "🤝"
  }
];

export default function Hero() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

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
        <div className={`absolute top-10 right-10 h-64 w-64 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradientColors} opacity-10 blur-3xl`} />
        <div className={`absolute bottom-10 left-10 h-64 w-64 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradientColors} opacity-10 blur-3xl`} />
      </div>

      <div className="container relative z-10 mx-auto grid min-h-[90vh] items-center px-4 py-24 md:py-32">
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
            <motion.div
              key={`cta-${animationKey}-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button size="lg" className="mr-4">
                {t(`common.landing.hero.slide${currentSlide + 1}.cta`)}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          <div className="relative h-[300px] md:h-[450px]">
            <motion.div
              key={`scene-${animationKey}-${currentSlide}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-full w-full rounded-xl overflow-hidden">
                <img
                  src={slides[currentSlide].scene}
                  alt={t(slides[currentSlide].title)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    e.currentTarget.src = '/fallback-image.png';
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradientColors} opacity-20`} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}