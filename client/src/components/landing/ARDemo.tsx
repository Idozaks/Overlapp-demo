import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, Search } from "lucide-react"; //Corrected import statement

import { useTranslation } from "react-i18next";

export default function ARDemo() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('common.landing.ar.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('common.landing.ar.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[9/16] max-w-sm mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
              <div className="absolute inset-x-6 top-12 bottom-12">
                <div className="h-full w-full bg-black/80 rounded-3xl p-4 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Navigation className="w-6 h-6" />
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="bg-white/10 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Tag className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="h-2 bg-white/30 rounded w-2/3" />
                            <div className="h-2 bg-white/20 rounded w-1/2 mt-2" />
                          </div>
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
                  <Phone className="w-6 h-6 text-primary" />
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
                  <Navigation className="w-6 h-6 text-primary" />
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

            <div className="flex justify-center lg:justify-start">
              <Button size="lg" className="gap-2">
                {t('common.nav.demo')} <Phone className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}