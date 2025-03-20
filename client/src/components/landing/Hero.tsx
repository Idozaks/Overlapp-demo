import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserCircle, Store, Network, Users, ShoppingBag, Share2 } from "lucide-react";

const slides = [
  {
    title: "common.landing.hero.slide1.title",
    description: "common.landing.hero.slide1.subtitle",
    gradientColors: "from-blue-500 to-purple-500",
    icon: <UserCircle />,
    secondaryIcon: <Users />,
    emoji: "🧑‍💼"
  },
  {
    title: "common.landing.hero.slide2.title",
    description: "common.landing.hero.slide2.subtitle",
    gradientColors: "from-green-500 to-teal-500",
    icon: <Store />,
    secondaryIcon: <ShoppingBag />,
    emoji: "🛍️"
  },
  {
    title: "common.landing.hero.slide3.title",
    description: "common.landing.hero.slide3.subtitle",
    gradientColors: "from-amber-500 to-red-500",
    icon: <Network />,
    secondaryIcon: <Share2 />,
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
              <div className="relative h-full w-full rounded-xl overflow-hidden flex items-center justify-center gap-8 p-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/10 rounded-full p-6"
                >
                  {React.cloneElement(slides[currentSlide].icon, { 
                    className: "w-48 h-48 text-white stroke-[1.5]"
                  })}
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/10 rounded-full p-6"
                >
                  {React.cloneElement(slides[currentSlide].secondaryIcon, { 
                    className: "w-48 h-48 text-white stroke-[1.5]"
                  })}
                </motion.div>
                <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradientColors} opacity-30`} />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* YouTube Video Section */}
        <div className="mt-12 flex flex-col items-center gap-8">
          <motion.div 
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-muted">
              <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/J-ACL_Q2UXw?si=WmLfMHrJxVhNfd1l" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full aspect-video max-w-3xl"
              ></iframe>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-muted">
              <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/yWqN2HUGDZw" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full aspect-video max-w-3xl"
              ></iframe>
            </div>
          </motion.div>

          <motion.div 
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="rounded-xl overflow-hidden shadow-2xl border border-muted">
              <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/Rk7t0TWYNDg?si=bNbaZOgkWQlIIJH2" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full aspect-video max-w-3xl"
              ></iframe>P_LGAMYm0SJM2w_" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full aspect-video max-w-3xl"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}