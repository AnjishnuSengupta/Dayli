
import React, { ReactNode } from 'react';

interface JournalCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

const JournalCard: React.FC<JournalCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  animated = false
}) => {
  const animationClass = animated ? 'animate-fade-in' : '';
  
  return (
    <div 
      className={`journal-card ${className} ${animationClass}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default JournalCard;
