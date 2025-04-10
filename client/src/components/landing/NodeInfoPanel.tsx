import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { NodeData, ConnectionData } from './EnhancedOverlappAnimation';
import { X, Info, Link as LinkIcon, ArrowRight } from 'lucide-react';

interface NodeInfoPanelProps {
  nodeData: NodeData | null;
  onClose: () => void;
}

// Function to get a color class based on node type
const getNodeColorClass = (type: string): string => {
  const colorMap: Record<string, string> = {
    user: 'bg-blue-500',
    business: 'bg-orange-500',
    interest: 'bg-green-500',
    location: 'bg-yellow-500',
    event: 'bg-purple-500',
    brand: 'bg-indigo-500',
    product: 'bg-red-500',
  };
  return colorMap[type] || 'bg-gray-500';
};

// Function to get user-friendly node type name
const getNodeTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    user: 'User',
    business: 'Business',
    interest: 'Interest',
    location: 'Location',
    event: 'Event',
    brand: 'Brand',
    product: 'Product',
  };
  return typeMap[type] || type;
};

// Function to get a description for a node type
const getNodeTypeDescription = (type: string): string => {
  const descriptionMap: Record<string, string> = {
    user: 'A person or user profile with unique interests and behaviors.',
    business: 'A commercial entity that offers products or services.',
    interest: 'A topic, hobby, or area of focus that connects users.',
    location: 'A physical place where users and businesses interact.',
    event: 'A time-bound happening that brings people together.',
    brand: 'A distinctive identity associated with products or services.',
    product: 'An item or service offered to users by businesses.',
  };
  return descriptionMap[type] || 'No description available.';
};

// Function to group connections by their connection type
const groupConnectionsByType = (connections: ConnectionData[]): Record<string, ConnectionData[]> => {
  const grouped: Record<string, ConnectionData[]> = {};
  
  connections.forEach(connection => {
    const type = connection.connectionType;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(connection);
  });
  
  return grouped;
};

const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({ nodeData, onClose }) => {
  if (!nodeData) {
    return null;
  }

  const groupedConnections = groupConnectionsByType(nodeData.connections);

  return (
    <Card className="w-full md:w-80 h-full overflow-auto p-4 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Node Details</h3>
        <button 
          onClick={onClose}
          aria-label="Close panel"
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-4 h-4 rounded-full ${getNodeColorClass(nodeData.type)}`} />
          <h4 className="font-medium text-xl">{nodeData.label}</h4>
        </div>
        <Badge className={`${getNodeColorClass(nodeData.type)} text-white`}>
          {getNodeTypeName(nodeData.type)}
        </Badge>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {getNodeTypeDescription(nodeData.type)}
        </p>
      </div>
      
      <Separator className="my-4" />
      
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <LinkIcon size={16} />
          Connections ({nodeData.connections.length})
        </h4>
        
        {Object.entries(groupedConnections).length > 0 ? (
          Object.entries(groupedConnections).map(([type, connections]) => (
            <div key={type} className="mb-4">
              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize mb-2">
                {type.replace('_', ' ')}
              </h5>
              <div className="space-y-2">
                {connections.map((connection, idx) => {
                  const isSource = connection.sourceId === nodeData.id;
                  const connectedNodeId = isSource ? connection.targetId : connection.sourceId;
                  const connectedNodeLabel = isSource ? connection.targetLabel : connection.sourceLabel;
                  const connectedNodeType = isSource ? connection.targetType : connection.sourceType;
                  
                  return (
                    <div key={idx} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getNodeColorClass(connectedNodeType)}`} />
                        <span className="text-sm truncate">{connectedNodeLabel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        {isSource ? (
                          <>
                            <span>This node</span>
                            <ArrowRight size={12} />
                            <span>{connection.connectionLabel}</span>
                            <ArrowRight size={12} />
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {getNodeTypeName(connectedNodeType)}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {getNodeTypeName(connectedNodeType)}
                            </Badge>
                            <ArrowRight size={12} />
                            <span>{connection.connectionLabel}</span>
                            <ArrowRight size={12} />
                            <span>this node</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <Info size={16} className="mr-2 text-gray-500" />
            <p className="text-sm text-gray-500">No connections found</p>
          </div>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        <p>ID: {nodeData.id}</p>
        <p className="mt-1">Click and drag other nodes to explore connections</p>
      </div>
    </Card>
  );
};

export default NodeInfoPanel;