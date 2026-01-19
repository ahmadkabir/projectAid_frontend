import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const ProjectImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '',
  showFallback = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleLoad = () => {
    setImageLoading(false);
  };

  // If image failed to load or no src, show fallback
  if (imageError || !src) {
    if (!showFallback) return null;
    
    return (
      <div className={`bg-gradient-to-br from-primary-blue to-primary-blue-light flex items-center justify-center ${className} ${fallbackClassName}`}>
        <div className="text-center text-white">
          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-75">No Image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`w-full h-full object-cover rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};

export default ProjectImage;
