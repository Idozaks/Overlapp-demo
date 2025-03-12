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
    title: "Create your personal digital profile!",
    description: "Find precise matches in all areas of life.",
    gradientColors: "from-blue-500 to-purple-500"
  },
  {
    title: "Connect your real preferences",
    description: "And find your appropriate matches.",
    gradientColors: "from-green-500 to-teal-500"
  },
  {
    title: "You know yourself best!",
    description: "Create a digital profile that expresses your preferences, let AI enrich it, and then you can discover many areas that overlap with your interests.",
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16"
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
                    className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-6 mb-8 backdrop-blur-sm flex justify-center items-center`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div 
                      className="flex flex-row items-center justify-between px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 min-w-[180px]"
                      aria-label={index === 0 ? "Shopping and AI technology overlap" : 
                                 index === 1 ? "Mobile search technology overlap" :
                                 index === 2 ? "Partnership and AI overlap" :
                                 "Digital technology"}
                    ></div>
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-xl mb-8 opacity-80">{slide.description}</p>
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
            <Button asChild size="lg">
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}