import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingBag, Percent, Star } from "lucide-react";

const retailers = [
  {
    name: "Fashion Hub",
    category: "Clothing",
    discount: "20% off",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8"
  },
  {
    name: "Tech Store",
    category: "Electronics",
    discount: "Free Gift",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b"
  },
  {
    name: "Sports World",
    category: "Athletics",
    discount: "15% off",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"
  }
];

export default function RetailerDemo() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Connected Retail Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover personalized offers and experiences from your favorite retailers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {retailers.map((retailer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${retailer.image})`
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{retailer.name}</h3>
                    <Badge variant="secondary">
                      <Store className="w-4 h-4 mr-1" />
                      {retailer.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">{retailer.rating}</span>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <Percent className="w-4 h-4" />
                      {retailer.discount}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      Available in-store
                    </span>
                    <span className="text-primary font-medium">
                      View Details →
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
