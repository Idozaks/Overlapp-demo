
import { motion } from "framer-motion";
import { 
  Users, 
  Globe, 
  Store,
  Check,
  Map,
  BellRing
} from "lucide-react";

const benefits = [
  {
    title: "Find meaningful social connections via shared interests",
    icon: <Users className="w-8 h-8 text-primary" />,
    description: "Discover people who share your passions - from common interests to niche hobbies"
  },
  {
    title: "Nearby spontaneous meetups with location-based features",
    icon: <Map className="w-8 h-8 text-primary" />,
    description: "Connect with like-minded people based on your current location and shared interests"
  },
  {
    title: "Personalized content from websites and online platforms",
    icon: <Globe className="w-8 h-8 text-primary" />,
    description: "Receive tailored recommendations and content that aligns with your digital identity"
  },
  {
    title: "Real-time notifications for relevant retail and event offers",
    icon: <BellRing className="w-8 h-8 text-primary" />,
    description: "Get alerts about events, offers, and meetups that match your preferences"
  },
  {
    title: "Enhanced shopping experiences in physical stores",
    icon: <Store className="w-8 h-8 text-primary" />,
    description: "Find products that suit you instantly in stores, menus, catalogs, or interactive maps"
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

export default function BenefitsSection() {
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
            Key User Benefits
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Where your world overlaps with others
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants} className="flex p-6 bg-background rounded-lg shadow-sm">
              <div className="mr-6 mt-1">{benefit.icon}</div>
              <div>
                <h3 className="text-xl font-semibold flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  {benefit.title}
                </h3>
                {benefit.description && (
                  <p className="mt-1 text-muted-foreground">{benefit.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
