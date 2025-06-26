
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Trophy, CheckCircle, AlertCircle, Edit3, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { PlayerRatingRow, ApprovedRating, HybridRatingData } from "@/hooks/useHybridPlayerRatings";

interface EnhancedPlayerRatingProps {
  playerRating: PlayerRatingRow;
  approvedRating?: ApprovedRating;
  canApprove: boolean;
  onApprove: (adjustedFplRating?: number, adjustedParticipationRating?: number) => void;
  isApproving: boolean;
}

const RatingBadge = ({ 
  value, 
  maxValue = 10, 
  label, 
  color = "primary",
  isAdjusted = false
}: { 
  value: number; 
  maxValue?: number; 
  label: string;
  color?: "primary" | "secondary" | "success" | "warning";
  isAdjusted?: boolean;
}) => {
  const colorClasses = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground", 
    success: "bg-green-600 text-white",
    warning: "bg-orange-500 text-white"
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <Badge className={`${colorClasses[color]} font-bold text-sm px-3 py-1 ${isAdjusted ? 'ring-2 ring-orange-400' : ''}`}>
        {value.toFixed(2)}/{maxValue}
        {isAdjusted && <Edit3 className="inline h-3 w-3 ml-1" />}
      </Badge>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

const RatingBreakdown = ({ ratingData }: { ratingData: HybridRatingData }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('rating.minutesPlayed')}:</span>
        <span className="font-medium">{ratingData.minutes_played} min</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('rating.matchResult')}:</span>
        <Badge variant={
          ratingData.match_result === 'win' ? 'default' : 
          ratingData.match_result === 'draw' ? 'secondary' : 
          'destructive'
        }>
          {ratingData.match_result.toUpperCase()}
        </Badge>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('rating.fplPoints')}:</span>
        <span className="font-medium">{ratingData.fpl_points}</span>
      </div>
      {ratingData.rating_breakdown.clean_sheet_eligible && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('rating.cleanSheet')}:</span>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
      )}
    </div>
  );
};

const EnhancedPlayerRating: React.FC<EnhancedPlayerRatingProps> = ({
  playerRating,
  approvedRating,
  canApprove,
  onApprove,
  isApproving
}) => {
  const { t } = useTranslation();
  const { player_name, team_name, position, rating_data } = playerRating;
  const isApproved = !!approvedRating;
  
  // State for editable ratings
  const [fplRating, setFplRating] = useState(rating_data.fpl_rating);
  const [participationRating, setParticipationRating] = useState(rating_data.participation_rating);
  const [finalRating, setFinalRating] = useState(rating_data.final_rating);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Recalculate final rating when component ratings change
  useEffect(() => {
    const calculated = (fplRating * 0.7 + participationRating * 0.3);
    setFinalRating(Number(calculated.toFixed(2)));
    
    // Check if values have changed from original
    const hasChanges = 
      fplRating !== rating_data.fpl_rating || 
      participationRating !== rating_data.participation_rating;
    setHasUnsavedChanges(hasChanges);
  }, [fpl Rating, participationRating, rating_data.fpl_rating, rating_data.participation_rating]);

  const handleResetRatings = () => {
    setFplRating(rating_data.fpl_rating);
    setParticipationRating(rating_data.participation_rating);
    setHasUnsavedChanges(false);
  };

  const handleApproveRating = () => {
    const adjustedFpl = fplRating !== rating_data.fpl_rating ? fplRating : undefined;
    const adjustedParticipation = participationRating !== rating_data.participation_rating ? participationRating : undefined;
    
    onApprove(adjustedFpl, adjustedParticipation);
  };

  const validateRating = (value: number): boolean => {
    return value >= 0 && value <= 10;
  };

  return (
    <Card className={`mb-4 ${isApproved ? 'border-green-200 bg-green-50/50' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {player_name}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{team_name}</span>
              <span>•</span>
              <span>{position}</span>
              {isApproved && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{t('rating.approved')}</span>
                  </div>
                </>
              )}
              {approvedRating?.was_adjusted && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Edit3 className="h-4 w-4" />
                    <span className="font-medium">Adjusted</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isApproved && canApprove ? (
          <>
            {/* Editable Rating Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`fpl-${playerRating.player_id}`} className="text-sm font-medium">
                  {t('rating.fplRating')} (0-10)
                </Label>
                <Input
                  id={`fpl-${playerRating.player_id}`}
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={fplRating}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (validateRating(value) || e.target.value === '') {
                      setFplRating(value || 0);
                    }
                  }}
                  className="text-center font-mono"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Original: {rating_data.fpl_rating.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`participation-${playerRating.player_id}`} className="text-sm font-medium">
                  {t('rating.participationRating')} (0-10)
                </Label>
                <Input
                  id={`participation-${playerRating.player_id}`}
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={participationRating}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (validateRating(value) || e.target.value === '') {
                      setParticipationRating(value || 0);
                    }
                  }}
                  className="text-center font-mono"
                />
                <div className="text-xs text-muted-foreground text-center">
                  Original: {rating_data.participation_rating.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Real-time Final Rating Calculation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-2">
                  {finalRating.toFixed(2)}
                </div>
                <div className="text-sm text-green-600 font-medium mb-2">
                  {t('rating.finalRating')}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  ({fplRating.toFixed(2)} × 0.7) + ({participationRating.toFixed(2)} × 0.3) = {finalRating.toFixed(2)}
                </div>
                {hasUnsavedChanges && (
                  <div className="flex items-center justify-center space-x-1 mt-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Ratings have been adjusted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handleResetRatings}
                variant="outline"
                size="sm"
                disabled={!hasUnsavedChanges}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Original</span>
              </Button>

              <Button
                onClick={handleApproveRating}
                disabled={isApproving}
                className="flex items-center space-x-1"
              >
                <Trophy className="h-4 w-4" />
                <span>
                  {isApproving ? 'Confirming...' : 'Confirm Final Rating'}
                </span>
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Display Mode - Show approved or calculated ratings */}
            <div className="grid grid-cols-3 gap-4">
              <RatingBadge
                value={approvedRating?.fpl_rating || rating_data.fpl_rating}
                label={t('rating.fplRating')}
                color="primary"
                isAdjusted={approvedRating?.was_adjusted && approvedRating.adjusted_fpl_rating !== null}
              />
              <RatingBadge
                value={approvedRating?.participation_rating || rating_data.participation_rating}
                label={t('rating.participationRating')}
                color="secondary"
                isAdjusted={approvedRating?.was_adjusted && approvedRating.adjusted_participation_rating !== null}
              />
              <RatingBadge
                value={approvedRating?.final_rating || rating_data.final_rating}
                label={t('rating.finalRating')}
                color="success"
                isAdjusted={approvedRating?.was_adjusted}
              />
            </div>

            {/* Show adjustment info if available */}
            {approvedRating?.was_adjusted && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-orange-800 mb-2">
                  <Edit3 className="h-4 w-4" />
                  <span className="font-medium">Rating was adjusted by rater</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {approvedRating.adjusted_fpl_rating !== null && (
                    <div>
                      <span className="text-muted-foreground">FPL: </span>
                      <span className="line-through">{approvedRating.original_fpl_rating?.toFixed(2)}</span>
                      <span className="ml-2 font-medium text-orange-700">
                        → {approvedRating.adjusted_fpl_rating.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {approvedRating.adjusted_participation_rating !== null && (
                    <div>
                      <span className="text-muted-foreground">Participation: </span>
                      <span className="line-through">{approvedRating.original_participation_rating?.toFixed(2)}</span>
                      <span className="ml-2 font-medium text-orange-700">
                        → {approvedRating.adjusted_participation_rating.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formula Display */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-sm text-center">
                <span className="font-mono">
                  {t('rating.finalRating')} = ({(approvedRating?.fpl_rating || rating_data.fpl_rating).toFixed(2)} × 0.7) + ({(approvedRating?.participation_rating || rating_data.participation_rating).toFixed(2)} × 0.3) = 
                  <span className="font-bold text-green-600 ml-1">
                    {(approvedRating?.final_rating || rating_data.final_rating).toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          </>
        )}

        {/* Rating Breakdown */}
        <RatingBreakdown ratingData={rating_data} />

        {isApproved && approvedRating && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <Trophy className="h-4 w-4" />
              <span>
                {t('rating.approvedOn')} {new Date(approvedRating.approved_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPlayerRating;
