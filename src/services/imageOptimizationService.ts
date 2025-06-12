

import { supabase } from '@/integrations/supabase/client';

export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ImageMetadata {
  id: string;
  original_url: string;
  bucket_id: string;
  object_path: string;
  file_size: number;
  width: number;
  height: number;
  format: string;
  variants: Record<string, ImageVariant>;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  variants?: Array<{
    name: string;
    width: number;
    height?: number;
    quality?: number;
  }>;
}

class ImageOptimizationService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

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
      this.validateFile(file);

      // Get image dimensions
      const dimensions = await this.getImageDimensions(file);
      
      // Create variants
      const variants = await this.createImageVariants(file, options);
      
      // Upload original and variants
      const uploadedVariants: Record<string, ImageVariant> = {};
      
      // Upload original
      const originalPath = `${objectPath}/original.${this.getFileExtension(file.name)}`;
      const { data: originalUpload, error: originalError } = await supabase.storage
        .from(bucketId)
        .upload(originalPath, file, { upsert: true });

      if (originalError) throw originalError;

      const originalUrl = supabase.storage.from(bucketId).getPublicUrl(originalPath).data.publicUrl;

      // Upload variants
      for (const [variantName, variantFile] of Object.entries(variants)) {
        const variantPath = `${objectPath}/${variantName}.webp`;
        const { data: variantUpload, error: variantError } = await supabase.storage
          .from(bucketId)
          .upload(variantPath, variantFile.file, { upsert: true });

        if (variantError) {
          console.warn(`Failed to upload variant ${variantName}:`, variantError);
          continue;
        }

        const variantUrl = supabase.storage.from(bucketId).getPublicUrl(variantPath).data.publicUrl;
        uploadedVariants[variantName] = {
          url: variantUrl,
          width: variantFile.width,
          height: variantFile.height,
          format: 'webp',
          size: variantFile.file.size
        };
      }

      // Save metadata to database with proper type conversion
      const { data: metadata, error: metadataError } = await supabase
        .from('image_metadata')
        .insert({
          original_url: originalUrl,
          bucket_id: bucketId,
          object_path: objectPath,
          file_size: file.size,
          width: dimensions.width,
          height: dimensions.height,
          format: file.type,
          variants: uploadedVariants as any, // Cast to any for database insertion
          alt_text: altText
        })
        .select()
        .single();

      if (metadataError) throw metadataError;

      console.log('✅ Image optimization completed successfully');
      
      // Return properly typed metadata
      return {
        ...metadata,
        variants: uploadedVariants
      } as ImageMetadata;

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
   * Create image variants with different sizes and optimizations
   */
  private async createImageVariants(
    file: File,
    options: OptimizationOptions
  ): Promise<Record<string, { file: File; width: number; height: number }>> {
    const variants: Record<string, { file: File; width: number; height: number }> = {};
    
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
  private async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight?: number,
    quality: number = 85
  ): Promise<{ file: File; width: number; height: number }> {
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

  /**
   * Get image dimensions from file
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image for dimensions'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(`Unsupported file format. Supported: ${this.SUPPORTED_FORMATS.join(', ')}`);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg';
  }

  /**
   * Clean up orphaned images
   */
  async cleanupOrphanedImages(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_orphaned_images');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Failed to cleanup orphaned images:', error);
      return 0;
    }
  }

  /**
   * Get image metadata by ID
   */
  async getImageMetadata(id: string): Promise<ImageMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('image_metadata')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Convert the database response to our typed interface with proper type safety
      const typedVariants: Record<string, ImageVariant> = {};
      
      if (data.variants && typeof data.variants === 'object' && !Array.isArray(data.variants)) {
        Object.entries(data.variants).forEach(([key, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const variant = value as any;
            if (variant.url && variant.width && variant.height && variant.format && variant.size) {
              typedVariants[key] = {
                url: variant.url,
                width: variant.width,
                height: variant.height,
                format: variant.format,
                size: variant.size
              };
            }
          }
        });
      }
      
      return {
        ...data,
        variants: typedVariants
      } as ImageMetadata;
    } catch (error) {
      console.error('Failed to get image metadata:', error);
      return null;
    }
  }
}

export const imageOptimizationService = new ImageOptimizationService();

