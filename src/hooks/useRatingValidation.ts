
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
}

export const useRatingValidation = (): RatingValidationHook => {
  const { toast } = useToast();

  const validateRating = useCallback((value: number, field: string): ValidationResult => {
    const errors: string[] = [];

    if (isNaN(value) || value === null || value === undefined) {
      errors.push(`${field} must be a valid number`);
    } else if (value < 0) {
      errors.push(`${field} cannot be negative`);
    } else if (value > 10) {
      errors.push(`${field} cannot exceed 10.0`);
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

    // Additional business logic validation
    if (fplValidation.isValid && participationValidation.isValid) {
      const finalRating = (fplRating * 0.7 + participationRating * 0.3);
      if (finalRating > 10) {
        errors.push("Calculated final rating exceeds maximum allowed value");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validateRating]);

  const handleValidationError = useCallback((errors: string[]) => {
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(". "),
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    validateRating,
    validateApprovalData,
    handleValidationError
  };
};
