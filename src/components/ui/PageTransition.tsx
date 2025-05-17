import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number; // Duration in milliseconds
  transitionType?: 'fade' | 'slide' | 'zoom';
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  duration = 400,
  transitionType = 'slide'
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-transition-enter');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('page-transition-exit');
      
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('page-transition-enter');
      }, duration / 2);
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, duration]);

  // Apply different transition classes based on the type
  let transitionClass = 'page-transition-enter';
  
  switch (transitionType) {
    case 'fade':
      transitionClass = `animate-fade-in`;
      break;
    case 'zoom':
      transitionClass = `animate-scale-in`;
      break;
    case 'slide':
    default:
      transitionClass = transitionStage;
      break;
  }

  return (
    <div
      className={transitionClass}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
