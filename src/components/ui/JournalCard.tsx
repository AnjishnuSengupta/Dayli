
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
  const animationClass = animated ? 'animate-fade-in hover:shadow-xl hover:-translate-y-1' : '';
  
  return (
    <div 
      className={`journal-card ${className} ${animationClass} transition-all duration-300`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default JournalCard;
