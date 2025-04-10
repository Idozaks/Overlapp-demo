import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Globe,
  Building,
  Map,
  Briefcase,
  Compass,
  Plane,
  Factory,
  Calendar,
  Network
} from "lucide-react";

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

export default function MarketStrategy() {
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
            Market Opportunities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where your world overlaps with others
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* B2C Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  B2C (Global & Israel)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Global demand for meaningful social connections via shared interests.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Map className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Location-based apps thrive post-pandemic: users seek nearby spontaneous meetups.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Building className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>In Israel: tech-savvy, community-driven culture with dense urban centers.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Compass className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Early adopter audience: students, young professionals, travelers.</span>
                  </motion.li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* B2B Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  B2B (Platforms, Venues, Events)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Factory className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Growing need for community features in coworking spaces, events, and online platforms.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Network className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Overlapp as a plug-and-play solution for deeper engagement.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Ideal pilot market: Israel's tight-knit and innovation-friendly ecosystem.</span>
                  </motion.li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}