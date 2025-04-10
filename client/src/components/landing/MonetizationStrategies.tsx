import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  Crown,
  Building2,
  Share2,
  Code,
  BarChart3
} from "lucide-react";

const strategies = [
  {
    title: "Freemium Model",
    description: "Basic use is free; upsell premium features (e.g., advanced filters, AI concierge).",
    icon: <Crown className="w-8 h-8 text-primary" />
  },
  {
    title: "B2B SaaS",
    description: "Subscription tiers for platforms, coworking spaces, and event organizers.",
    icon: <Building2 className="w-8 h-8 text-primary" />
  },
  {
    title: "Partnerships",
    description: "Sponsored meetups, venue-based offers, and affiliate revenue.",
    icon: <Share2 className="w-8 h-8 text-primary" />
  },
  {
    title: "API & Integrations",
    description: "Usage-based API tiers or SaaS extensions for CRMs, platforms.",
    icon: <Code className="w-8 h-8 text-primary" />
  },
  {
    title: "Analytics",
    description: "Offer premium dashboards and anonymized trend reports.",
    icon: <BarChart3 className="w-8 h-8 text-primary" />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function MonetizationStrategies() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Monetization Strategies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multiple revenue streams designed for sustainable growth
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {strategies.map((strategy, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      {strategy.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 flex items-center">
                        {strategy.title}
                        <ArrowUpRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-muted-foreground">
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}