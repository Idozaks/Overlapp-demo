import React from 'react';
import EnhancedOverlappAnimation from '../components/landing/EnhancedOverlappAnimation';

// Simple page that only contains the animation for embedding
const Animation: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800">
      <EnhancedOverlappAnimation className="h-screen" />
    </div>
  );
};

export default Animation;