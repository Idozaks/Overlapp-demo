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
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import React, { useState, useEffect, useCallback } from "react";
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Link } from 'wouter';


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
                  {/* Scene 1: Personal Profile - User + AI enhancing profile */}
                  {slide.scene === "personal-profile" && (
                    <motion.div
                      className={`w-60 h-60 md:w-72 md:h-72 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-6 mb-8 backdrop-blur-sm flex justify-center items-center gradient-square relative overflow-hidden`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        y: [0, -5, 0], // Subtle floating animation
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex flex-col items-center">
                          {/* User icon */}
                          <motion.div 
                            className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-3"
                            animate={{ 
                              y: [0, -8, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <User size={32} className="text-white" />
                          </motion.div>

                          {/* AI enhancement visual */}
                          <motion.div 
                            className="absolute top-1 -right-10 bg-purple-300/30 backdrop-blur-md p-2 rounded-full"
                            animate={{ 
                              rotate: [0, 20, 0, -20, 0],
                              scale: [1, 1.2, 1],
                              x: [-5, 5, -5]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity
                            }}
                          >
                            <Sparkles size={24} className="text-white" />
                          </motion.div>

                          {/* Connection lines */}
                          <motion.div className="relative w-40 h-20 mt-3">
                            <motion.div 
                              className="absolute left-0 top-0 bg-white/20 backdrop-blur-md p-2 rounded-full"
                              animate={{ 
                                x: [0, 5, 0, -5, 0],
                                y: [0, -5, 0, 5, 0]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <HeartHandshake size={20} className="text-white" />
                            </motion.div>
                            
                            <motion.div 
                              className="absolute right-0 top-0 bg-white/20 backdrop-blur-md p-2 rounded-full"
                              animate={{ 
                                x: [0, -5, 0, 5, 0],
                                y: [0, 5, 0, -5, 0]
                              }}
                              transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <Users size={20} className="text-white" />
                            </motion.div>
                            
                            <motion.div 
                              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full"
                              animate={{ 
                                y: [0, -5, 0, 5, 0]
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity
                              }}
                            >
                              <Search size={20} className="text-white" />
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Scene 2: Retail Experience - Smartphone and store with tags */}
                  {slide.scene === "retail-experience" && (
                    <motion.div
                      className={`w-60 h-60 md:w-72 md:h-72 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-6 mb-8 backdrop-blur-sm flex justify-center items-center gradient-square relative overflow-hidden`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        y: [0, -5, 0], // Subtle floating animation
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          {/* Store */}
                          <motion.div 
                            className="bg-white/20 backdrop-blur-md p-3 rounded-xl absolute -left-12"
                            animate={{ 
                              y: [0, -5, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Store size={32} className="text-white" />
                          </motion.div>

                          {/* Phone in center */}
                          <motion.div 
                            className="bg-white/30 backdrop-blur-md p-4 rounded-xl"
                            animate={{ 
                              rotate: [0, 2, 0, -2, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity
                            }}
                          >
                            <Smartphone size={36} className="text-white" />
                          </motion.div>

                          {/* Product tags */}
                          <motion.div 
                            className="bg-white/20 backdrop-blur-md p-2 rounded-full absolute -right-8 top-0"
                            animate={{ 
                              x: [0, 5, 0, -5, 0],
                              y: [0, -3, 0, 3, 0],
                              rotate: [0, 10, 0, -10, 0]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity
                            }}
                          >
                            <Tag size={20} className="text-white" />
                          </motion.div>

                          <motion.div 
                            className="bg-white/20 backdrop-blur-md p-2 rounded-full absolute -right-4 -bottom-8"
                            animate={{ 
                              x: [0, -3, 0, 3, 0],
                              y: [0, 5, 0, -5, 0],
                              rotate: [0, -10, 0, 10, 0]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity
                            }}
                          >
                            <ShoppingBag size={20} className="text-white" />
                          </motion.div>

                          {/* Energy/connection between phone and store */}
                          <motion.div 
                            className="absolute left-0 top-1/2 transform -translate-y-1/2"
                            animate={{ 
                              opacity: [0, 0.8, 0],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity
                            }}
                          >
                            <Zap size={16} className="text-white" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Scene 3: Business Networking - Person to business connections */}
                  {slide.scene === "business-networking" && (
                    <motion.div
                      className={`w-60 h-60 md:w-72 md:h-72 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-6 mb-8 backdrop-blur-sm flex justify-center items-center gradient-square relative overflow-hidden`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        y: [0, -5, 0], // Subtle floating animation
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                          {/* Business buildings */}
                          <div className="flex space-x-12 mb-6">
                            <motion.div 
                              className="bg-white/20 backdrop-blur-md p-2 rounded-lg"
                              animate={{ 
                                y: [0, -4, 0],
                                rotate: [0, 2, 0, -2, 0]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Building2 size={24} className="text-white" />
                            </motion.div>
                            
                            <motion.div 
                              className="bg-white/20 backdrop-blur-md p-2 rounded-lg"
                              animate={{ 
                                y: [0, -6, 0],
                                rotate: [0, -2, 0, 2, 0]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Building2 size={30} className="text-white" />
                            </motion.div>
                          </div>

                          {/* Person in center */}
                          <motion.div 
                            className="bg-white/30 backdrop-blur-md p-3 rounded-full mb-6"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              y: [0, 3, 0]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity
                            }}
                          >
                            <User size={28} className="text-white" />
                          </motion.div>

                          {/* Connection lines */}
                          <motion.svg 
                            width="140" 
                            height="100" 
                            viewBox="0 0 140 100" 
                            className="absolute"
                          >
                            {/* Line to left building */}
                            <motion.path
                              d="M 70,40 L 30,20"
                              stroke="white"
                              strokeWidth="1.5"
                              fill="none"
                              strokeDasharray="5,5"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ 
                                pathLength: [0, 1], 
                                opacity: [0, 0.6, 0.6, 0]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                repeatDelay: 1
                              }}
                            />
                            
                            {/* Line to right building */}
                            <motion.path
                              d="M 70,40 L 110,20"
                              stroke="white"
                              strokeWidth="1.5"
                              fill="none"
                              strokeDasharray="5,5"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ 
                                pathLength: [0, 1], 
                                opacity: [0, 0.6, 0.6, 0]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                repeatDelay: 0.5,
                                delay: 0.5
                              }}
                            />
                          </motion.svg>

                          {/* Location pins */}
                          <div className="flex space-x-24 mt-2">
                            <motion.div 
                              className="bg-white/20 backdrop-blur-md p-1 rounded-full"
                              animate={{ 
                                y: [0, 3, 0, -3, 0],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity
                              }}
                            >
                              <MapPin size={18} className="text-white" />
                            </motion.div>
                            
                            <motion.div 
                              className="bg-white/20 backdrop-blur-md p-1 rounded-full"
                              animate={{ 
                                y: [0, -3, 0, 3, 0],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                delay: 0.5
                              }}
                            >
                              <MapPin size={18} className="text-white" />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
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