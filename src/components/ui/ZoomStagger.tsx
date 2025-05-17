import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZoomStaggerProps {
  children: ReactNode;
  className?: string;
  baseDelay?: number;
  incrementDelay?: number;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * ZoomStagger component applies staggered zoom animations to its children
 * It automatically adds incremental delays to each child for a staggered effect
 * Uses Framer Motion for enhanced animations
 */
const ZoomStagger: React.FC<ZoomStaggerProps> = ({
  children,
  className = '',
  baseDelay = 0,
  incrementDelay = 50,
  as: Component = 'div'
}) => {
  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: incrementDelay / 1000, // convert to seconds for framer-motion
        delayChildren: baseDelay / 1000 // convert to seconds
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Clone children and add framer-motion animations to each
  const staggeredChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return (
        <motion.div
          variants={itemVariants}
          className="zoom-stagger-item"
        >
          {child}
        </motion.div>
      );
    }
    return child;
  });

  return (
    <AnimatePresence>
      <motion.div
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {staggeredChildren}
      </motion.div>
    </AnimatePresence>
  );
};

export default ZoomStagger;
