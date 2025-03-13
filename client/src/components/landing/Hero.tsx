import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import React, { useState, useEffect, useCallback } from "react";
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Link } from 'wouter';


const slides = [
  {
    title: "Discover what truly connects you!",
    description: "Create a digital profile, let AI enhance it, and explore the many ways your interests align with others.",
    gradientColors: "from-blue-500 to-purple-500"
  },
  {
    title: "Turn your real preferences into real connections.",
    description: "Find meaningful matches effortlessly.",
    gradientColors: "from-green-500 to-teal-500"
  },
  {
    title: "Build a profile that reflects you.",
    description: "Discover precise matches across every aspect of life.",
    gradientColors: "from-amber-500 to-red-500"
  }
];

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      api?.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

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
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
        >
          Overlap - Your way to truly connect with what interests you!
        </motion.h1>

        <Carousel 
          className="relative w-full max-w-5xl mx-auto"
          opts={{
            align: "center",
            loop: true,
          }}
          setApi={(api) => {
            setApi(api);
          }}
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="flex flex-col items-center justify-center">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-3xl"
                >
                  <motion.div
                    className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-6 mb-8 backdrop-blur-sm flex justify-center items-center gradient-square`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      y: [0, -3, 0], // Subtle floating animation (up/down 3px)
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 15px rgba(255,255,255,0.3)",
                      transition: { duration: 0.3 }
                    }}
                    transition={{ 
                      delay: 0.1,
                      y: {
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    <div 
                      className="flex flex-row items-center justify-between px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 min-w-[180px]"
                      aria-label={index === 0 ? "Shopping and AI technology overlap" : 
                                 index === 1 ? "Mobile search technology overlap" :
                                 index === 2 ? "Partnership and AI overlap" :
                                 "Digital technology"}
                    ></div>
                  </motion.div>
                  <motion.h2 
                    className="text-3xl font-bold mb-4"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ 
                      scale: 1.02,
                      color: "var(--color-primary)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p 
                    className="text-xl mb-8 opacity-80"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {slide.description}
                  </motion.p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-12 text-center">
          <h3 className="text-xl mb-6">What do you actually get from this?!</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-lg">
              <ul className="list-disc pl-5">
                <li>Easily discover common interests with anyone you meet</li>
              </ul>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-lg">
              <ul className="list-disc pl-5">
                <li>Receive what truly interests you from websites</li>
              </ul>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-lg">
              <ul className="list-disc pl-5">
                <li>Enter physical stores and instantly find products that suit you</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 0 20px rgba(255,255,255,0.2)" 
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1, ease: "easeInOut" }
              }}
            >
              <Button asChild size="lg" className="relative overflow-hidden group">
                <Link href="/register" className="flex items-center">
                  Get Started 
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                      ease: "easeInOut" 
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="lg" asChild className="backdrop-blur-sm">
                <Link href="/about">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}