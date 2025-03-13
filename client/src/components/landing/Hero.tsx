import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import {
  ArrowRight,
  Smartphone,
  Users,
  ShoppingBag,
  Store,
  HeartHandshake,
  User,
  Building2,
  Tag,
  MapPin,
  Search,
  Zap,
  Sparkles,
  Music,
  Video,
  Heart as HeartIcon,
  Cpu,
  Network as NetworkIcon,
  User as UserIcon,
  Network,
} from "lucide-react";
import { useLocation } from "wouter";
import React, { useState, useEffect, useCallback } from "react";
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Link } from 'wouter';

// Define slides with themes that will inform the animations
const slides = [
  {
    title: "Discover what truly connects you!",
    description: "Create a digital profile, let AI enhance it, and explore the many ways your interests align with others.",
    gradientColors: "from-blue-500 to-purple-500",
    scene: "personal-profile"
  },
  {
    title: "Turn your real preferences into real connections.",
    description: "Find meaningful matches effortlessly.",
    gradientColors: "from-green-500 to-teal-500",
    scene: "retail-experience"
  },
  {
    title: "Build a profile that reflects you.",
    description: "Discover precise matches across every aspect of life.",
    gradientColors: "from-amber-500 to-red-500",
    scene: "business-networking"
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
    }, 20000); // 20 seconds per slide for longer viewing time

    return () => clearInterval(interval);
  }, [api]);

  // Animated icon components with consistent but varied animations
  const AnimatedIcon = ({ icon: Icon, delay = 0, color = "text-white" }) => {
    return (
      <motion.div
        className={`absolute p-2 bg-opacity-90 rounded-xl ${color}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        <Icon className="w-6 h-6" />
      </motion.div>
    );
  };

  // Define icon sets for each slide
  const profileIcons = [
    { icon: UserIcon, color: "text-white" },
    { icon: HeartIcon, color: "text-pink-200" },
    { icon: Music, color: "text-blue-200" },
    { icon: Video, color: "text-purple-200" },
    { icon: Cpu, color: "text-green-200" }
  ];

  const retailIcons = [
    { icon: ShoppingBag, color: "text-white" },
    { icon: Tag, color: "text-yellow-200" },
    { icon: Store, color: "text-green-200" },
    { icon: Smartphone, color: "text-blue-200" },
    { icon: MapPin, color: "text-red-200" }
  ];

  const networkingIcons = [
    { icon: Network, color: "text-white" },
    { icon: Users, color: "text-blue-200" },
    { icon: Building2, color: "text-purple-200" },
    { icon: HeartHandshake, color: "text-green-200" },
    { icon: Sparkles, color: "text-yellow-200" }
  ];

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      <AnimatedGradient />
      <div className="container px-4 py-16 mx-auto z-10">
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
                  {/* Scene 1: Personal Profile - User-centered animation */}
                  {slide.scene === "personal-profile" && (
                    <motion.div
                      className={`w-56 h-56 rounded-2xl p-4 mb-6 relative overflow-hidden flex items-center justify-center`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.3 }
                      }}
                      transition={{
                        delay: 0.1
                      }}
                    >
                      {/* Center user icon */}
                      <motion.div
                        className="absolute z-10 bg-blue-500 p-5 rounded-2xl flex items-center justify-center"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)"
                        }}
                        transition={{ 
                          delay: 0.2,
                          duration: 0.8
                        }}
                      >
                        <User className="w-8 h-8 text-white" />
                      </motion.div>

                      {/* Personal interests flowing to center - showing profile creation */}
                      <motion.div 
                        className="absolute top-4 right-4 bg-opacity-90 bg-purple-400 p-3 rounded-full"
                        initial={{ y: -50, x: 50, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        transition={{ 
                          delay: 0.6, 
                          duration: 0.7,
                          type: "spring", 
                          stiffness: 100 
                        }}
                      >
                        <Music className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute bottom-4 right-4 bg-opacity-90 bg-pink-400 p-3 rounded-full"
                        initial={{ y: 50, x: 50, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        transition={{ 
                          delay: 0.8, 
                          duration: 0.7,
                          type: "spring", 
                          stiffness: 100 
                        }}
                      >
                        <HeartIcon className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute bottom-4 left-4 bg-opacity-90 bg-green-400 p-3 rounded-full"
                        initial={{ y: 50, x: -50, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        transition={{ 
                          delay: 1.0, 
                          duration: 0.7,
                          type: "spring", 
                          stiffness: 100 
                        }}
                      >
                        <Video className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute top-4 left-4 bg-opacity-90 bg-yellow-400 p-3 rounded-full"
                        initial={{ y: -50, x: -50, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        transition={{ 
                          delay: 1.2, 
                          duration: 0.7,
                          type: "spring", 
                          stiffness: 100 
                        }}
                      >
                        <Cpu className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Scene 2: Retail Experience - Interactive Smartphone and Store Animation */}
                  {slide.scene === "retail-experience" && (
                    <motion.div
                      className={`w-56 h-56 rounded-2xl p-4 mb-6 flex justify-center items-center relative overflow-hidden`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.3 }
                      }}
                      transition={{
                        delay: 0.1
                      }}
                    >
                      {/* Center store icon */}
                      <motion.div
                        className="absolute z-10 bg-teal-500 p-5 rounded-2xl flex items-center justify-center"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          boxShadow: "0 0 20px rgba(20, 184, 166, 0.6)"
                        }}
                        transition={{ 
                          delay: 0.2,
                          duration: 0.8
                        }}
                      >
                        <Store className="w-8 h-8 text-white" />
                      </motion.div>

                      {/* Retail experience journey - showing discovery process */}
                      <motion.div 
                        className="absolute top-4 right-4 bg-opacity-90 bg-yellow-400 p-3 rounded-full"
                        initial={{ y: -40, x: 40, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ 
                          delay: 0.6, 
                          duration: 0.6,
                          type: "spring"
                        }}
                      >
                        <Tag className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute bottom-4 right-4 bg-opacity-90 bg-blue-400 p-3 rounded-full"
                        initial={{ y: 0, x: 80, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ 
                          delay: 0.8, 
                          duration: 0.7,
                          type: "spring" 
                        }}
                      >
                        <Smartphone className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute bottom-4 left-4 bg-opacity-90 bg-green-400 p-3 rounded-full"
                        initial={{ y: 40, x: -40, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ 
                          delay: 1.0, 
                          duration: 0.7,
                          type: "spring" 
                        }}
                      >
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute top-4 left-4 bg-opacity-90 bg-red-400 p-3 rounded-full"
                        initial={{ y: -20, x: -60, opacity: 0 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ 
                          delay: 1.2, 
                          duration: 0.6,
                          type: "spring" 
                        }}
                      >
                        <MapPin className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Scene 3: Business Networking - Connection Animation */}
                  {slide.scene === "business-networking" && (
                    <motion.div
                      className={`w-56 h-56 rounded-2xl p-4 mb-6 flex justify-center items-center relative overflow-hidden`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.3 }
                      }}
                      transition={{
                        delay: 0.1
                      }}
                    >
                      {/* Center network icon */}
                      <motion.div
                        className="absolute z-10 bg-indigo-500 p-5 rounded-2xl flex items-center justify-center"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          boxShadow: "0 0 20px rgba(99, 102, 241, 0.6)"
                        }}
                        transition={{ 
                          delay: 0.2,
                          duration: 0.8
                        }}
                      >
                        <Network className="w-8 h-8 text-white" />
                      </motion.div>

                      {/* Networking connections forming - showing business connections */}
                      <motion.div 
                        className="absolute top-4 right-4 bg-opacity-90 bg-blue-400 p-3 rounded-full"
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ 
                          x: 0, 
                          opacity: 1,
                          transition: {
                            type: "spring",
                            stiffness: 120
                          }
                        }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                      >
                        <Users className="w-5 h-5 text-white" />
                      </motion.div>

                      {/* Line connecting network to users */}
                      <motion.div
                        className="absolute bg-blue-400 h-0.5"
                        style={{ 
                          top: "calc(50% - 1px)", 
                          right: "calc(50% + 20px)",
                          width: "0%",
                          transformOrigin: "right"
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: "30%" }}
                        transition={{ delay: 1.3, duration: 0.4 }}
                      />

                      <motion.div 
                        className="absolute bottom-4 right-4 bg-opacity-90 bg-purple-400 p-3 rounded-full"
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ 
                          y: 0, 
                          opacity: 1,
                          transition: {
                            type: "spring",
                            stiffness: 120
                          }
                        }}
                        transition={{ delay: 0.8, duration: 0.7 }}
                      >
                        <Building2 className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute bottom-4 left-4 bg-opacity-90 bg-green-400 p-3 rounded-full"
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ 
                          x: 0, 
                          opacity: 1,
                          transition: {
                            type: "spring",
                            stiffness: 120
                          }
                        }}
                        transition={{ delay: 1.0, duration: 0.7 }}
                      >
                        <HeartHandshake className="w-5 h-5 text-white" />
                      </motion.div>

                      <motion.div 
                        className="absolute top-4 left-4 bg-opacity-90 bg-yellow-400 p-3 rounded-full"
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ 
                          y: 0, 
                          opacity: 1,
                          transition: {
                            type: "spring",
                            stiffness: 120
                          }
                        }}
                        transition={{ delay: 1.2, duration: 0.7 }}
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.div>
                  )}

                  <motion.h2
                    className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
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
            {t('landing.hero.getStarted')} <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
            asChild
          >
            <Link to="/about">
              {t('landing.hero.learnMore')} <Search className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}