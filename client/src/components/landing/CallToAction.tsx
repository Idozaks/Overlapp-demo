import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CallToAction() {
  const [, navigate] = useLocation();

  return (
    <section className="py-16 bg-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the Connection Revolution
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of Overlapp's innovative connection system that proactively links people through shared interests, both online and offline.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <h3 className="text-xl font-semibold mb-3">For Curious Early Adopters</h3>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/signup")}
              >
                Join the Beta
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <h3 className="text-xl font-semibold mb-3">For Platforms & Event Organizers</h3>
              <Button 
                size="lg"
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/contact")}
              >
                Become a Partner
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <h3 className="text-xl font-semibold mb-3">For Visionary Backers</h3>
              <Button 
                size="lg"
                variant="secondary" 
                className="w-full"
                onClick={() => navigate("/contact")}
              >
                Invest in the Future
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}