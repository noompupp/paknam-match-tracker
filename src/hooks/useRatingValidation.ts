
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
    } else if (minutes > 60) {
      errors.push("Minutes played cannot exceed 60 minutes (7-a-side match duration)");
    }

    // Warn about low playtime (less than 15 minutes = 30% of match)
    if (minutes > 0 && minutes < 15) {
      errors.push("Warning: Player has very low playtime (less than 30% of match)");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateFPLPoints = useCallback((points: number, minutes: number): ValidationResult => {
    const errors: string[] = [];
    
    // Minimum points logic for 7-a-side (adjusted thresholds)
    const expectedMinPoints = minutes >= 35 ? 2 : (minutes >= 1 ? 1 : 0);
    
    if (points < expectedMinPoints) {
      errors.push(`FPL points (${points}) seem low for ${minutes} minutes played. Expected at least ${expectedMinPoints} points.`);
    }

    // Maximum reasonable points check (high-performing player shouldn't exceed ~15 points)
    if (points > 15) {
      errors.push(`FPL points (${points}) seem unusually high. Please verify calculation.`);
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
