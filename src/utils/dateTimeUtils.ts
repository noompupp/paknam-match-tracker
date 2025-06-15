import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";

/**
 * Formats date and time into a single line for mobile display
 * Format: "Thu, Jul 10 • 6:00 PM"
 */
export const formatCombinedDateTime = (dateString: string, timeString: string): string => {
  try {
    const formattedDate = formatDateDisplay(dateString);
    const formattedTime = formatTimeDisplay(timeString);
    
    if (!formattedDate || formattedDate === 'TBD' || !formattedTime || formattedTime === 'TBD') {
      return 'TBD';
    }
    
    return `${formattedDate} • ${formattedTime}`;
  } catch (error) {
    console.warn('Error formatting combined date time:', error);
    return 'TBD';
  }
};

/**
 * Formats just the date for mobile display
 */
export const formatMobileDateDisplay = (dateString: string): string => {
  try {
    return formatDateDisplay(dateString);
  } catch (error) {
    console.warn('Error formatting mobile date display:', error);
    return 'TBD';
  }
};

/**
 * Formats only the time as minutes (rounded up for football norm)
 */
export const formatMinuteOnly = (seconds: number): string => {
  // Import here instead of top for tree shaking where possible
  const { roundSecondsUpToMinute } = require("./timeUtils");
  return `${roundSecondsUpToMinute(seconds)}'`;
};
