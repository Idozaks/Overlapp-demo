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

export default function PremiumFeatures() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const handlePlanClick = (planName: string) => {
    if (planName === "Enterprise") {
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
                      {t('common.landing.pricing.plans.premium.popular')}
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t(`common.landing.pricing.plans.${plan}.name`)}</span>
                    {plan === 'premium' && <Zap className="w-5 h-5 text-primary" />}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      {t(`common.landing.pricing.plans.${plan}.price`)}
                    </span>
                    {t(`common.landing.pricing.plans.${plan}.price`) !== "Custom" && 
                      <span className="text-gray-600 ml-1">/month</span>
                    }
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {t(`common.landing.pricing.plans.${plan}.features`, { returnObjects: true }).map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan === 'premium' ? "default" : "outline"}
                    onClick={() => handlePlanClick(t(`common.landing.pricing.plans.${plan}.name`))}
                  >
                    {t(`common.landing.pricing.plans.${plan}.price`) === "Custom" 
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