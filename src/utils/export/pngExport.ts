import html2canvas from 'html2canvas';

export interface PNGExportOptions {
  backgroundColor?: string | null;
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

export const exportToPNG = async (elementId: string, filename: string, options: PNGExportOptions = {}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PNG export');
  }

  const defaultOptions: PNGExportOptions = {
    backgroundColor: null, // Transparent background
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    ...options
  };

  const canvas = await html2canvas(element, defaultOptions);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
};

export const createPNGFromElement = async (elementId: string, options: PNGExportOptions = {}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PNG creation');
  }

  const defaultOptions: PNGExportOptions = {
    backgroundColor: null, // Transparent background
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    ...options
  };

  return await html2canvas(element, defaultOptions);
};