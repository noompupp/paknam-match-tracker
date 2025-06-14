
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

/**
 * Renders an image with loading overlay, proper error handling, and customizable fallback.
 * Always renders <img> when src is provided, overlays loading, and simplifies state.
 */
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
  const [isLoading, setIsLoading] = useState(!!src);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const sizeStyle = (width || height)
    ? { width, height, ...style }
    : style;

  // Show fallback/error state if image failed to load
  if (imageError) {
    if (fallback && typeof fallback !== 'string') {
      // fallback is a React element
      return (
        <div
          className={cn("flex items-center justify-center", className)}
          style={sizeStyle}
        >
          {fallback}
        </div>
      );
    }
    // fallback is a string or not provided
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className
        )}
        style={sizeStyle}
      >
        <span className="text-sm">
          {typeof fallback === 'string' ? fallback : 'Image not available'}
        </span>
      </div>
    );
  }

  // No src at all, just render fallback or placeholder
  if (!src) {
    if (fallback && typeof fallback !== 'string') {
      return (
        <div
          className={cn("flex items-center justify-center", className)}
          style={sizeStyle}
        >
          {fallback}
        </div>
      );
    }
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className
        )}
        style={sizeStyle}
      >
        <span className="text-sm">
          {typeof fallback === 'string' ? fallback : 'Image not available'}
        </span>
      </div>
    );
  }

  // Render <img> with a loading overlay if not loaded yet
  return (
    <div className={cn("relative", className)} style={sizeStyle}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={cn(
          "object-cover w-full h-full",
          isLoading ? "opacity-60 transition-opacity" : "opacity-100"
        )}
        style={{ width: "100%", height: "100%", display: 'block' }}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/70 z-10 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-muted-foreground/20 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

