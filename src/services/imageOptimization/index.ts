
import { ImageMetadata, ImageVariant, OptimizationOptions } from './types';
import { imageValidationService } from './validation';
import { imageProcessorService } from './imageProcessor';
import { imageStorageService } from './storageService';

export * from './types';

class ImageOptimizationService {
  /**
   * Optimize and upload an image with multiple variants
   */
  async optimizeAndUpload(
    file: File,
    bucketId: string,
    objectPath: string,
    options: OptimizationOptions = {},
    altText?: string
  ): Promise<ImageMetadata> {
    try {
      console.log('🖼️ Starting image optimization for:', objectPath);

      // Validate file
      imageValidationService.validateFile(file);

      // Get image dimensions
      const dimensions = await imageProcessorService.getImageDimensions(file);
      
      // Create variants
      const variants = await imageProcessorService.createImageVariants(file, options);
      
      // Upload original and variants
      const { originalUrl, uploadedVariants } = await imageStorageService.uploadImages(
        file,
        variants,
        bucketId,
        objectPath
      );

      // Save metadata to database
      const metadata = await imageStorageService.saveMetadata(
        originalUrl,
        bucketId,
        objectPath,
        file,
        dimensions,
        uploadedVariants,
        altText
      );

      console.log('✅ Image optimization completed successfully');
      return metadata;

    } catch (error) {
      console.error('❌ Image optimization failed:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL for a specific variant
   */
  getOptimizedUrl(metadata: ImageMetadata, variantName: string = 'medium'): string {
    const variant = metadata.variants[variantName];
    if (variant) {
      return variant.url;
    }
    
    // Fallback to original or first available variant
    const availableVariants = Object.values(metadata.variants);
    if (availableVariants.length > 0) {
      return availableVariants[0].url;
    }
    
    return metadata.original_url;
  }

  /**
   * Get responsive image sources for different screen sizes
   */
  getResponsiveSources(metadata: ImageMetadata): Array<{ srcSet: string; media: string }> {
    const sources = [];
    
    if (metadata.variants.large) {
      sources.push({
        srcSet: metadata.variants.large.url,
        media: '(min-width: 1024px)'
      });
    }
    
    if (metadata.variants.medium) {
      sources.push({
        srcSet: metadata.variants.medium.url,
        media: '(min-width: 640px)'
      });
    }
    
    if (metadata.variants.small) {
      sources.push({
        srcSet: metadata.variants.small.url,
        media: '(max-width: 639px)'
      });
    }

    return sources;
  }

  /**
   * Get image metadata by ID
   */
  async getImageMetadata(id: string): Promise<ImageMetadata | null> {
    return imageStorageService.getImageMetadata(id);
  }

  /**
   * Clean up orphaned images
   */
  async cleanupOrphanedImages(): Promise<number> {
    return imageStorageService.cleanupOrphanedImages();
  }
}

export const imageOptimizationService = new ImageOptimizationService();
