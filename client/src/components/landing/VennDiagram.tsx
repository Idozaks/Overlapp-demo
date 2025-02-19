import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const circles = [
  { id: 1, label: "Digital Identity", color: "rgba(99, 102, 241, 0.4)" },
  { id: 2, label: "Physical World", color: "rgba(139, 92, 246, 0.4)" },
  { id: 3, label: "AI Insights", color: "rgba(168, 85, 247, 0.4)" }
];

const intersections = [
  { 
    label: "Smart Shopping",
    description: "Personalized retail experiences based on your preferences"
  },
  {
    label: "Location Intelligence",
    description: "Context-aware recommendations and services"
  },
  {
    label: "Digital Twin",
    description: "Your complete digital representation"
  }
];

export default function VennDiagram() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [0.9, 1],
      opacity: [0, 1],
      transition: { duration: 0.8 }
    });
  }, [controls]);

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
            Where Everything Connects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how Overlapp brings together your digital identity, physical world, and AI insights
          </p>
        </motion.div>

        <motion.div 
          animate={controls}
          className="relative h-[500px] max-w-3xl mx-auto"
        >
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full"
          >
            {circles.map((circle, index) => {
              const angle = (index * 2 * Math.PI) / 3;
              const cx = 200 + 80 * Math.cos(angle);
              const cy = 200 + 80 * Math.sin(angle);

              return (
                <g key={circle.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="100"
                    fill={circle.color}
                    className="mix-blend-multiply"
                  />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    className="text-sm font-semibold"
                    fill="#4B5563"
                  >
                    {circle.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="p-6 bg-white/90 backdrop-blur-sm max-w-xs">
              <h3 className="text-xl font-semibold mb-2">Overlapp Magic</h3>
              <p className="text-gray-600">
                Where your digital identity meets real-world experiences, enhanced by AI
              </p>
            </Card>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          {intersections.map((item, index) => (
            <Card key={index} className="p-6">
              <h4 className="text-lg font-semibold mb-2">{item.label}</h4>
              <p className="text-gray-600">{item.description}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
