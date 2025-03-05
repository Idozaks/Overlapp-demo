import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import AnimatedGradient from "@/components/ui/AnimatedGradient";
import HeroVennDiagram from "./HeroVennDiagram";
import { useLocation } from "wouter";

export default function Hero() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <AnimatedGradient />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t('common.hero.title')}
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('common.hero.subtitle')}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                {t('common.hero.primary_cta')}
              </Button>

              <Button size="lg" variant="outline">
                {t('common.hero.secondary_cta')}
              </Button>
            </motion.div>
          </div>

          <div className="flex-1">
            <HeroVennDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}