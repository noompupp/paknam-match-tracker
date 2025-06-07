// Re-export all export utilities from their specialized modules
export {
  createCanvasFromElement,
  getMobileOptimizedCaptureOptions,
  captureImageForSharing,
  exportToJPEG,
  type CaptureOptions
} from './export/imageCapture';

export {
  exportToCSV,
  saveImageToDevice,
  shareImage
} from './export/fileExports';

export {
  generateEnhancedMatchSummary
} from './export/matchSummaryGenerator';

// Keep the high-level convenience functions for backward compatibility
import { captureImageForSharing } from './export/imageCapture';
import { saveImageToDevice, shareImage } from './export/fileExports';

export const saveImageToDeviceFromElement = async (elementId: string, filename: string) => {
  const imageBlob = await captureImageForSharing(elementId);
  await saveImageToDevice(imageBlob, filename);
};

export const shareImageFromElement = async (elementId: string, title: string, text: string) => {
  const imageBlob = await captureImageForSharing(elementId);
  await shareImage(imageBlob, title, text);
};
