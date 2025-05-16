
import React, { ReactNode } from 'react';

interface JournalCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  animationType?: 'fade' | 'zoom' | 'slide-left' | 'slide-right' | 'float';
  delay?: number;
  hover?: 'scale' | 'lift' | 'none';
}

const JournalCard: React.FC<JournalCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  animated = false,
  animationType = 'fade',
  delay = 0,
  hover = 'none'
}) => {
  let animationClass = '';
  
  if (animated) {
    switch (animationType) {
      case 'zoom':
        animationClass = 'animate-zoom-in';
        break;
      case 'slide-left':
        animationClass = 'animate-slide-in-left';
        break;
      case 'slide-right':
        animationClass = 'animate-slide-in-right';
        break;
      case 'float':
        animationClass = 'animate-float-in';
        break;
      case 'fade':
      default:
        animationClass = 'animate-fade-in';
        break;
    }
  }
  
  let hoverClass = '';
  switch (hover) {
    case 'scale':
      hoverClass = 'hover-scale';
      break;
    case 'lift':
      hoverClass = 'hover-lift';
      break;
    default:
      hoverClass = '';
      break;
  }
  
  const delayStyle = delay ? { animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' } : {};
  
  return (
    <div 
      className={`journal-card ${className} ${animationClass} ${hoverClass}`}
      style={delayStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default JournalCard;
