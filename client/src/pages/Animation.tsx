import React, { useState } from 'react';
import EnhancedOverlappAnimation, { NodeData } from '../components/landing/EnhancedOverlappAnimation';
import NodeInfoPanel from '../components/landing/NodeInfoPanel';

// Animation page that displays the animation with an info panel
const Animation: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const handleNodeSelect = (nodeData: NodeData) => {
    setSelectedNode(nodeData);
  };

  const handlePanelClose = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col md:flex-row">
      <div className={`flex-grow ${selectedNode ? 'md:w-2/3' : 'w-full'}`}>
        <EnhancedOverlappAnimation 
          className="h-screen" 
          onNodeSelect={handleNodeSelect}
        />
      </div>
      
      {/* Only show panel when a node is selected */}
      {selectedNode && (
        <div className="md:w-1/3 max-w-md h-full overflow-auto bg-white dark:bg-gray-800 shadow-lg">
          <NodeInfoPanel 
            nodeData={selectedNode} 
            onClose={handlePanelClose} 
          />
        </div>
      )}
      
      {/* Instruction banner */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm pointer-events-none">
        Click on any node to see detailed information
      </div>
    </div>
  );
};

export default Animation;