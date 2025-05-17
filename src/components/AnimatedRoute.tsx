import React from 'react';
import { useLocation } from 'react-router-dom';
import PageTransition from './ui/PageTransition';

interface AnimatedRouteProps {
  children: React.ReactNode;
}

const AnimatedRoute: React.FC<AnimatedRouteProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <PageTransition key={location.pathname}>
      {children}
    </PageTransition>
  );
};

export default AnimatedRoute;
