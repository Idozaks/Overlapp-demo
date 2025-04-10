import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Smartphone,
  Map,
  Layout,
  Zap,
  Glasses,
  Layers
} from "lucide-react";

const principles = [
  {
    title: "Mobile-first, responsive design",
    description: "Optimized for smartphones with desktop support",
    icon: <Smartphone className="w-8 h-8 text-primary" />
  },
  {
    title: "Interactive elements",
    description: "Micro-interactions, maps, and personalized overlays for engagement",
    icon: <Map className="w-8 h-8 text-primary" />
  },
  {
    title: "Clean layout",
    description: "Bottom nav bar, cards, swipe gestures, contextual prompts",
    icon: <Layout className="w-8 h-8 text-primary" />
  },
  {
    title: "Real-time updates",
    description: "Dynamic content based on location and user behavior",
    icon: <Zap className="w-8 h-8 text-primary" />
  },
  {
    title: "Enhanced reality",
    description: "AR or ambient elements to enhance discovery experience",
    icon: <Glasses className="w-8 h-8 text-primary" />
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

export default function UXPrinciples() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            UX/UI Design Principles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Creating intuitive and engaging user experiences
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {principles.map((principle, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      {principle.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {principle.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {principle.description}
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