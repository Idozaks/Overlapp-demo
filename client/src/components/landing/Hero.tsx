
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function Hero() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      title: "common.landing.hero.title_1",
      description: "common.landing.hero.description_1",
      gradientColors: "from-pink-500 to-orange-400",
    },
    {
      title: "common.landing.hero.title_2",
      description: "common.landing.hero.description_2",
      gradientColors: "from-blue-500 to-teal-400",
    },
    {
      title: "common.landing.hero.title_3",
      description: "common.landing.hero.description_3",
      gradientColors: "from-purple-500 to-indigo-400",
    },
    {
      title: "common.landing.hero.title_4",
      description: "common.landing.hero.description_4",
      gradientColors: "from-amber-500 to-red-400",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50 z-0" />

      {/* Content container */}
      <div className="container mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left content */}
        <div className="flex flex-col space-y-6">
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
                <div className="flex flex-row gap-2 text-5xl">
                  {currentSlide === 0 ? (
                    <>
                      <span>🛍️</span>
                      <span>🧠</span>
                    </>
                  ) : currentSlide === 1 ? (
                    <>
                      <span>📱</span>
                      <span>🔍</span>
                    </>
                  ) : currentSlide === 2 ? (
                    <>
                      <span>🤝</span>
                      <span>🤖</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>💡</span>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t(slides[currentSlide].title)}
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t(slides[currentSlide].description)}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" asChild>
              <Link to={user ? "/explore" : "/register"}>
                {t("common.landing.get_started")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">{t("common.landing.learn_more")}</Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex -space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 border-background flex items-center justify-center bg-gradient-to-br",
                    i === 0
                      ? "from-pink-500 to-orange-400"
                      : i === 1
                      ? "from-blue-500 to-teal-400"
                      : i === 2
                      ? "from-purple-500 to-indigo-400"
                      : "from-amber-500 to-red-400"
                  )}
                >
                  <span className="text-xs text-white font-medium">
                    {["A", "B", "C", "D"][i]}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("common.landing.user_count", { count: "1,234" })}
            </p>
          </motion.div>
        </div>

        {/* Right content - Mobile Mockup */}
        <div className="hidden lg:flex items-center justify-center">
          <motion.div
            className="relative w-[280px] h-[580px] rounded-[3rem] border-8 border-foreground bg-background overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Phone notch */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-foreground z-10 flex justify-center items-end">
              <div className="w-36 h-4 rounded-b-xl bg-foreground"></div>
            </div>

            {/* Phone screen */}
            <div className="w-full h-full pt-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
              <div className="p-4 space-y-4">
                {/* Mock app content */}
                <div className="h-12 rounded-lg bg-white/10"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-32 rounded-lg bg-white/5"></div>
                  <div className="h-32 rounded-lg bg-white/5"></div>
                </div>
                <div className="h-40 rounded-lg bg-white/10"></div>
                <div className="h-16 rounded-lg bg-white/5"></div>
                <div className="h-16 rounded-lg bg-white/5"></div>
                <div className="h-16 rounded-lg bg-white/5"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="w-8 h-12 rounded-full border-2 border-primary flex items-center justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="w-1.5 h-3 bg-primary rounded-full"
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
