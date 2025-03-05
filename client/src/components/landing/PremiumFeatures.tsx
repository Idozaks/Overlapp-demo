import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

const FEATURES = {
  basic: ["identity.basic", "ar.limited", "recommendations.standard", "retail.basic"],
  premium: ["identity.advanced", "ar.full", "ai.personalization", "retail.priority", "events.exclusive", "support.premium"],
  enterprise: ["solutions.custom", "analytics.advanced", "support.dedicated", "integrations.custom", "access.api", "sla.guarantees"]
};

export default function PremiumFeatures() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const handlePlanClick = (planName: string) => {
    if (planName === t('common.landing.pricing.enterprise.name')) {
      navigate("/contact");
    } else {
      navigate("/signup");
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('common.landing.pricing.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('common.landing.pricing.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {['basic', 'premium', 'enterprise'].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className={`relative ${plan === 'premium' ? 'border-primary shadow-lg' : ''}`}>
                {plan === 'premium' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      {t('common.landing.pricing.premium.popular')}
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t(`common.landing.pricing.${plan}.name`)}</span>
                    {plan === 'premium' && <Zap className="w-5 h-5 text-primary" />}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      {t(`common.landing.pricing.${plan}.price`)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {FEATURES[plan as keyof typeof FEATURES].map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span className="text-gray-600">{t(`common.landing.pricing.features.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan === 'premium' ? "default" : "outline"}
                    onClick={() => handlePlanClick(t(`common.landing.pricing.${plan}.name`))}
                  >
                    {plan === 'enterprise' 
                      ? t('common.nav.contact') 
                      : t('common.nav.signup')}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}