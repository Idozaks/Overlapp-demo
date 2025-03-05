import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const circles = [
  { id: 1, label: "common.landing.identity.title", color: "rgba(99, 102, 241, 0.4)" },
  { id: 2, label: "common.landing.seamless", color: "rgba(139, 92, 246, 0.4)" },
  { id: 3, label: "common.landing.ai", color: "rgba(168, 85, 247, 0.4)" }
];

const intersections = [
  { 
    label: "common.landing.retail",
    description: "common.landing.features.physical.description"
  },
  {
    label: "common.landing.real_time",
    description: "common.landing.features.sync.description"
  },
  {
    label: "common.landing.experience",
    description: "common.landing.features.ai.description"
  }
];

export default function VennDiagram() {
  const controls = useAnimation();
  const { t } = useTranslation();

  useEffect(() => {
    controls.start({
      scale: [0.9, 1],
      opacity: [0, 1],
      transition: { duration: 0.8 }
    });
  }, [controls]);

  return (
    <section className="py-20 pb-48 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('common.landing.connect')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('common.landing.features.subtitle')}
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
                    {t(circle.label)}
                  </text>
                </g>
              );
            })}
          </svg>
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
              <h4 className="text-lg font-semibold mb-2">{t(item.label)}</h4>
              <p className="text-gray-600">{t(item.description)}</p>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

<style jsx>{`
  .venn-text-overlay {
    position: absolute;
    top: auto;
    bottom: -120px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: 100%;
    display: flex;
    justify-content: center;
  }
`}</style>