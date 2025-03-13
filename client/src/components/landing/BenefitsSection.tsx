
import { motion } from "framer-motion";
import { 
  Users, 
  Globe, 
  Store,
  Check
} from "lucide-react";

const benefits = [
  {
    title: "Easily discover common interests with anyone you meet",
    icon: <Users className="w-8 h-8 text-primary" />
  },
  {
    title: "Receive what truly interests you from websites",
    icon: <Globe className="w-8 h-8 text-primary" />
  },
  {
    title: "Enter physical stores and instantly find products that suit you",
    description: "(on the menu, in the catalog, or on the dynamic store map)",
    icon: <Store className="w-8 h-8 text-primary" />
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
            What do you actually get from this?!
          </h2>
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
