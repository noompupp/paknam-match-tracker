
import { PlayerConstraints } from "./types";

export const getRoleConstraints = (role: string): PlayerConstraints => {
  const normalizedRole = role?.toLowerCase() || 'starter';
  
  console.log('🎯 Role constraints for:', { role, normalizedRole });
  
  switch (normalizedRole) {
    case 'captain':
      return { 
        maxPerHalf: null, 
        minTotal: 0, 
        warningPerHalf: null 
      };
    case 's-class':
      return { 
        maxPerHalf: 20 * 60, // 20 minutes per half
        minTotal: 0, 
        warningPerHalf: 16 * 60 // Warning at 16 minutes (80% of limit)
      };
    case 'starter':
      return { 
        maxPerHalf: null, 
        minTotal: 10 * 60, // Minimum 10 minutes total
        warningPerHalf: null 
      };
    default:
      console.warn('⚠️ Unknown role, defaulting to Starter constraints:', role);
      return { 
        maxPerHalf: null, 
        minTotal: 10 * 60, // Default to Starter constraints
        warningPerHalf: null 
      };
  }
};
