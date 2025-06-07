
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
  logging?: boolean;
  removeContainer?: boolean;
  foreignObjectRendering?: boolean;
}

// Wait for all images and assets to load
const waitForAssetsToLoad = async (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll('img');
  const svgs = element.querySelectorAll('svg');
  
  const imagePromises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 2000); // 2s timeout
      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      img.onerror = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  });

  const svgPromises = Array.from(svgs).map(svg => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 100); // Small delay for SVGs
    });
  });

  await Promise.all([...imagePromises, ...svgPromises]);
};

// Wait for layout stabilization
const waitForLayoutStabilization = async (): Promise<void> => {
  return new Promise(resolve => {
    let frameCount = 0;
    const checkLayout = () => {
      frameCount++;
      if (frameCount >= 3) { // Wait for 3 animation frames
        resolve();
      } else {
        requestAnimationFrame(checkLayout);
      }
    };
    requestAnimationFrame(checkLayout);
  });
};

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
    logging: false,
    removeContainer: false,
    foreignObjectRendering: false,
    ...options
  };

  // Wait for assets and layout to stabilize
  await waitForAssetsToLoad(element);
  await waitForLayoutStabilization();

  return await html2canvas(element, defaultOptions);
};

export const getIPhoneStoryOptimizedOptions = (): CaptureOptions => {
  return {
    scale: 3, // Higher quality for mobile
    width: 375,
    height: 812,
    x: 0,
    y: 0,
    windowWidth: 375,
    windowHeight: 812,
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: true,
    logging: true,
    removeContainer: false,
    foreignObjectRendering: true
  };
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
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    };
  }

  return getIPhoneStoryOptimizedOptions();
};

// Enhanced capture with fallback methods
export const captureImageForSharing = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for capture');
  }

  const isMobile = window.innerWidth < 768;
  let exportModeClass = '';
  
  try {
    if (isMobile) {
      exportModeClass = 'export-mode-mobile';
      element.classList.add(exportModeClass);
      
      // Enhanced wait time for mobile layout to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Additional wait for any animations to complete
      await waitForLayoutStabilization();
      
      // Ensure all images are loaded
      await waitForAssetsToLoad(element);
      
      // Final settling time
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const captureOptions = isMobile 
      ? getIPhoneStoryOptimizedOptions()
      : getMobileOptimizedCaptureOptions(element);
      
    console.log('📸 Capturing with options:', captureOptions);
    
    let canvas;
    try {
      // Primary capture method
      canvas = await createCanvasFromElement(elementId, captureOptions);
    } catch (primaryError) {
      console.warn('Primary capture failed, trying fallback:', primaryError);
      
      // Fallback with simplified options
      const fallbackOptions = {
        ...captureOptions,
        scale: 2,
        foreignObjectRendering: false,
        logging: false
      };
      
      canvas = await createCanvasFromElement(elementId, fallbackOptions);
    }

    // Validate canvas content
    const context = canvas.getContext('2d');
    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData?.data.some((value, index) => 
      index % 4 !== 3 && value !== 255 // Check for non-white pixels (excluding alpha)
    );

    if (!hasContent) {
      console.warn('Canvas appears empty, retrying capture...');
      await new Promise(resolve => setTimeout(resolve, 300));
      canvas = await createCanvasFromElement(elementId, captureOptions);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob && blob.size > 1000) { // Ensure blob has reasonable size
          resolve(blob);
        } else {
          reject(new Error('Generated image is too small or invalid'));
        }
      }, 'image/jpeg', 0.92);
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
