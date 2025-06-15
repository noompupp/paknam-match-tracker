/**
 * Utility functions for consistent time formatting across the application
 * Updated for 7-a-side football format (50 minutes total, 2 x 25-minute halves)
 */

export const formatMatchTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Rounds seconds up to the next full minute (e.g. 72 → 2).
 * If seconds is 0, returns 0.
 */
export const roundSecondsUpToMinute = (seconds: number): number => {
  if (seconds <= 0) return 0;
  return Math.ceil(seconds / 60);
};

// Formats for the dashboard, always using rounded-up minutes
export const formatTimeForDashboard = (seconds: number): string => {
  const mins = roundSecondsUpToMinute(seconds);
  return `${mins}'`;
};

export const formatTimeDisplay = (timeString: string): string => {
  if (!timeString || timeString === 'TBD') return 'TBD';
  
  try {
    // Handle time format - could be HH:MM:SS or HH:MM
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);
      
      // Create a date object for formatting
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  } catch (error) {
    console.warn('Error formatting time display:', timeString, error);
  }
  
  return timeString || 'TBD';
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

/**
 * Standardized event time formatting:
 * - If isSeconds, rounds UP to the next full minute and shows minutes+apostrophe.
 * - If already in minutes, just shows the integer value with apostrophe.
 */
export const formatEventTime = (timeValue: number, isSeconds: boolean = false): string => {
  if (isSeconds) {
    const mins = roundSecondsUpToMinute(timeValue);
    return `${mins}'`;
  } else {
    return `${Math.floor(timeValue)}'`;
  }
};

// 7-a-side specific constants
export const SEVEN_A_SIDE_CONSTANTS = {
  STANDARD_MATCH_DURATION: 50 * 60, // 50 minutes total
  HALF_DURATION: 25 * 60, // 25 minutes per half
  MAX_OVERTIME: 5 * 60, // 5 minutes maximum overtime
  ROLE_LIMITS: {
    CAPTAIN: { maxPerHalf: null, minTotal: 0 }, // No limits
    S_CLASS: { maxPerHalf: 20 * 60, minTotal: 0 }, // Max 20 minutes per half
    STARTER: { maxPerHalf: null, minTotal: 10 * 60 } // Min 10 minutes total
  }
};

// Calculate overtime based on 7-a-side match duration
export const calculateOvertime = (matchSeconds: number): number => {
  return Math.max(0, matchSeconds - SEVEN_A_SIDE_CONSTANTS.STANDARD_MATCH_DURATION);
};

// Check if match is in second half
export const isSecondHalf = (matchSeconds: number): boolean => {
  return matchSeconds > SEVEN_A_SIDE_CONSTANTS.HALF_DURATION;
};

// Get current half time
export const getCurrentHalfTime = (matchSeconds: number): number => {
  if (isSecondHalf(matchSeconds)) {
    return matchSeconds - SEVEN_A_SIDE_CONSTANTS.HALF_DURATION;
  }
  return matchSeconds;
};

// Get role-based time constraints
export const getRoleTimeConstraints = (role: 'Captain' | 'S-class' | 'Starter') => {
  const roleKey = role.toUpperCase().replace('-', '_') as keyof typeof SEVEN_A_SIDE_CONSTANTS.ROLE_LIMITS;
  return SEVEN_A_SIDE_CONSTANTS.ROLE_LIMITS[roleKey] || SEVEN_A_SIDE_CONSTANTS.ROLE_LIMITS.STARTER;
};

// Validate playtime against role constraints
export const validatePlaytime = (
  totalTime: number, 
  firstHalfTime: number, 
  secondHalfTime: number, 
  role: 'Captain' | 'S-class' | 'Starter'
): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
} => {
  const constraints = getRoleTimeConstraints(role);
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check per-half limits for S-class players
  if (role === 'S-class' && constraints.maxPerHalf) {
    if (firstHalfTime > constraints.maxPerHalf) {
      violations.push(`Exceeded ${constraints.maxPerHalf / 60} minute limit in first half`);
    }
    if (secondHalfTime > constraints.maxPerHalf) {
      violations.push(`Exceeded ${constraints.maxPerHalf / 60} minute limit in second half`);
    }
    
    // Warnings at 80% of limit
    const warningThreshold = constraints.maxPerHalf * 0.8;
    if (firstHalfTime > warningThreshold && firstHalfTime <= constraints.maxPerHalf) {
      warnings.push(`Approaching first half limit (${Math.floor(firstHalfTime / 60)}/${constraints.maxPerHalf / 60} minutes)`);
    }
    if (secondHalfTime > warningThreshold && secondHalfTime <= constraints.maxPerHalf) {
      warnings.push(`Approaching second half limit (${Math.floor(secondHalfTime / 60)}/${constraints.maxPerHalf / 60} minutes)`);
    }
  }

  // Check minimum total time for Starter players
  if (role === 'Starter' && constraints.minTotal) {
    if (totalTime < constraints.minTotal) {
      violations.push(`Must play at least ${constraints.minTotal / 60} minutes total`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings
  };
};
