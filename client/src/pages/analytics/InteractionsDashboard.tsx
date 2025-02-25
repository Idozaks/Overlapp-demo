
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyceliumGraph } from '@/components/analytics/MyceliumGraph';
import { useToast } from "@/hooks/use-toast";
import { generateQuirkyName } from '@/lib/nameGenerator';

type Interaction = {
  id: string;
  sourceUser: string;
  targetUser: string;
  type: 'follow' | 'like' | 'comment' | 'physical_overlap';
  timestamp: number;
  location?: string;
};

export default function InteractionsDashboard() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Mock real-time data for demo
    const interval = setInterval(() => {
      const newInteraction: Interaction = {
        id: Math.random().toString(36).substr(2, 9),
        sourceUser: generateQuirkyName(),
        targetUser: generateQuirkyName(),
        type: ['follow', 'like', 'comment', 'physical_overlap'][Math.floor(Math.random() * 4)] as any,
        timestamp: Date.now(),
        location: Math.random() > 0.5 ? 'Store #123' : undefined
      };

      setInteractions(prev => [...prev.slice(-50), newInteraction]);
      
      if (newInteraction.type === 'physical_overlap') {
        toast({
          title: "Physical Overlap Detected!",
          description: `${newInteraction.sourceUser} and ${newInteraction.targetUser} crossed paths`,
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Real-time Phygital Interactions</CardTitle>
        </CardHeader>
        <CardContent className="h-[70vh]">
          <MyceliumGraph interactions={interactions} />
        </CardContent>
      </Card>
    </div>
  );
}
