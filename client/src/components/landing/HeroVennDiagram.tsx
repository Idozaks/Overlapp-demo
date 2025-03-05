
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const HeroVennDiagram = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 400;
    canvas.height = 300;
    
    // Define circle properties
    const leftCircle = {
      x: 150,
      y: 150,
      radius: 100,
      topColor: '#4c83ee',
      bottomColor: '#44bdbe'
    };
    
    const rightCircle = {
      x: 250,
      y: 150,
      radius: 100,
      topColor: '#44bdbe',
      bottomColor: '#a964cf'
    };
    
    // Create gradients
    const leftGradient = ctx.createLinearGradient(
      leftCircle.x, 
      leftCircle.y - leftCircle.radius, 
      leftCircle.x, 
      leftCircle.y + leftCircle.radius
    );
    leftGradient.addColorStop(0, leftCircle.topColor);
    leftGradient.addColorStop(1, leftCircle.bottomColor);
    
    const rightGradient = ctx.createLinearGradient(
      rightCircle.x, 
      rightCircle.y - rightCircle.radius, 
      rightCircle.x, 
      rightCircle.y + rightCircle.radius
    );
    rightGradient.addColorStop(0, rightCircle.topColor);
    rightGradient.addColorStop(1, rightCircle.bottomColor);
    
    // Function to draw the Venn diagram
    const drawVennDiagram = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw left circle with gradient
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(leftCircle.x, leftCircle.y, leftCircle.radius, 0, Math.PI * 2);
      ctx.fillStyle = leftGradient;
      ctx.fill();
      
      // Draw right circle with gradient
      ctx.beginPath();
      ctx.arc(rightCircle.x, rightCircle.y, rightCircle.radius, 0, Math.PI * 2);
      ctx.fillStyle = rightGradient;
      ctx.fill();
      
      // Draw intersection with blend mode
      ctx.globalCompositeOperation = 'multiply';
      ctx.beginPath();
      ctx.arc(leftCircle.x, leftCircle.y, leftCircle.radius, 0, Math.PI * 2);
      ctx.fillStyle = leftGradient;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(rightCircle.x, rightCircle.y, rightCircle.radius, 0, Math.PI * 2);
      ctx.fillStyle = rightGradient;
      ctx.fill();
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    };
    
    // Initial draw
    drawVennDiagram();
    
    // Redraw on window resize
    const handleResize = () => {
      drawVennDiagram();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <motion.div 
      className="relative w-full h-[300px] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <canvas 
        ref={canvasRef} 
        className="max-w-full"
        style={{ maxHeight: '100%' }}
      />
    </motion.div>
  );
};

export default HeroVennDiagram;
