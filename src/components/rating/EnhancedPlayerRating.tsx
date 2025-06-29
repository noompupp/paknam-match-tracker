import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  RotateCcw,
  Clock,
  Target,
  Users,
  Star
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useRatingValidation } from "@/hooks/useRatingValidation";
import MobileRatingCard from "./MobileRatingCard";
import type { PlayerRatingRow, ApprovedRating } from "@/hooks/useHybridPlayerRatings";

interface EnhancedPlayerRatingProps {
  playerRating: PlayerRatingRow;
  approvedRating?: ApprovedRating;
  canApprove: boolean;
  onApprove: (adjustedFplRating?: number, adjustedParticipationRating?: number) => void;
  isApproving: boolean;
}

const EnhancedPlayerRating: React.FC<EnhancedPlayerRatingProps> = ({
  playerRating,
  approvedRating,
  canApprove,
  onApprove,
  isApproving
}) => {
  const { t } = useTranslation();
  const { validateRating, validateMinutesThreshold, validateFPLPoints, handleValidationError } = useRatingValidation();
  const { player_name, team_name, position, rating_data } = playerRating;
  const isApproved = !!approvedRating;
  
  const [fplRating, setFplRating] = useState(rating_data.fpl_rating);
  const [participationRating, setParticipationRating] = useState(rating_data.participation_rating);
  const [finalRating, setFinalRating] = useState(rating_data.final_rating);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  React.useEffect(() => {
    const calculated = (fplRating * 0.7 + participationRating * 0.3);
    setFinalRating(Number(calculated.toFixed(2)));
    
    const hasChanges = 
      fplRating !== rating_data.fpl_rating || 
      participationRating !== rating_data.participation_rating;
    setHasUnsavedChanges(hasChanges);

    // Enhanced validation
    const errors: string[] = [];
    const fplValidation = validateRating(fplRating, "FPL Rating");
    const participationValidation = validateRating(participationRating, "Participation Rating");
    const minutesValidation = validateMinutesThreshold(rating_data.minutes_played);
    const fplPointsValidation = validateFPLPoints(rating_data.fpl_points, rating_data.minutes_played);

    errors.push(...fplValidation.errors, ...participationValidation.errors);
    if (minutesValidation.errors.length > 0) {
      errors.push(...minutesValidation.errors);
    }
    if (fplPointsValidation.errors.length > 0) {
      errors.push(...fplPointsValidation.errors);
    }

    setValidationErrors(errors);
  }, [fplRating, participationRating, rating_data, validateRating, validateMinutesThreshold, validateFPLPoints]);

  const handleResetRatings = () => {
    setFplRating(rating_data.fpl_rating);
    setParticipationRating(rating_data.participation_rating);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  };

  const handleApproveRating = () => {
    if (validationErrors.length > 0) {
      handleValidationError(validationErrors);
      return;
    }

    const adjustedFpl = fplRating !== rating_data.fpl_rating ? fplRating : undefined;
    const adjustedParticipation = participationRating !== rating_data.participation_rating ? participationRating : undefined;
    
    onApprove(adjustedFpl, adjustedParticipation);
  };

  const handleRatingChange = (value: string, setter: (val: number) => void, max: number = 10) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= max) {
      setter(numValue);
    } else if (value === '') {
      setter(0);
    }
  };

  // Mobile view for small screens
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <MobileRatingCard
        playerRating={playerRating}
        approvedRating={approvedRating}
        canApprove={canApprove}
        onApprove={onApprove}
        isApproving={isApproving}
      />
    );
  }

  return (
    <Card className={`mb-4 ${isApproved ? 'border-green-200 bg-green-50/50' : 'border-border'} ${validationErrors.length > 0 ? 'border-orange-300' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <span>{player_name}</span>
              {isApproved && <CheckCircle className="h-5 w-5 text-green-600" />}
              {validationErrors.length > 0 && <AlertCircle className="h-5 w-5 text-orange-500" />}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
              <span>{team_name}</span>
              <span>{position}</span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {rating_data.minutes_played} mins (of 50 min match)
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
            {(approvedRating?.final_rating || rating_data.final_rating).toFixed(2)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-orange-800 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Validation Issues</span>
            </div>
            <div className="text-sm text-orange-700 space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Performance Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Performance Summary (7-a-side League)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{rating_data.fpl_points}</div>
              <div className="text-muted-foreground">FPL Points</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{rating_data.rating_breakdown.goals || 0}</div>
              <div className="text-muted-foreground">Goals</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{rating_data.rating_breakdown.assists || 0}</div>
              <div className="text-muted-foreground">Assists</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg capitalize">{rating_data.match_result}</div>
              <div className="text-muted-foreground">Result</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{rating_data.minutes_played}/50</div>
              <div className="text-muted-foreground">Minutes Played</div>
            </div>
            {rating_data.rating_breakdown.clean_sheet_eligible && (
              <div className="text-center">
                <span className="text-muted-foreground">Clean Sheet: </span>
                <span className={rating_data.rating_breakdown.clean_sheet_achieved 
                  ? "text-green-600 font-medium" 
                  : "text-red-600"
                }>
                  {rating_data.rating_breakdown.clean_sheet_achieved ? "Yes ✓" : "No"}
                </span>
              </div>
            )}
          </div>
        </div>

        {!isApproved && canApprove ? (
          <div className="space-y-4">
            {/* Rating Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* FPL Rating */}
              <div className="space-y-2">
                <Label htmlFor={`fpl-${playerRating.player_id}`} className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  FPL Rating (0-10)
                </Label>
                <Input
                  id={`fpl-${playerRating.player_id}`}
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={fplRating}
                  onChange={(e) => handleRatingChange(e.target.value, setFplRating)}
                  className="text-center font-mono"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Original: {rating_data.fpl_rating.toFixed(2)}
                </div>
              </div>

              {/* Participation Rating */}
              <div className="space-y-2">
                <Label htmlFor={`participation-${playerRating.player_id}`} className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Participation Rating (0-10)
                </Label>
                <Input
                  id={`participation-${playerRating.player_id}`}
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={participationRating}
                  onChange={(e) => handleRatingChange(e.target.value, setParticipationRating)}
                  className="text-center font-mono"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Original: {rating_data.participation_rating.toFixed(2)}
                </div>
              </div>

              {/* Final Rating Display */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Final Rating
                </Label>
                <div className={`${validationErrors.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} border rounded-lg p-3`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${validationErrors.length > 0 ? 'text-orange-700' : 'text-green-700'} mb-1`}>
                      {finalRating.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      ({fplRating.toFixed(2)} × 0.7) + ({participationRating.toFixed(2)} × 0.3)
                    </div>
                    {hasUnsavedChanges && (
                      <div className="flex items-center justify-center space-x-1 mt-2 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Adjusted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between space-x-3">
              <Button
                onClick={handleResetRatings}
                variant="outline"
                disabled={!hasUnsavedChanges}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Original</span>
              </Button>

              <Button
                onClick={handleApproveRating}
                disabled={isApproving || validationErrors.length > 0}
                className="flex items-center space-x-2 flex-1 max-w-xs"
              >
                <Trophy className="h-4 w-4" />
                <span>
                  {isApproving ? 'Confirming Rating...' : 'Confirm Rating'}
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Display Mode for Approved Ratings */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Badge variant="outline" className="text-lg font-bold mb-2 px-3 py-1">
                  {(approvedRating?.fpl_rating || rating_data.fpl_rating).toFixed(2)}
                </Badge>
                <div className="text-sm text-muted-foreground">FPL Rating</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-lg font-bold mb-2 px-3 py-1">
                  {(approvedRating?.participation_rating || rating_data.participation_rating).toFixed(2)}
                </Badge>
                <div className="text-sm text-muted-foreground">Participation Rating</div>
              </div>
              <div className="text-center">
                <Badge variant="default" className="text-lg font-bold mb-2 px-3 py-1 bg-green-600">
                  {(approvedRating?.final_rating || rating_data.final_rating).toFixed(2)}
                </Badge>
                <div className="text-sm text-muted-foreground">Final Rating</div>
              </div>
            </div>

            {/* Adjustment Info */}
            {approvedRating?.was_adjusted && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-orange-800 mb-2">
                  <Edit3 className="h-4 w-4" />
                  <span className="font-medium">Rating was manually adjusted</span>
                </div>
                <div className="text-sm space-y-1">
                  {approvedRating.adjusted_fpl_rating !== null && (
                    <div>
                      <span className="text-muted-foreground">FPL Rating: </span>
                      <span className="line-through">{approvedRating.original_fpl_rating?.toFixed(2)}</span>
                      <span className="ml-2 font-medium text-orange-700">
                        → {approvedRating.adjusted_fpl_rating.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {approvedRating.adjusted_participation_rating !== null && (
                    <div>
                      <span className="text-muted-foreground">Participation Rating: </span>
                      <span className="line-through">{approvedRating.original_participation_rating?.toFixed(2)}</span>
                      <span className="ml-2 font-medium text-orange-700">
                        → {approvedRating.adjusted_participation_rating.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isApproved && approvedRating && (
              <div className="text-sm text-green-600 text-center">
                ✅ Approved on {new Date(approvedRating.approved_at).toLocaleDateString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPlayerRating;
