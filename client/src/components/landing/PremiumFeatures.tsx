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

const plans = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "Basic digital identity management",
      "Limited AR experiences",
      "Standard recommendations",
      "Basic retail integrations"
    ]
  },
  {
    name: "Premium",
    price: "$9.99/mo",
    popular: true,
    features: [
      "Advanced identity controls",
      "Full AR capabilities",
      "AI-powered personalization",
      "Priority retail offers",
      "Exclusive events access",
      "24/7 premium support"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Custom identity solutions",
      "Advanced analytics",
      "Dedicated support team",
      "Custom integrations",
      "API access",
      "SLA guarantees"
    ]
  }
];

export default function PremiumFeatures() {
  const [, navigate] = useLocation();

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
            Choose Your Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of your digital identity with our premium features
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.popular && <Zap className="w-5 h-5 text-primary" />}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-gray-600 ml-1">/month</span>}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
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
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePlanClick(plan.name)}
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
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