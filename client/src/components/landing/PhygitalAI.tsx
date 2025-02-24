import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Brain, Globe, MapPin, Sparkles, Layers, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PhygitalAI() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.ai_world.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.ai_world.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6">
            <Brain className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{t('landing.ai_world.analysis.title')}</h3>
            <p className="text-muted-foreground">{t('landing.ai_world.analysis.description')}</p>
          </Card>

          <Card className="p-6">
            <Layers className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{t('landing.ai_world.digital_twin.title')}</h3>
            <p className="text-muted-foreground">{t('landing.ai_world.digital_twin.description')}</p>
          </Card>

          <Card className="p-6">
            <Shield className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{t('landing.ai_world.verification.title')}</h3>
            <p className="text-muted-foreground">{t('landing.ai_world.verification.description')}</p>
          </Card>

          <Card className="p-6">
            <Globe className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{t('landing.ai_world.global_network.title')}</h3>
            <p className="text-muted-foreground">{t('landing.ai_world.global_network.description')}</p>
          </Card>

          <Card className="p-6">
            <MapPin className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{t('landing.ai_world.location.title')}</h3>
            <p className="text-muted-foreground">{t('landing.ai_world.location.description')}</p>
          </Card>

          <Card className="p-6">
            <Sparkles className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">{t('landing.ai_world.personalization.title')}</h3>
            <p className="text-muted-foreground">{t('landing.ai_world.personalization.description')}</p>
          </Card>
        </div>
      </div>
    </section>
  );
}