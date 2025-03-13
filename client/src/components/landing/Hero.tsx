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
  const AnimatedIcon = ({ 
    icon: Icon, 
    delay = 0, 
    color = "text-white", 
    label = "" 
  }) => {
    return (
      <motion.div
        className={`absolute p-2 bg-opacity-90 rounded-xl ${color} flex flex-col items-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        <Icon className="w-6 h-6" />
        {label && (
          <span className="text-[10px] font-medium text-white mt-1 bg-black bg-opacity-50 px-1 rounded whitespace-nowrap">
            {label}
          </span>
        )}
      </motion.div>
    );
  };

  // Define icon sets for each slide
  const profileIcons = [
    { icon: UserIcon, color: "text-white", label: "Your Profile" },
    { icon: HeartIcon, color: "text-pink-200", label: "Interests" },
    { icon: Music, color: "text-blue-200", label: "Music Taste" },
    { icon: Video, color: "text-purple-200", label: "Content Preference" },
    { icon: Cpu, color: "text-green-200", label: "AI Enhancement" }
  ];

  const retailIcons = [
    { icon: ShoppingBag, color: "text-white", label: "Shopping Cart" },
    { icon: Tag, color: "text-yellow-200", label: "Special Offers" },
    { icon: Store, color: "text-green-200", label: "Store Finder" },
    { icon: Smartphone, color: "text-blue-200", label: "Mobile Access" },
    { icon: MapPin, color: "text-red-200", label: "Location" }
  ];

  const networkingIcons = [
    { icon: Network, color: "text-white", label: "Your Network" },
    { icon: Users, color: "text-blue-200", label: "Connections" },
    { icon: Building2, color: "text-purple-200", label: "Businesses" },
    { icon: HeartHandshake, color: "text-green-200", label: "Collaboration" },
    { icon: Sparkles, color: "text-yellow-200", label: "Opportunities" }
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
                      {/* Personal Profile Icon Animation */}
                      {profileIcons.map((iconData, i) => {
                        // Calculate positions in a circle around the center
                        const radius = 120; // Increased from 80 to give more space
                        const angle = (i * (2 * Math.PI / profileIcons.length));
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);

                        return (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{ zIndex: 10 }} // Add z-index to ensure icons appear above center
                            initial={{ 
                              x: 0, 
                              y: 0, 
                              opacity: 0 
                            }}
                            animate={{ 
                              // Adjust positioning to keep icons within boundaries
                              x: Math.min(Math.max(x, -120), 120),
                              y: Math.min(Math.max(y, -120), 120),
                              opacity: 1
                            }}
                            transition={{ 
                              delay: 0.5 + (i * 0.1), 
                              duration: 0.8,
                              type: "spring",
                              stiffness: 50
                            }}
                          >
                            <AnimatedIcon icon={iconData.icon} color={iconData.color} label={iconData.label} />
                          </motion.div>
                        );
                      })}
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
                      {/* Retail Experience Icon Animation */}
                      {retailIcons.map((iconData, i) => {
                        // Calculate positions in a circle around the center
                        const radius = 120; // Increased from 80 to give more space
                        const angle = (i * (2 * Math.PI / retailIcons.length));
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);

                        return (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{ zIndex: 10 }} // Add z-index to ensure icons appear above center
                            initial={{ 
                              x: 0, 
                              y: 0, 
                              opacity: 0 
                            }}
                            animate={{ 
                              // Adjust positioning to keep icons within boundaries
                              x: Math.min(Math.max(x, -120), 120),
                              y: Math.min(Math.max(y, -120), 120),
                              opacity: 1
                            }}
                            transition={{ 
                              delay: 0.5 + (i * 0.1), 
                              duration: 0.8,
                              type: "spring",
                              stiffness: 50
                            }}
                          >
                            <AnimatedIcon icon={iconData.icon} color={iconData.color} label={iconData.label} />
                          </motion.div>
                        );
                      })}
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
                      {/* Business Networking Icon Animation */}
                      {networkingIcons.map((iconData, i) => {
                        // Calculate positions in a circle around the center
                        const radius = 120; // Increased from 80 to give more space
                        const angle = (i * (2 * Math.PI / networkingIcons.length));
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);

                        return (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{ zIndex: 10 }} // Add z-index to ensure icons appear above center
                            initial={{ 
                              x: 0, 
                              y: 0, 
                              opacity: 0 
                            }}
                            animate={{ 
                              // Adjust positioning to keep icons within boundaries
                              x: Math.min(Math.max(x, -120), 120),
                              y: Math.min(Math.max(y, -120), 120),
                              opacity: 1
                            }}
                            transition={{ 
                              delay: 0.5 + (i * 0.1), 
                              duration: 0.8,
                              type: "spring",
                              stiffness: 50
                            }}
                          >
                            <AnimatedIcon icon={iconData.icon} color={iconData.color} label={iconData.label} />
                          </motion.div>
                        );
                      })}
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