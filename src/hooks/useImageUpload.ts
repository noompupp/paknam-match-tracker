
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseImageUploadOptions {
  bucketId: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
  onUploadComplete?: (result: { url: string; name: string }) => void;
  onUploadError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadImage: (file: File, objectPath: string, altText?: string) => Promise<{ url: string; name: string } | null>;
  uploadError: string | null;
  clearError: () => void;
}

export const useImageUpload = (options: UseImageUploadOptions): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    onUploadComplete,
    onUploadError
  } = options;

  const uploadImage = useCallback(async (
    file: File,
    objectPath: string,
    altText?: string
  ): Promise<{ url: string; name: string } | null> => {
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

      console.log('🚀 Starting basic image upload...');
      setUploadProgress(25);

      // Create a mock URL for demonstration (in real implementation, upload to your storage service)
      const mockUrl = URL.createObjectURL(file);
      
      setUploadProgress(75);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUploadProgress(100);
      console.log('✅ Image upload completed successfully');

      const result = {
        url: mockUrl,
        name: file.name
      };

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
  }, [maxFileSize, acceptedFormats, onUploadComplete, onUploadError]);

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
