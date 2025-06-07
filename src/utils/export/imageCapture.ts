
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

export const exportToJPEG = async (elementId: string, filename: string) => {
  const canvas = await createCanvasFromElement(elementId);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.9);
  link.click();
};
