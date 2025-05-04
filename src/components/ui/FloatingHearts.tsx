
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FloatingHeartsProps {
  count?: number;
}

const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 3 }) => {
  const [hearts, setHearts] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    const newHearts = Array.from({ length: count }, (_, index) => {
      const randomLeft = Math.random() * 100;
      const randomDelay = Math.random() * 0.5;
      const randomSize = Math.random() * 10 + 14;
      
      return (
        <Heart
          key={index}
          className="text-journal-blush absolute animate-float-heart"
          style={{
            left: `${randomLeft}%`,
            animationDelay: `${randomDelay}s`,
            width: `${randomSize}px`,
            height: `${randomSize}px`,
          }}
          fill="#FFDEE2"
        />
      );
    });
    
    setHearts(newHearts);
    
    // Remove hearts after animation completes
    const timer = setTimeout(() => {
      setHearts([]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [count]);
  
  return <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">{hearts}</div>;
};

export default FloatingHearts;
