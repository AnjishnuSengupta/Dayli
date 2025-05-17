import React, { ReactNode } from 'react';

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
 */
const ZoomStagger: React.FC<ZoomStaggerProps> = ({
  children,
  className = '',
  baseDelay = 0,
  incrementDelay = 50,
  as: Component = 'div'
}) => {
  // Clone children and add zoom-stagger-item class to each
  const staggeredChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      // Calculate the delay based on the index
      const delay = baseDelay + (index * incrementDelay);
      
      return React.cloneElement(child as React.ReactElement, {
        className: `${(child.props.className || '')} zoom-stagger-item`,
        style: { 
          ...child.props.style,
          animationDelay: `${delay}ms`
        }
      });
    }
    return child;
  });

  return (
    <Component className={className}>
      {staggeredChildren}
    </Component>
  );
};

export default ZoomStagger;
