
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import p5 from 'p5';
import { Card } from '@/components/ui/card';

type Circle = {
  id: string;
  label: string;
  description: string;
  color: string;
  x: number;
  y: number;
  r: number;
  dragging: boolean;
  offsetX: number;
  offsetY: number;
};

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
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const { t } = useTranslation();
  
  useEffect(() => {
    // Only create the p5 instance once
    if (!p5InstanceRef.current && p5ContainerRef.current) {
      const sketch = (p: p5) => {
        // Define circles
        const circles: Circle[] = [
          {
            id: "ai",
            label: "AI Analytics",
            description: intersections[2].description,
            color: "rgba(216, 180, 254, 0.7)", // Lighter purple
            x: 0,
            y: 0,
            r: 120,
            dragging: false,
            offsetX: 0,
            offsetY: 0
          },
          {
            id: "digital",
            label: "Your Digital Identity",
            description: intersections[1].description,
            color: "rgba(165, 180, 252, 0.7)", // Light blue
            x: 0,
            y: 0,
            r: 120,
            dragging: false,
            offsetX: 0,
            offsetY: 0
          },
          {
            id: "physical",
            label: "Seamless Physical Integration",
            description: intersections[0].description,
            color: "rgba(196, 181, 253, 0.7)", // Light purple
            x: 0,
            y: 0,
            r: 120,
            dragging: false,
            offsetX: 0,
            offsetY: 0
          }
        ];

        // Calculate initial positions in a triangle formation
        const setInitialPositions = () => {
          const centerX = p.width / 2;
          const centerY = p.height / 2;
          const radius = Math.min(p.width, p.height) * 0.25;
          
          circles.forEach((circle, index) => {
            const angle = (index * 2 * Math.PI) / 3;
            circle.x = centerX + radius * Math.cos(angle);
            circle.y = centerY + radius * Math.sin(angle);
          });
        };

        p.setup = () => {
          const canvasWidth = p5ContainerRef.current?.clientWidth || 600;
          const canvasHeight = 500;
          p.createCanvas(canvasWidth, canvasHeight);
          p.textAlign(p.CENTER, p.CENTER);
          setInitialPositions();
        };

        p.draw = () => {
          p.clear();
          
          // Draw circles with blend mode
          p.push();
          p.blendMode(p.MULTIPLY);
          
          // Draw circles
          circles.forEach(circle => {
            p.noStroke();
            p.fill(circle.color);
            p.ellipse(circle.x, circle.y, circle.r * 2);
          });
          
          p.pop();
          
          // Find intersections
          const intersections = findIntersections(circles);
          
          // Draw labels for circles
          circles.forEach(circle => {
            p.fill(80, 80, 100);
            p.textSize(16);
            p.textStyle(p.BOLD);
            p.text(circle.label, circle.x, circle.y);
          });
          
          // Draw intersection text
          intersections.forEach(intersection => {
            if (intersection.circles.length === 2) {
              const c1 = intersection.circles[0];
              const c2 = intersection.circles[1];
              
              // Calculate the midpoint of the intersection
              const midX = (c1.x + c2.x) / 2;
              const midY = (c1.y + c2.y) / 2;
              
              // Calculate the angle of the intersection
              const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
              
              p.push();
              p.translate(midX, midY);
              p.rotate(angle);
              
              p.fill(50, 50, 70);
              p.textSize(14);
              p.textStyle(p.BOLD);
              
              const label = getIntersectionLabel(c1.id, c2.id);
              p.text(label, 0, 0);
              
              p.pop();
            } else if (intersection.circles.length === 3) {
              // Center of all three circles
              const centerX = (circles[0].x + circles[1].x + circles[2].x) / 3;
              const centerY = (circles[0].y + circles[1].y + circles[2].y) / 3;
              
              p.fill(40, 40, 60);
              p.textSize(16);
              p.textStyle(p.BOLD);
              p.text("Overlapp", centerX, centerY);
            }
          });
        };

        // Find all intersections between circles
        const findIntersections = (circles: Circle[]) => {
          const intersections: { circles: Circle[] }[] = [];
          
          // Check each pair of circles
          for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
              const c1 = circles[i];
              const c2 = circles[j];
              
              const distance = p.dist(c1.x, c1.y, c2.x, c2.y);
              
              // If circles overlap
              if (distance < c1.r + c2.r) {
                intersections.push({
                  circles: [c1, c2]
                });
              }
            }
          }
          
          // Check if all three circles intersect
          const c1 = circles[0];
          const c2 = circles[1];
          const c3 = circles[2];
          
          const d12 = p.dist(c1.x, c1.y, c2.x, c2.y);
          const d23 = p.dist(c2.x, c2.y, c3.x, c3.y);
          const d31 = p.dist(c3.x, c3.y, c1.x, c1.y);
          
          if (d12 < c1.r + c2.r && d23 < c2.r + c3.r && d31 < c3.r + c1.r) {
            // Find the centroid
            const centerX = (c1.x + c2.x + c3.x) / 3;
            const centerY = (c1.y + c2.y + c3.y) / 3;
            
            // Check if the centroid is inside all three circles
            const inC1 = p.dist(centerX, centerY, c1.x, c1.y) < c1.r;
            const inC2 = p.dist(centerX, centerY, c2.x, c2.y) < c2.r;
            const inC3 = p.dist(centerX, centerY, c3.x, c3.y) < c3.r;
            
            if (inC1 && inC2 && inC3) {
              intersections.push({
                circles: [c1, c2, c3]
              });
            }
          }
          
          return intersections;
        };

        // Get an appropriate label for the intersection
        const getIntersectionLabel = (id1: string, id2: string) => {
          const pair = [id1, id2].sort().join('-');
          
          switch (pair) {
            case 'ai-digital':
              return "Smart Analytics";
            case 'ai-physical':
              return "Contextual AI";
            case 'digital-physical':
              return "Phygital Identity";
            default:
              return "";
          }
        };

        // Mouse pressed event
        p.mousePressed = () => {
          circles.forEach(circle => {
            const d = p.dist(p.mouseX, p.mouseY, circle.x, circle.y);
            if (d < circle.r) {
              circle.dragging = true;
              circle.offsetX = circle.x - p.mouseX;
              circle.offsetY = circle.y - p.mouseY;
            }
          });
        };

        // Mouse dragged event
        p.mouseDragged = () => {
          circles.forEach(circle => {
            if (circle.dragging) {
              circle.x = p.mouseX + circle.offsetX;
              circle.y = p.mouseY + circle.offsetY;
            }
          });
        };

        // Mouse released event
        p.mouseReleased = () => {
          circles.forEach(circle => {
            circle.dragging = false;
          });
        };

        // Touch started event
        p.touchStarted = () => {
          circles.forEach(circle => {
            const d = p.dist(p.touches[0]?.x || 0, p.touches[0]?.y || 0, circle.x, circle.y);
            if (d < circle.r) {
              circle.dragging = true;
              circle.offsetX = circle.x - (p.touches[0]?.x || 0);
              circle.offsetY = circle.y - (p.touches[0]?.y || 0);
            }
          });
          return false;
        };

        // Touch moved event
        p.touchMoved = () => {
          circles.forEach(circle => {
            if (circle.dragging) {
              circle.x = (p.touches[0]?.x || 0) + circle.offsetX;
              circle.y = (p.touches[0]?.y || 0) + circle.offsetY;
            }
          });
          return false;
        };

        // Touch ended event
        p.touchEnded = () => {
          circles.forEach(circle => {
            circle.dragging = false;
          });
          return false;
        };

        // Window resized event
        p.windowResized = () => {
          if (p5ContainerRef.current) {
            p.resizeCanvas(p5ContainerRef.current.clientWidth, 500);
            setInitialPositions();
          }
        };
      };

      p5InstanceRef.current = new p5(sketch, p5ContainerRef.current);
    }

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [t]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('common.landing.connect')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('common.landing.features.subtitle')}
          </p>
        </div>
        
        <div className="relative">
          <div 
            ref={p5ContainerRef} 
            className="w-full h-[500px] max-w-3xl mx-auto" 
          />
          <div className="text-center text-sm text-gray-500 mt-2">
            Drag the circles to explore different intersections
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {intersections.map((item, index) => (
            <Card key={index} className="p-6">
              <h4 className="text-lg font-semibold mb-2">{t(item.label)}</h4>
              <p className="text-gray-600">{t(item.description)}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
