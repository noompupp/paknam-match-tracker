
import { OptimizationOptions, ProcessedImage } from './types';

export class ImageProcessorService {
  /**
   * Get image dimensions from file
   */
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image for dimensions'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Create image variants with different sizes and optimizations
   */
  async createImageVariants(
    file: File,
    options: OptimizationOptions
  ): Promise<Record<string, ProcessedImage>> {
    const variants: Record<string, ProcessedImage> = {};
    
    // Default variants if none specified
    const defaultVariants = [
      { name: 'small', width: 300, quality: 80 },
      { name: 'medium', width: 600, quality: 85 },
      { name: 'large', width: 1200, quality: 90 }
    ];

    const variantsToCreate = options.variants || defaultVariants;

    for (const variant of variantsToCreate) {
      try {
        const optimized = await this.resizeImage(
          file, 
          variant.width, 
          'height' in variant ? variant.height : undefined, 
          variant.quality || 85
        );
        variants[variant.name] = optimized;
      } catch (error) {
        console.warn(`Failed to create variant ${variant.name}:`, error);
      }
    }

    return variants;
  }

  /**
   * Resize image using Canvas API
   */
  async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight?: number,
    quality: number = 85
  ): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate dimensions maintaining aspect ratio
        let { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            const optimizedFile = new File([blob], `optimized.webp`, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            
            resolve({ file: optimizedFile, width, height });
          },
          'image/webp',
          quality / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight?: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if wider than max width
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    // Scale down if taller than max height (if specified)
    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }
}

export const imageProcessorService = new ImageProcessorService();
