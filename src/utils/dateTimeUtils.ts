
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
