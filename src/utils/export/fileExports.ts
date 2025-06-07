
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const saveImageToDevice = async (imageBlob: Blob, filename: string) => {
  const url = URL.createObjectURL(imageBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.position = 'fixed';
  link.style.top = '-1000px';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareImage = async (imageBlob: Blob, title: string, text: string) => {
  if (navigator.share && navigator.canShare) {
    const shareData = {
      title,
      text,
      files: [new File([imageBlob], 'match-summary.jpg', { type: 'image/jpeg' })]
    };
    
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        console.log('Web Share API failed, falling back to download');
      }
    }
  }
  
  const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  await saveImageToDevice(imageBlob, filename);
};
