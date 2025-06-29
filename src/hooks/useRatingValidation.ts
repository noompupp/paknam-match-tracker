
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface RatingValidationHook {
  validateRating: (value: number, field: string) => ValidationResult;
  validateApprovalData: (
    fplRating: number,
    participationRating: number,
    playerName: string
  ) => ValidationResult;
  handleValidationError: (errors: string[]) => void;
  handleValidationWarning: (warnings: string[]) => void;
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
    const warnings: string[] = [];

    if (isNaN(value) || value === null || value === undefined) {
      errors.push(`${field} must be a valid number`);
    } else if (value < 0 || value > 10) {
      errors.push(`${field} must be between 0.0 and 10.0`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const validateMinutesThreshold = useCallback((minutes: number): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (minutes < 0) {
      errors.push("Minutes played cannot be negative");
    } else if (minutes > MATCH_DURATION + 10) { // Allow some buffer for injury time
      errors.push(`Minutes played cannot exceed ${MATCH_DURATION + 10} minutes (7-a-side match with injury time)`);
    }

    // Convert low playtime to warning instead of error
    if (minutes > 0 && minutes < PARTIAL_MATCH_THRESHOLD) {
      warnings.push(`Player has low playtime (${minutes} mins, less than 30% of ${MATCH_DURATION}-minute match)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const validateFPLPoints = useCallback((points: number, minutes: number): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Updated minimum points logic for 7-a-side (70% threshold = 35 minutes)
    const expectedMinPoints = minutes >= FULL_MATCH_THRESHOLD ? 2 : (minutes >= 1 ? 1 : 0);
    
    // Convert low FPL points to warning instead of error
    if (points < expectedMinPoints) {
      warnings.push(`FPL points (${points}) seem low for ${minutes} minutes played in a ${MATCH_DURATION}-minute match. Expected at least ${expectedMinPoints} points.`);
    }

    // Convert high points to warning instead of error
    if (points > 20) {
      warnings.push(`FPL points (${points}) seem unusually high for a ${MATCH_DURATION}-minute match. Please verify calculation.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const validateApprovalData = useCallback((
    fplRating: number,
    participationRating: number,
    playerName: string
  ): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!playerName || playerName.trim().length === 0) {
      errors.push("Player name is required");
    }

    const fplValidation = validateRating(fplRating, "FPL Rating");
    const participationValidation = validateRating(participationRating, "Participation Rating");

    errors.push(...fplValidation.errors, ...participationValidation.errors);
    warnings.push(...fplValidation.warnings, ...participationValidation.warnings);

    // Enhanced business logic validation
    if (fplValidation.isValid && participationValidation.isValid) {
      const finalRating = (fplRating * 0.7 + participationRating * 0.3);
      if (finalRating > 10) {
        errors.push("Calculated final rating exceeds maximum allowed value (10.0)");
      }

      // Convert large rating difference to warning instead of error
      if (Math.abs(fplRating - participationRating) > 4) {
        warnings.push("Large difference between FPL and Participation ratings. Please verify values.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
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

  const handleValidationWarning = useCallback((warnings: string[]) => {
    if (warnings.length > 0) {
      const warningMessage = warnings.length === 1 ? warnings[0] : `Multiple warnings: ${warnings.join(". ")}`;
      toast({
        title: "Validation Warning",
        description: warningMessage,
        variant: "default",
      });
    }
  }, [toast]);

  return {
    validateRating,
    validateApprovalData,
    handleValidationError,
    handleValidationWarning,
    validateMinutesThreshold,
    validateFPLPoints
  };
};
