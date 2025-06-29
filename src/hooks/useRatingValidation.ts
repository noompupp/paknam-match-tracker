
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface RatingValidationHook {
  validateRating: (value: number, field: string) => ValidationResult;
  validateApprovalData: (
    fplRating: number,
    participationRating: number,
    playerName: string
  ) => ValidationResult;
  handleValidationError: (errors: string[]) => void;
  validateMinutesThreshold: (minutes: number) => ValidationResult;
  validateFPLPoints: (points: number, minutes: number) => ValidationResult;
}

// Constants for 7-a-side match validation
const MATCH_DURATION = 50; // 7-a-side matches are 50 minutes
const FULL_MATCH_THRESHOLD = 35; // 70% of 50 minutes
const PARTIAL_MATCH_THRESHOLD = 15; // 30% of 50 minutes

export const useRatingValidation = (): RatingValidationHook => {
  const { toast } = useToast();

  const validateRating = useCallback((value: number, field: string): ValidationResult => {
    const errors: string[] = [];

    if (isNaN(value) || value === null || value === undefined) {
      errors.push(`${field} must be a valid number`);
    } else if (value < 0 || value > 10) {
      errors.push(`${field} must be between 0.0 and 10.0`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateMinutesThreshold = useCallback((minutes: number): ValidationResult => {
    const errors: string[] = [];
    
    if (minutes < 0) {
      errors.push("Minutes played cannot be negative");
    } else if (minutes > MATCH_DURATION + 10) { // Allow some buffer for injury time
      errors.push(`Minutes played cannot exceed ${MATCH_DURATION + 10} minutes (7-a-side match with injury time)`);
    }

    // Warn about low playtime (less than 30% of match)
    if (minutes > 0 && minutes < PARTIAL_MATCH_THRESHOLD) {
      errors.push(`Warning: Player has very low playtime (${minutes} mins, less than 30% of ${MATCH_DURATION}-minute match)`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateFPLPoints = useCallback((points: number, minutes: number): ValidationResult => {
    const errors: string[] = [];
    
    // Updated minimum points logic for 7-a-side (70% threshold = 35 minutes)
    const expectedMinPoints = minutes >= FULL_MATCH_THRESHOLD ? 2 : (minutes >= 1 ? 1 : 0);
    
    if (points < expectedMinPoints) {
      errors.push(`FPL points (${points}) seem low for ${minutes} minutes played in a ${MATCH_DURATION}-minute match. Expected at least ${expectedMinPoints} points.`);
    }

    // Maximum reasonable points check (adjusted for 7-a-side format)
    if (points > 20) {
      errors.push(`FPL points (${points}) seem unusually high for a ${MATCH_DURATION}-minute match. Please verify calculation.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateApprovalData = useCallback((
    fplRating: number,
    participationRating: number,
    playerName: string
  ): ValidationResult => {
    const errors: string[] = [];

    if (!playerName || playerName.trim().length === 0) {
      errors.push("Player name is required");
    }

    const fplValidation = validateRating(fplRating, "FPL Rating");
    const participationValidation = validateRating(participationRating, "Participation Rating");

    errors.push(...fplValidation.errors, ...participationValidation.errors);

    // Enhanced business logic validation
    if (fplValidation.isValid && participationValidation.isValid) {
      const finalRating = (fplRating * 0.7 + participationRating * 0.3);
      if (finalRating > 10) {
        errors.push("Calculated final rating exceeds maximum allowed value (10.0)");
      }

      // Check for unrealistic rating combinations
      if (Math.abs(fplRating - participationRating) > 4) {
        errors.push("Large difference between FPL and Participation ratings. Please verify values.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validateRating]);

  const handleValidationError = useCallback((errors: string[]) => {
    if (errors.length > 0) {
      const errorMessage = errors.length === 1 ? errors[0] : `Multiple issues found: ${errors.join(". ")}`;
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    validateRating,
    validateApprovalData,
    handleValidationError,
    validateMinutesThreshold,
    validateFPLPoints
  };
};
