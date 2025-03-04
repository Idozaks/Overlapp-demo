import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import { ArrowRight, Smartphone } from "lucide-react";
import { useLocation } from "wouter";

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  return (
    <div className="relative min-h-[90vh] flex items-center">
      <AnimatedGradient />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('common.landing.identity.title')},
            <span className="text-primary block mt-2">
              {t('common.landing.identity.subtitle')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Seamlessly bridge your digital and physical worlds with AI-powered personalization
          </p>

          
        </motion.div>
      </div>
    </div>
  );
}