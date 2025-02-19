import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Smartphone, Cloud, RefreshCw } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Secure Identity Management",
    description: "Control your digital identity with quantum-resistant encryption and advanced privacy controls"
  },
  {
    icon: <Smartphone className="w-8 h-8 text-primary" />,
    title: "Seamless Physical Integration",
    description: "Bridge your digital and physical experiences with smart location-based features"
  },
  {
    icon: <Cloud className="w-8 h-8 text-primary" />,
    title: "AI-Powered Insights",
    description: "Get personalized recommendations and insights powered by advanced AI"
  },
  {
    icon: <RefreshCw className="w-8 h-8 text-primary" />,
    title: "Real-time Synchronization",
    description: "Stay synchronized across all your devices and physical locations instantly"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
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

export default function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Redefining Digital Identity
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of personalized digital interactions with our cutting-edge features
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
