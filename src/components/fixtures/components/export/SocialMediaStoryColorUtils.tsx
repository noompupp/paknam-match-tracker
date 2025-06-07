
// Utility functions for handling team colors in social media stories
export const getDisplayColor = (color: string, teamName: string) => {
  if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white' || color === '#fff') {
    return '#1e293b'; // slate-800
  }
  return color;
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}'`;
};
