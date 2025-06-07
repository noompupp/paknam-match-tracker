
import { supabase } from '@/integrations/supabase/client';
import { operationLoggingService } from '@/services/operationLoggingService';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: any;
}

export const inputValidationService = {
  async validatePlayerName(name: string): Promise<ValidationResult> {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'Player name is required and must be a string' };
    }

    // Use the database validation function
    const { data, error } = await supabase.rpc('validate_player_name', {
      player_name: name
    });

    if (error) {
      await operationLoggingService.logOperation({
        operation_type: 'validation_error',
        payload: { input: name, type: 'player_name' },
        error_message: error.message,
        success: false
      });
      return { isValid: false, error: 'Player name validation failed' };
    }

    if (!data) {
      return { isValid: false, error: 'Invalid player name format' };
    }

    return { 
      isValid: true, 
      sanitizedValue: name.trim()
    };
  },

  async validateFixtureScore(homeScore: number, awayScore: number): Promise<ValidationResult> {
    if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
      return { isValid: false, error: 'Scores must be numbers' };
    }

    // Use the database validation function
    const { data, error } = await supabase.rpc('validate_fixture_score', {
      home_score: homeScore,
      away_score: awayScore
    });

    if (error) {
      await operationLoggingService.logOperation({
        operation_type: 'validation_error',
        payload: { homeScore, awayScore, type: 'fixture_score' },
        error_message: error.message,
        success: false
      });
      return { isValid: false, error: 'Score validation failed' };
    }

    if (!data) {
      return { isValid: false, error: 'Invalid score values' };
    }

    return { 
      isValid: true, 
      sanitizedValue: { homeScore, awayScore }
    };
  },

  validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (trimmedEmail.length > 254) {
      return { isValid: false, error: 'Email address too long' };
    }

    return { 
      isValid: true, 
      sanitizedValue: trimmedEmail
    };
  },

  validatePassword(password: string): ValidationResult {
    if (!password || typeof password !== 'string') {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password too long' };
    }

    // Check for basic complexity
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      return { 
        isValid: false, 
        error: 'Password must contain at least one letter and one number' 
      };
    }

    return { isValid: true, sanitizedValue: password };
  },

  sanitizeInput(input: string, maxLength: number = 255): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>'"&]/g, ''); // Basic XSS prevention
  },

  validateInteger(value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): ValidationResult {
    const num = parseInt(value);
    
    if (isNaN(num)) {
      return { isValid: false, error: 'Value must be a valid integer' };
    }

    if (num < min || num > max) {
      return { isValid: false, error: `Value must be between ${min} and ${max}` };
    }

    return { isValid: true, sanitizedValue: num };
  }
};
