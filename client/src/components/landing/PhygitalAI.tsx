import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Brain, Globe, MapPin, Sparkles } from "lucide-react";
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
            Where Physical Meets Digital Intelligence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the seamless fusion of physical identity with digital innovation, powered by advanced AI technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 h-full bg-gradient-to-br from-background to-primary/10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Intelligent Identity Analysis
                    </h3>
                    <p className="text-gray-600">
                      Advanced AI algorithms analyze and verify physical identities in real-time, ensuring secure and seamless authentication across platforms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Location-Aware Identity
                    </h3>
                    <p className="text-gray-600">
                      Bridge physical presence with digital identity through AI-powered location verification and contextual authentication.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 h-full bg-gradient-to-br from-background to-primary/10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Digital Twin Technology
                    </h3>
                    <p className="text-gray-600">
                      Create and manage secure digital representations of physical identities, enabling trusted interactions in both worlds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      AI-Driven Personalization
                    </h3>
                    <p className="text-gray-600">
                      Smart adaptation of digital experiences based on physical world interactions and behavioral patterns.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}