
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiNavigation, FiSearch, FiTag, FiPhone } from "react-icons/fi";

import { useTranslation } from "react-i18next";

export default function ARDemo() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('common.landing.ar.title')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('common.landing.ar.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="bg-black aspect-[9/16] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <FiNavigation className="w-6 h-6" />
                    <FiSearch className="w-6 h-6" />
                  </div>
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 + 0.5 }}
                        >
                          <div className="flex items-center gap-3">
                            <FiTag className="w-5 h-5" />
                            <div className="flex-1">
                              <div className="h-2 bg-white/30 rounded w-2/3" />
                              <div className="h-2 mt-1 bg-white/20 rounded w-1/2" />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary" />
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <FiPhone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('common.landing.ar.point.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('common.landing.ar.point.description')}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <FiNavigation className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('common.landing.ar.navigation.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('common.landing.ar.navigation.description')}
                  </p>
                </div>
              </div>
            </Card>

            <div className="text-center">
              <Button size="lg" className="mt-4">
                {t('common.landing.ar.cta')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
