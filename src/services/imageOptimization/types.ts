
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

export interface ProcessedImage {
  file: File;
  width: number;
  height: number;
}
