
/**
 * Enhanced time formatting utilities for match summaries
 */

export const formatTimeForSummary = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  // For exact minutes, show as "45'"
  if (remainingSeconds === 0) {
    return `${mins}'`;
  }
  
  // For times with seconds, show as "45+2'" (overtime format)
  return `${mins}+${remainingSeconds}'`;
};

export const formatTimeCompact = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins}'`;
};
