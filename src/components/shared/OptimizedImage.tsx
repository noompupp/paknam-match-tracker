
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { imageOptimizationService, ImageMetadata } from '@/services/imageOptimization';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fallback?: string | React.ReactNode;
  metadataId?: string;
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
  metadataId,
  variant = 'medium',
  style,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src || '');
  const [imageError, setImageError] = useState(false);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load metadata if metadataId is provided
  useEffect(() => {
    if (metadataId && !src) {
      imageOptimizationService
        .getImageMetadata(metadataId)
        .then((data) => {
          if (data) {
            setMetadata(data);
            const optimizedUrl = imageOptimizationService.getOptimizedUrl(data, variant);
            setImageSrc(optimizedUrl);
          }
        })
        .catch((error) => {
          console.error('Failed to load image metadata:', error);
          setImageError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (src) {
      // For external URLs, use them directly
      setImageSrc(src);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [metadataId, variant, src]);

  const handleImageError = () => {
    console.log('Image failed to load:', imageSrc);
    setImageError(true);
    
    if (metadata) {
      // Try fallback to original image
      const originalUrl = metadata.original_url;
      if (originalUrl !== imageSrc) {
        console.log('Trying fallback to original URL:', originalUrl);
        setImageSrc(originalUrl);
        setImageError(false);
        return;
      }
    }
    
    // Use provided fallback
    if (fallback && typeof fallback === 'string') {
      console.log('Using string fallback:', fallback);
      setImageSrc(fallback);
      setImageError(false);
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imageSrc);
    setIsLoading(false);
    setImageError(false);
  };

  // Show loading state
  if (isLoading && metadataId) {
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

  // Render responsive image with sources if metadata is available
  if (metadata) {
    const sources = imageOptimizationService.getResponsiveSources(metadata);
    
    if (sources.length > 0) {
      return (
        <picture className={className}>
          {sources.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              media={source.media}
              type="image/webp"
            />
          ))}
          <img
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={style}
            className="w-full h-full object-cover"
            {...props}
          />
        </picture>
      );
    }
  }

  // Standard img element for external URLs and direct sources
  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      onError={handleImageError}
      onLoad={handleImageLoad}
      className={cn("object-cover", className)}
      style={style}
      crossOrigin="anonymous"
      {...props}
    />
  );
};

export default OptimizedImage;
