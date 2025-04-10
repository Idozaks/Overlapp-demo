import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Sparkles,
  Heart,
  PieChart,
  MessageCircle
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

export default function BrandingCopy() {
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
            Branding & Copywriting
          </h2>
          <div className="text-2xl text-primary font-medium italic max-w-2xl mx-auto mb-6">
            "Where your world overlaps with others."
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Brand Elements</h3>
                <ul className="space-y-4">
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <PieChart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Visual metaphors: Venn diagrams, sparks, constellations, puzzle pieces.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Emotional tone: curiosity, belonging, excitement.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Tech-forward clarity: simplify AI/DIU terminology without losing credibility.</span>
                  </motion.li>
                  <motion.li variants={itemVariants} className="flex gap-3">
                    <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Style guide: maintain voice across UI, marketing, B2B decks, and social.</span>
                  </motion.li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="h-full"
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Sample Copy</h3>
                <div className="bg-primary/10 p-5 rounded-lg border-l-4 border-primary">
                  <p className="text-lg">
                    "Find people who share your passions – from the wildly common to the oddly specific – and turn chance encounters into something real."
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  <div>
                    <h4 className="font-medium">For Curious Early Adopters:</h4>
                    <button className="mt-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg">
                      Join the Beta
                    </button>
                  </div>
                  <div>
                    <h4 className="font-medium">For Platforms & Event Organizers:</h4>
                    <button className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg">
                      Become a Partner
                    </button>
                  </div>
                  <div>
                    <h4 className="font-medium">For Visionary Backers:</h4>
                    <button className="mt-2 border border-primary text-primary hover:bg-primary/5 px-4 py-2 rounded-lg">
                      Invest in the Future
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}