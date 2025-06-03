
/**
 * Utility functions for consistent time formatting across the application
 */

export const formatMatchTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeForDashboard = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins}'`;
};

export const formatTimeDisplay = (timeString: string): string => {
  if (!timeString) return 'TBD';
  const time = new Date(`2000-01-01T${timeString}`);
  return time.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Convert seconds to minutes for display
export const secondsToMinutes = (seconds: number): number => {
  return Math.floor(seconds / 60);
};

// Calculate overtime based on match duration
export const calculateOvertime = (matchSeconds: number, standardDuration: number = 90 * 60): number => {
  return Math.max(0, matchSeconds - standardDuration);
};
