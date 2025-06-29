import React, { useState, useEffect } from 'react';
import { getImageData } from '@/services/imageService.universal';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Smart image component that displays images with loading and error handling
 */
export const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className, onClick }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the image service to get the actual image data
        const imageData = await getImageData(src);
        setImageSrc(imageData);
      } catch (err) {
        console.error('Error loading image:', err);
        setError('Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    if (src && src.trim()) {
      loadImage();
    } else {
      setIsLoading(false);
      setError('No image source provided');
    }
  }, [src]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <div className="text-gray-500">Failed to load image</div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setError('Image load error')}
    />
  );
};

export default SmartImage;
