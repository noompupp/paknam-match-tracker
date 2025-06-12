
import { supabase } from '@/integrations/supabase/client';
import { ImageMetadata, ImageVariant, ProcessedImage } from './types';

export class ImageStorageService {
  /**
   * Upload original and variant images to storage
   */
  async uploadImages(
    originalFile: File,
    variants: Record<string, ProcessedImage>,
    bucketId: string,
    objectPath: string
  ): Promise<{ originalUrl: string; uploadedVariants: Record<string, ImageVariant> }> {
    // Upload original
    const originalPath = `${objectPath}/original.${this.getFileExtension(originalFile.name)}`;
    const { data: originalUpload, error: originalError } = await supabase.storage
      .from(bucketId)
      .upload(originalPath, originalFile, { upsert: true });

    if (originalError) throw originalError;

    const originalUrl = supabase.storage.from(bucketId).getPublicUrl(originalPath).data.publicUrl;

    // Upload variants
    const uploadedVariants: Record<string, ImageVariant> = {};
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

    return { originalUrl, uploadedVariants };
  }

  /**
   * Save image metadata to database
   */
  async saveMetadata(
    originalUrl: string,
    bucketId: string,
    objectPath: string,
    originalFile: File,
    dimensions: { width: number; height: number },
    uploadedVariants: Record<string, ImageVariant>,
    altText?: string
  ): Promise<ImageMetadata> {
    const { data: metadata, error: metadataError } = await supabase
      .from('image_metadata')
      .insert({
        original_url: originalUrl,
        bucket_id: bucketId,
        object_path: objectPath,
        file_size: originalFile.size,
        width: dimensions.width,
        height: dimensions.height,
        format: originalFile.type,
        variants: uploadedVariants as any,
        alt_text: altText
      })
      .select()
      .single();

    if (metadataError) throw metadataError;

    return {
      ...metadata,
      variants: uploadedVariants
    } as ImageMetadata;
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
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg';
  }
}

export const imageStorageService = new ImageStorageService();
