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
                  {/* Scene 1: Personal Profile - User + AI enhancing profile - Interactive Animation */}
                  {slide.scene === "personal-profile" && (
                    <motion.div
                      className={`w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-4 mb-6 backdrop-blur-sm relative overflow-hidden flex items-center justify-center gradient-square`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(255,255,255,0.3)",
                        transition: { duration: 0.3 }
                      }}
                      transition={{
                        delay: 0.1
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full relative">
                          {/* Calculate icon dimensions */}
                          {(() => {
                            const iconSize = 20; // Size of surrounding icons
                            const centralIconSize = 32; // Size of central icon
                            const padding = 20; // Padding around icons
                            const containerSize = Math.max(centralIconSize + padding * 2, iconSize * 4 + padding * 3);

                            // Different animations based on current slide
                            const getAnimationForSlide = (slideIndex: number, iconIndex: number) => {
                              switch (slideIndex) {
                                case 0: // "Discover what truly connects you"
                                  return {
                                    opacity: 1,
                                    scale: [0.9, 1.1, 1],
                                    y: [0, -5, 0]
                                  };
                                case 1: // "Turn your real preferences into connections"
                                  return {
                                    opacity: 1,
                                    scale: 1,
                                    x: iconIndex % 2 === 0 ? [0, 5, 0] : [0, -5, 0]
                                  };
                                case 2: // "Build a profile that reflects you"
                                  return {
                                    opacity: 1,
                                    scale: [1, 1.05, 1],
                                    rotate: 0
                                  };
                                default:
                                  return { opacity: 1, rotate: 0 };
                              }
                            };

                            // Central icon animation based on slide
                            const getCentralAnimation = (slideIndex: number) => {
                              switch (slideIndex) {
                                case 0: // "Discover connections"
                                  return {
                                    opacity: 1, 
                                    scale: 1,
                                    rotate: [0, 5, -5, 0]
                                  };
                                case 1: // "Preferences to connections"
                                  return {
                                    opacity: 1, 
                                    scale: [1, 1.1, 1],
                                    rotate: 0
                                  };
                                case 2: // "Build profile"
                                  return {
                                    opacity: 1, 
                                    scale: 1,
                                    boxShadow: ["0px 0px 0px rgba(255,255,255,0.3)", "0px 0px 15px rgba(255,255,255,0.5)", "0px 0px 0px rgba(255,255,255,0.3)"]
                                  };
                                default:
                                  return { opacity: 1, scale: 1 };
                              }
                            };

                            return (
                              <div style={{ width: `${containerSize}px`, height: `${containerSize}px` }} className="relative">
                                {/* Main central icon */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/30 rounded-3xl backdrop-blur-sm flex items-center justify-center z-10"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={getCentralAnimation(currentSlide)}
                                  transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                >
                                  <NetworkIcon size={centralIconSize} className="text-white" />
                                </motion.div>

                                {/* Icons around the center */}
                                {/* Center blue icon */}
                                <motion.div
                                  className="absolute bg-blue-500 backdrop-blur-md p-2 rounded-lg"
                                  style={{
                                    top: `50%`,
                                    left: `50%`,
                                    transform: "translate(-50%, -50%)"
                                  }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <HeartIcon size={iconSize * 0.8} className="text-white" />
                                </motion.div>
                                
                                {/* Surrounding icons */}
                                {[Music, Video, Cpu, HeartIcon].slice(0, 4).map((Icon, i) => {
                                  // Calculate positions in a circle around the center
                                  const angle = (i * Math.PI / 2) + (Math.PI / 4); // Distribute evenly at 45°, 135°, 225°, 315°
                                  const distance = 40; // Distance from center (percentage)
                                  return (
                                    <motion.div
                                      key={i}
                                      className="absolute bg-white/30 backdrop-blur-md p-3 rounded-lg"
                                      style={{
                                        top: `${50 + Math.sin(angle) * distance}%`,
                                        left: `${50 + Math.cos(angle) * distance}%`,
                                        transform: "translate(-50%, -50%)"
                                      }}
                                      initial={{ opacity: 0 }}
                                      animate={getAnimationForSlide(currentSlide, i)}
                                      transition={{ 
                                        duration: 1.5, 
                                        repeat: Infinity, 
                                        repeatType: "reverse", 
                                        ease: "easeInOut",
                                        delay: i * 0.2
                                      }}
                                    >
                                      <Icon size={iconSize} className="text-white" />
                                    </motion.div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Scene 2: Retail Experience - Interactive Smartphone and Store Animation */}
                  {slide.scene === "retail-experience" && (
                    <motion.div
                      className={`w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-4 mb-6 backdrop-blur-sm flex justify-center items-center gradient-square relative overflow-hidden`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(255,255,255,0.3)",
                        transition: { duration: 0.3 }
                      }}
                      transition={{
                        delay: 0.1
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full relative">
                          {/* Interactive animation showing store and smartphone interaction */}

                          {/* Store appears first */}
                          <motion.div
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-3 rounded-lg"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                              opacity: [0, 1, 1, 1, 1, 1, 0.5],
                              scale: [0.5, 1, 1, 1, 1, 1, 0.8],
                              left: ["50%", "50%", "30%", "30%", "30%", "30%", "30%"],
                              top: ["50%", "50%", "50%", "50%", "50%", "50%", "50%"],
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <Store size={26} className="text-white" />
                          </motion.div>

                          {/* Person with phone enters from right */}
                          <motion.div
                            className="absolute bg-white/30 backdrop-blur-md p-3 rounded-lg"
                            initial={{ right: "-30%", top: "50%", opacity: 0 }}
                            animate={{
                              right: ["-30%", "-30%", "-30%", "30%", "30%", "30%", "-30%"],
                              top: ["50%", "50%", "50%", "50%", "50%", "50%", "50%"],
                              opacity: [0, 0, 0, 1, 1, 0.5, 0],
                              scale: [0.8, 0.8, 0.8, 1, 1, 0.8, 0.5],
                              rotate: [0, 0, 0, 0, 0, 10, 0]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.25, 0.4, 0.7, 0.85, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <Smartphone size={24} className="text-white" />
                          </motion.div>

                          {/* Connection signal between phone and store */}
                          <motion.div
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 0, 0, 0, 0.8, 0],
                              scale: [0, 0, 0, 0, 1.5, 0]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.35, 0.4, 0.45, 0.55, 0.7],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <Zap size={26} className="text-white" />
                          </motion.div>

                          {/* Products/Tags appear and move from store to person */}
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={`tag-${i}`}
                              className="absolute bg-white/20 backdrop-blur-md p-2 rounded-full"
                              initial={{
                                left: "30%",
                                top: "50%",
                                opacity: 0
                              }}
                              animate={{
                                left: ["30%", "30%", "30%", "30%", `${30 + (i * 5)}%`, "60%", "60%"],
                                top: ["50%", "50%", "50%", "50%", `${40 + (i * 5)}%`, "50%", "50%"],
                                opacity: [0, 0, 0, 0, 1, 0.5, 0],
                                scale: [0, 0, 0, 0, 1, 0.8, 0],
                                rotate: [0, 0, 0, 0, 0, i % 2 === 0 ? 20 : -20, 0]
                              }}
                              transition={{
                                duration: 10, // Match with other animations
                                times: [0, 0.4, 0.45, 0.55, 0.65, 0.8, 1],
                                repeat: Infinity,
                                repeatDelay: 1.5, // Consistent pause time
                                delay: i * 0.1
                              }}
                            >
                              {i % 2 === 0 ?
                                <Tag size={14} className="text-white" /> :
                                <ShoppingBag size={14} className="text-white" />
                              }
                            </motion.div>
                          ))}

                          {/* Happy Customer with found products */}
                          <motion.div
                            className="absolute bg-white/30 backdrop-blur-md p-3 rounded-full"
                            initial={{ opacity: 0, right: "30%", top: "50%" }}
                            animate={{
                              opacity: [0, 0, 0, 0, 0, 1, 0],
                              scale: [0, 0, 0, 0, 0, 1.2, 0],
                              right: ["30%", "30%", "30%", "30%", "30%", "30%", "30%"],
                              top: ["50%", "50%", "50%", "50%", "50%", "35%", "20%"],
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.4, 0.5, 0.6, 0.7, 0.85, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <div className="relative">
                              <Sparkles size={20} className="text-white" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Scene 3: Business Networking - Interactive Business Connections */}
                  {slide.scene === "business-networking" && (
                    <motion.div
                      className={`w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br ${slide.gradientColors} p-4 mb-6 backdrop-blur-sm flex justify-center items-center gradient-square relative overflow-hidden`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(255,255,255,0.3)",
                        transition: { duration: 0.3 }
                      }}
                      transition={{
                        delay: 0.1
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full relative">
                          {/* Animation of business networking events unfolding */}

                          {/* Top icon (Social/People) */}
                          <motion.div
                            className="absolute bg-white/30 backdrop-blur-md p-3 rounded-lg"
                            initial={{ opacity: 0, top: "-20%", left: "25%" }}
                            animate={{
                              opacity: [0, 1, 1, 1, 1, 1, 1, 0.5],
                              scale: [0.5, 1, 1, 1, 1, 1, 1, 0.8],
                              top: ["-20%", "20%", "20%", "20%", "20%", "20%", "20%", "20%"],
                              left: ["25%", "25%", "25%", "25%", "25%", "25%", "25%", "25%"]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <Users size={26} className="text-white" />
                          </motion.div>

                          {/* Right icon (Entertainment/Leisure) */}
                          <motion.div
                            className="absolute bg-white/30 backdrop-blur-md p-3 rounded-lg"
                            initial={{ opacity: 0, top: "20%", right: "-20%" }}
                            animate={{
                              opacity: [0, 0, 1, 1, 1, 1, 1, 0.5],
                              scale: [0.5, 0.5, 1, 1, 1, 1, 1, 0.8],
                              top: ["20%", "20%", "20%", "20%", "20%", "20%", "20%", "20%"],
                              right: ["-20%", "-20%", "20%", "20%", "20%", "20%", "20%", "20%"]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <Music size={24} className="text-white" />
                          </motion.div>

                          {/* Bottom icon (Shopping/Retail) */}
                          <motion.div
                            className="absolute bg-white/30 backdrop-blur-md p-3 rounded-lg"
                            initial={{ opacity: 0, bottom: "-20%", left: "25%" }}
                            animate={{
                              opacity: [0, 0, 0, 1, 1, 1, 1, 0.5],
                              scale: [0.5, 0.5, 0.5, 1, 1, 1, 1, 0.8],
                              bottom: ["-20%", "-20%", "-20%", "20%", "20%", "20%", "20%", "20%"],
                              left: ["25%", "25%", "25%", "25%", "25%", "25%", "25%", "25%"]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.05, 0.1, 0.2, 0.4, 0.6, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <ShoppingBag size={26} className="text-white" />
                          </motion.div>

                          {/* Person enters from center */}
                          <motion.div
                            className="absolute bg-white/40 backdrop-blur-md p-3 rounded-full"
                            initial={{ opacity: 0, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                            animate={{
                              opacity: [0, 0, 0, 0, 1, 1, 1, 0.5],
                              scale: [0.5, 0.5, 0.5, 0.5, 1.2, 1, 1, 0.8],
                              left: ["50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%"],
                              top: ["50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%"]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <User size={20} className="text-white" />
                          </motion.div>

                          {/* Connection lines appear sequentially */}

                          {/* Line to top building */}
                          <motion.div
                            className="absolute left-1/2 top-1/2 w-0.5 bg-white/50 origin-bottom transform -translate-x-1/2 -translate-y-1/2"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: [0, 0, 0, 0, 0, "30%", "30%", 0],
                              opacity: [0, 0, 0, 0, 0, 0.6, 0.6, 0],
                              top: ["50%", "50%", "50%", "50%", "50%", "35%", "35%", "35%"]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.2, 0.4, 0.5, 0.6, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          />

                          {/* Line to right building */}
                          <motion.div
                            className="absolute left-1/2 top-1/2 h-0.5 bg-white/50 origin-left transform -translate-y-1/2"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{
                              width: [0, 0, 0, 0, 0, "30%", "30%", 0],
                              opacity: [0, 0, 0, 0, 0, 0.6, 0.6, 0],
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.2, 0.4, 0.55, 0.65, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          />

                          {/* Line to bottom building */}
                          <motion.div
                            className="absolute left-1/2 top-1/2 w-0.5 bg-white/50 origin-top transform -translate-x-1/2"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: [0, 0, 0, 0, 0, "30%", "30%", 0],
                              opacity: [0, 0, 0, 0, 0, 0.6, 0.6, 0],
                              top: ["50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%"]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.2, 0.4, 0.6, 0.7, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          />

                          {/* Connection spark effects at each interest icon */}
                          {[
                            { top: "20%", left: "25%", delay: 0.6 },
                            { top: "20%", right: "20%", delay: 0.65 },
                            { bottom: "20%", left: "25%", delay: 0.7 }
                          ].map((pos, i) => (
                            <motion.div
                              key={`spark-${i}`}
                              className="absolute"
                              style={pos}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: [0, 0, 0, 0, 0, 0, 1, 0],
                                scale: [0, 0, 0, 0, 0, 0, 1.5, 0],
                              }}
                              transition={{
                                duration: 10, // Match with other animations
                                times: [0, 0.1, 0.2, 0.4, 0.5, pos.delay - 0.05, pos.delay, pos.delay + 0.1],
                                repeat: Infinity,
                                repeatDelay: 1.5 // Consistent pause time
                              }}
                            >
                              <div className="relative">
                                <Sparkles size={14} className="text-white" />
                              </div>
                            </motion.div>
                          ))}

                          {/* Network formed visualization at the end */}
                          <motion.div
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: [0, 0, 0, 0, 0, 0, 0, 0.8, 0],
                              scale: [0, 0, 0, 0, 0, 0, 0, 1.5, 0]
                            }}
                            transition={{
                              duration: 10, // Match with other animations
                              times: [0, 0.1, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1],
                              repeat: Infinity,
                              repeatDelay: 1.5 // Consistent pause time
                            }}
                          >
                            <div className="relative p-2 bg-white/10 backdrop-blur-md rounded-full">
                              <HeartHandshake size={24} className="text-white" />
                            </div>
                          </motion.div>
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
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration1000" />
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