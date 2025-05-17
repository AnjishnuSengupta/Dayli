
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingHeartsProps {
  count?: number;
}

const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 5 }) => {
  const [hearts, setHearts] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    // Generate hearts with randomized properties
    const newHearts = Array.from({ length: count }, (_, index) => {
      const randomLeft = Math.random() * 100;
      const randomDuration = Math.random() * 1 + 1.5; // Between 1.5 and 2.5 seconds
      const randomSize = Math.random() * 20 + 14; // Between 14px and 34px
      const randomRotation = Math.random() * 40 - 20; // Between -20 and 20 degrees
      const randomStartY = Math.random() * 20 + 60; // Start from different Y positions
      
      return (
        <motion.div
          key={index}
          initial={{ 
            opacity: 1, 
            scale: 0, 
            y: randomStartY, 
            x: randomLeft + '%',
            rotate: randomRotation
          }}
          animate={{ 
            opacity: 0, 
            scale: 1, 
            y: -60,
            rotate: randomRotation * -0.5 // Reverse rotation slightly
          }}
          transition={{ 
            duration: randomDuration,
            ease: "easeOut",
            delay: Math.random() * 0.3 // Random start delay
          }}
          style={{
            position: 'absolute',
            width: `${randomSize}px`,
            height: `${randomSize}px`,
          }}
        >
          <Heart
            className="text-journal-blush"
            fill="#FFDEE2"
            size="100%"
          />
        </motion.div>
      );
    });
    
    setHearts(newHearts);
    
    // Remove hearts after longest possible animation completes
    const timer = setTimeout(() => {
      setHearts([]);
    }, 2800);
    
    return () => clearTimeout(timer);
  }, [count]);
  
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      <AnimatePresence>
        {hearts}
      </AnimatePresence>
    </div>
  );
};

export default FloatingHearts;
