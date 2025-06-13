
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';
import OptimizedImage from './OptimizedImage';

interface ImageUploadProps {
  bucketId: string;
  objectPath: string;
  currentImage?: string;
  altText?: string;
  className?: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: Error) => void;
  disabled?: boolean;
  showPreview?: boolean;
  previewSize?: 'small' | 'medium' | 'large';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  bucketId,
  objectPath,
  currentImage,
  altText = 'Uploaded image',
  className,
  maxFileSize = 50 * 1024 * 1024,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  onUploadComplete,
  onUploadError,
  disabled = false,
  showPreview = true,
  previewSize = 'medium'
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { isUploading, uploadProgress, uploadImage, uploadError, clearError } = useImageUpload({
    bucketId,
    maxFileSize,
    acceptedFormats,
    onUploadComplete: (result) => {
      setPreview(null);
      setSelectedFile(null);
      onUploadComplete?.(result);
    },
    onUploadError
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      clearError();
    }
  }, [clearError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats.map(format => format.replace('image/', '.'))
    },
    multiple: false,
    disabled: disabled || isUploading,
    maxSize: maxFileSize
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    await uploadImage(selectedFile, objectPath, altText);
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setSelectedFile(null);
    clearError();
  };

  const getPreviewSizeClasses = () => {
    switch (previewSize) {
      case 'small':
        return 'w-32 h-32';
      case 'large':
        return 'w-64 h-64';
      default:
        return 'w-48 h-48';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Image Preview */}
      {showPreview && currentImage && !preview && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Image</label>
          <div className={cn("relative rounded-lg overflow-hidden border", getPreviewSizeClasses())}>
            <OptimizedImage
              src={currentImage}
              alt={altText}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          (disabled || isUploading) && "cursor-not-allowed opacity-50",
          uploadError && "border-destructive/50 bg-destructive/5"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-sm font-medium">Drop the image here</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">
                Drag & drop an image here, or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports: {acceptedFormats.map(f => f.replace('image/', '').toUpperCase()).join(', ')}
                <br />
                Max size: {Math.round(maxFileSize / 1024 / 1024)}MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview and Upload Controls */}
      {preview && selectedFile && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Preview</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePreview}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className={cn("relative rounded-lg overflow-hidden border", getPreviewSizeClasses())}>
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              {selectedFile.name} • {Math.round(selectedFile.size / 1024)}KB
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          <Button 
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{uploadError}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="mt-2 text-destructive hover:text-destructive"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
