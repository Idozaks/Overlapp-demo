
import { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface MyceliumGraphProps {
  interactions: {
    id: string;
    sourceUser: string;
    targetUser: string;
    type: string;
    timestamp: number;
  }[];
}

export function MyceliumGraph({ interactions }: MyceliumGraphProps) {
  const graphRef = useRef<any>();

  const nodes = Array.from(
    new Set(interactions.flatMap(i => [i.sourceUser, i.targetUser]))
  ).map(id => ({
    id,
    val: 1,
  }));

  const links = interactions.map(i => ({
    source: i.sourceUser,
    target: i.targetUser,
    type: i.type,
  }));

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-100);
      graphRef.current.d3Force('link').distance(50);
    }
  }, []);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={{ nodes, links }}
      nodeColor={() => '#4CAF50'}
      linkColor={link => 
        link.type === 'physical_overlap' ? '#FF4081' :
        link.type === 'follow' ? '#2196F3' :
        link.type === 'like' ? '#FFC107' : '#9C27B0'
      }
      nodeRelSize={8}
      linkWidth={2}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.005}
      cooldownTicks={100}
      onEngineStop={() => {
        if (graphRef.current) {
          graphRef.current.zoomToFit(400);
        }
      }}
    />
  );
}
