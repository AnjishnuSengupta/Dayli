import React, { ReactNode, CSSProperties } from 'react';

interface JournalCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  animationType?: 'fade' | 'zoom' | 'slide-up' | 'slide-right' | 'float' | 'bounce' | 'scale-in' | 'slide-in-right';
  delay?: number;
  hover?: 'scale' | 'lift' | 'glow' | 'none';
  transition?: boolean;
  style?: CSSProperties;
}

const JournalCard: React.FC<JournalCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  animated = false,
  animationType = 'fade',
  delay = 0,
  hover = 'none',
  transition = true,
  style = {}
}) => {
  let animationClass = '';
  
  if (animated) {
    switch (animationType) {
      case 'zoom':
        animationClass = 'animate-scale-in';
        break;
      case 'slide-up':
        animationClass = 'animate-slide-up';
        break;
      case 'slide-right':
        animationClass = 'animate-slide-in-right';
        break;
      case 'float':
        animationClass = 'animate-float';
        break;
      case 'bounce':
        animationClass = 'animate-bounce-in';
        break;
      case 'scale-in':
        animationClass = 'animate-scale-in';
        break;
      case 'slide-in-right':
        animationClass = 'animate-slide-in-right';
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
    case 'glow':
      hoverClass = 'hover-glow';
      break;
    default:
      hoverClass = '';
      break;
  }
  
  const transitionClass = transition ? 'transition-all duration-300 ease-in-out' : '';
  const delayStyle = delay ? { animationDelay: `${delay}ms`, opacity: animated ? 0 : 1, animationFillMode: 'forwards' } : {};
  const combinedStyle = { ...delayStyle, ...style };
  
  return (
    <div 
      className={`journal-card bg-white rounded-xl shadow-md overflow-hidden ${className} ${animationClass} ${hoverClass} ${transitionClass}`}
      style={combinedStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default JournalCard;
