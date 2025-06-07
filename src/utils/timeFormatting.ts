
/**
 * Enhanced time formatting utilities for match summaries
 */

export const formatTimeForSummary = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  // Round up to the nearest minute for goal times (any time over the minute rounds up)
  const roundedMins = remainingSeconds > 0 ? mins + 1 : mins;
  
  return `${roundedMins}'`;
};

export const formatTimeCompact = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  // Round up for any fractional time
  const roundedMins = remainingSeconds > 0 ? mins + 1 : mins;
  
  return `${roundedMins}'`;
};
