
import { captureImageForSharing, exportToJPEG } from './export/imageCapture';

export const saveImageToDevice = async (imageBlob: Blob, filename: string) => {
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([imageBlob], filename)] })) {
    try {
      await navigator.share({
        files: [new File([imageBlob], filename, { type: 'image/jpeg' })]
      });
      return;
    } catch (error) {
      console.log('Native sharing failed, falling back to download');
    }
  }

  // Fallback to download
  const url = URL.createObjectURL(imageBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareImage = async (imageBlob: Blob, title: string, text: string) => {
  const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  
  if (navigator.share && navigator.canShare) {
    const file = new File([imageBlob], filename, { type: 'image/jpeg' });
    
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title,
          text,
          files: [file]
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.log('Native sharing failed, falling back to save');
          await saveImageToDevice(imageBlob, filename);
        }
      }
    }
  }
  
  // Fallback to save to device
  await saveImageToDevice(imageBlob, filename);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Re-export from imageCapture for backwards compatibility
export { captureImageForSharing, exportToJPEG };
