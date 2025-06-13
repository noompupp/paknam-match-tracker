
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fallback?: string | React.ReactNode;
  variant?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  loading = 'lazy',
  fallback,
  variant = 'medium',
  style,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Show loading state
  if (isLoading && src) {
    return (
      <div 
        className={cn(
          "bg-muted animate-pulse flex items-center justify-center",
          className
        )}
        style={{ width, height, ...style }}
      >
        <div className="w-8 h-8 rounded-full bg-muted-foreground/20 animate-pulse" />
      </div>
    );
  }

  // Show error state or fallback
  if (imageError && !fallback) {
    return (
      <div 
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className
        )}
        style={{ width, height, ...style }}
      >
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  // Show React element fallback if image failed and fallback is a React element
  if (imageError && fallback && typeof fallback !== 'string') {
    return (
      <div 
        className={cn(
          "flex items-center justify-center",
          className
        )}
        style={{ width, height, ...style }}
      >
        {fallback}
      </div>
    );
  }

  // Standard img element
  return (
    <img
      src={imageError && fallback && typeof fallback === 'string' ? fallback : src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      onError={handleImageError}
      onLoad={handleImageLoad}
      className={cn("object-cover", className)}
      style={style}
      {...props}
    />
  );
};

export default OptimizedImage;
