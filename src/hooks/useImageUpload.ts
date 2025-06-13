
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  bucketId: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadImage: (file: File, objectPath: string, altText?: string) => Promise<any | null>;
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
    onUploadComplete,
    onUploadError
  } = options;

  const uploadImage = useCallback(async (
    file: File,
    objectPath: string,
    altText?: string
  ): Promise<any | null> => {
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

      console.log('🚀 Starting image upload...');
      setUploadProgress(50);

      // Simple upload simulation - in a real app this would upload to storage
      const result = {
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      setUploadProgress(100);
      console.log('✅ Image upload completed successfully');

      // Show success toast
      toast.success('Image uploaded successfully!');

      // Call success callback
      onUploadComplete?.(result);

      return result;

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
  }, [bucketId, maxFileSize, acceptedFormats, onUploadComplete, onUploadError]);

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
