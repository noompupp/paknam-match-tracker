
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

  // Get actual device dimensions for high-quality mobile export
  const devicePixelRatio = window.devicePixelRatio || 1;
  const actualWidth = window.screen.width * devicePixelRatio;
  const actualHeight = window.screen.height * devicePixelRatio;
  
  // Use actual screen dimensions for mobile story format
  return {
    scale: devicePixelRatio,
    width: Math.min(actualWidth, 1170), // Max width for story format
    height: Math.min(actualHeight, 2532), // Max height for story format
    x: 0,
    y: 0,
    windowWidth: actualWidth,
    windowHeight: actualHeight,
  };
};

export const captureImageForSharing = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for capture');
  }

  // For mobile, temporarily set export mode to optimize layout
  const isMobile = window.innerWidth < 768;
  let exportModeClass = '';
  
  if (isMobile) {
    exportModeClass = 'export-mode-mobile';
    element.classList.add(exportModeClass);
    
    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  try {
    const mobileOptions = getMobileOptimizedCaptureOptions(element);
    const canvas = await createCanvasFromElement(elementId, mobileOptions);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/jpeg', 0.9);
    });
  } finally {
    // Clean up export mode class
    if (isMobile && exportModeClass) {
      element.classList.remove(exportModeClass);
    }
  }
};

export const exportToJPEG = async (elementId: string, filename: string) => {
  const canvas = await createCanvasFromElement(elementId);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.9);
  link.click();
};
