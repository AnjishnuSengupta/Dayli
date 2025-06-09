import React, { useState, useEffect } from 'react';
import { getFileData } from '@/lib/storage-smart';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Smart image component that can display images from both MinIO and fallback storage
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
        
        const imageData = await getFileData(src);
        if (imageData) {
          setImageSrc(imageData);
        } else {
          setError('Failed to load image');
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError('Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      loadImage();
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
