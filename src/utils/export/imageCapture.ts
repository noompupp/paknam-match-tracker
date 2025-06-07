
import html2canvas from 'html2canvas';

export interface CaptureOptions {
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  scrollX?: number;
  scrollY?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  windowWidth?: number;
  windowHeight?: number;
}

export const createCanvasFromElement = async (elementId: string, options: CaptureOptions = {}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for capture');
  }

  const defaultOptions: CaptureOptions = {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    ...options
  };

  return await html2canvas(element, defaultOptions);
};

export const getMobileOptimizedCaptureOptions = (element: HTMLElement): CaptureOptions => {
  const isMobile = window.innerWidth < 768;
  
  if (!isMobile) {
    return {
      width: element.scrollWidth,
      height: element.scrollHeight,
      x: 0,
      y: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  }

  // Enhanced mobile export settings for better quality
  const devicePixelRatio = window.devicePixelRatio || 2;
  const exportWidth = 375; // Standard mobile story width
  const contentHeight = element.scrollHeight;
  
  // Calculate optimal export height while maintaining aspect ratio
  const optimalHeight = Math.min(Math.max(contentHeight, 600), 1200);
  
  return {
    scale: devicePixelRatio,
    width: exportWidth,
    height: optimalHeight,
    x: 0,
    y: 0,
    windowWidth: exportWidth,
    windowHeight: optimalHeight,
    backgroundColor: '#ffffff'
  };
};

export const captureImageForSharing = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for capture');
  }

  const isMobile = window.innerWidth < 768;
  
  // Enhanced mobile export preparation
  if (isMobile) {
    element.classList.add('export-mode-mobile');
    
    // Apply temporary styles for better export quality
    const originalStyles = {
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      padding: element.style.padding,
      fontSize: element.style.fontSize
    };
    
    // Optimize element for export
    element.style.width = '375px';
    element.style.maxWidth = '375px';
    element.style.fontSize = '14px';
    
    // Wait for layout stabilization
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const mobileOptions = getMobileOptimizedCaptureOptions(element);
      const canvas = await createCanvasFromElement(elementId, mobileOptions);

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/jpeg', 0.9);
      });
    } finally {
      // Restore original styles
      element.style.width = originalStyles.width;
      element.style.maxWidth = originalStyles.maxWidth;
      element.style.padding = originalStyles.padding;
      element.style.fontSize = originalStyles.fontSize;
      element.classList.remove('export-mode-mobile');
    }
  } else {
    // Desktop capture
    const canvas = await createCanvasFromElement(elementId, {
      backgroundColor: '#ffffff',
      scale: 2
    });
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/jpeg', 0.9);
    });
  }
};

export const exportToJPEG = async (elementId: string, filename: string) => {
  const canvas = await createCanvasFromElement(elementId);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.9);
  link.click();
};
