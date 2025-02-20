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
            Overlap with AI World
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the seamless fusion of physical and digital identities powered by advanced AI technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Identity Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced machine learning algorithms analyze and verify digital-physical identity connections in real-time
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Digital Twin Technology</h3>
                <p className="text-muted-foreground">
                  Create and maintain secure digital representations of physical identities with real-time synchronization
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Secure Identity Verification</h3>
                <p className="text-muted-foreground">
                  Blockchain-backed verification ensures the authenticity and security of phygital identities
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Global Identity Network</h3>
                <p className="text-muted-foreground">
                  Connect and verify identities across borders with our distributed identity management system
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Location Intelligence</h3>
                <p className="text-muted-foreground">
                  Smart location tracking and verification for seamless physical-digital presence management
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Personalization</h3>
                <p className="text-muted-foreground">
                  AI-driven customization of digital identity features based on physical world interactions
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}