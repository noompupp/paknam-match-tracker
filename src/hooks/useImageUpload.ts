
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { imageOptimizationService, ImageMetadata, OptimizationOptions } from '@/services/imageOptimizationService';

interface UseImageUploadOptions {
  bucketId: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
  optimizationOptions?: OptimizationOptions;
  onUploadComplete?: (metadata: ImageMetadata) => void;
  onUploadError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadImage: (file: File, objectPath: string, altText?: string) => Promise<ImageMetadata | null>;
  uploadError: string | null;
  clearError: () => void;
}

export const useImageUpload = (options: UseImageUploadOptions): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    bucketId,
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    optimizationOptions = {},
    onUploadComplete,
    onUploadError
  } = options;

  const uploadImage = useCallback(async (
    file: File,
    objectPath: string,
    altText?: string
  ): Promise<ImageMetadata | null> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Validate file
      if (file.size > maxFileSize) {
        throw new Error(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
      }

      if (!acceptedFormats.includes(file.type)) {
        throw new Error(`File format not supported. Accepted: ${acceptedFormats.join(', ')}`);
      }

      console.log('🚀 Starting image upload and optimization...');
      setUploadProgress(25);

      // Optimize and upload
      const metadata = await imageOptimizationService.optimizeAndUpload(
        file,
        bucketId,
        objectPath,
        optimizationOptions,
        altText
      );

      setUploadProgress(100);
      console.log('✅ Image upload completed successfully');

      // Show success toast
      toast.success('Image uploaded and optimized successfully!', {
        description: `Created ${Object.keys(metadata.variants).length} variants`
      });

      // Call success callback
      onUploadComplete?.(metadata);

      return metadata;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('❌ Image upload failed:', error);
      
      setUploadError(errorMessage);
      
      // Show error toast
      toast.error('Image upload failed', {
        description: errorMessage
      });

      // Call error callback
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage));

      return null;

    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [bucketId, maxFileSize, acceptedFormats, optimizationOptions, onUploadComplete, onUploadError]);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadImage,
    uploadError,
    clearError
  };
};
