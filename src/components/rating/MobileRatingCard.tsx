
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock, 
  Trophy, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { PlayerRatingRow, ApprovedRating } from "@/hooks/useHybridPlayerRatings";

interface MobileRatingCardProps {
  playerRating: PlayerRatingRow;
  approvedRating?: ApprovedRating;
  canApprove: boolean;
  onApprove: (adjustedFplRating?: number, adjustedParticipationRating?: number) => void;
  isApproving: boolean;
}

const MobileRatingCard: React.FC<MobileRatingCardProps> = ({
  playerRating,
  approvedRating,
  canApprove,
  onApprove,
  isApproving
}) => {
  const { t } = useTranslation();
  const { player_name, team_name, position, rating_data } = playerRating;
  const isApproved = !!approvedRating;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [fplRating, setFplRating] = useState(rating_data.fpl_rating);
  const [participationRating, setParticipationRating] = useState(rating_data.participation_rating);
  const [finalRating, setFinalRating] = useState(rating_data.final_rating);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  React.useEffect(() => {
    const calculated = (fplRating * 0.7 + participationRating * 0.3);
    setFinalRating(Number(calculated.toFixed(2)));
    
    const hasChanges = 
      fplRating !== rating_data.fpl_rating || 
      participationRating !== rating_data.participation_rating;
    setHasUnsavedChanges(hasChanges);
  }, [fplRating, participationRating, rating_data.fpl_rating, rating_data.participation_rating]);

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
    <Card className={`mb-3 ${isApproved ? 'border-green-200 bg-green-50/50' : 'border-border'}`}>
      <CardHeader 
        className="pb-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {player_name}
            </CardTitle>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <span className="truncate">{team_name}</span>
              <span>•</span>
              <span>{position}</span>
              {isApproved && (
                <>
                  <span>•</span>
                  <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant="secondary" className="text-xs font-bold">
              {(approvedRating?.final_rating || rating_data.final_rating).toFixed(2)}
            </Badge>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {!isApproved && canApprove ? (
            <>
              {/* Mobile-optimized rating inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`fpl-${playerRating.player_id}`} className="text-xs font-medium">
                      FPL (0-10)
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
                      className="text-center font-mono text-sm h-8"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      Orig: {rating_data.fpl_rating.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`participation-${playerRating.player_id}`} className="text-xs font-medium">
                      Part. (0-10)
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
                      className="text-center font-mono text-sm h-8"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      Orig: {rating_data.participation_rating.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Final rating display */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-700 mb-1">
                      {finalRating.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600 font-medium mb-1">
                      Final Rating
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      ({fplRating.toFixed(2)} × 0.7) + ({participationRating.toFixed(2)} × 0.3)
                    </div>
                    {hasUnsavedChanges && (
                      <div className="flex items-center justify-center space-x-1 mt-2 text-orange-600">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs font-medium">Adjusted</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile action buttons */}
                <div className="flex items-center justify-between space-x-2">
                  <Button
                    onClick={handleResetRatings}
                    variant="outline"
                    size="sm"
                    disabled={!hasUnsavedChanges}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </Button>

                  <Button
                    onClick={handleApproveRating}
                    disabled={isApproving}
                    size="sm"
                    className="flex items-center space-x-1 text-xs flex-1"
                  >
                    <Trophy className="h-3 w-3" />
                    <span>
                      {isApproving ? 'Confirming...' : 'Confirm'}
                    </span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Display mode for approved ratings */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <Badge variant="outline" className="text-xs font-bold mb-1">
                    {(approvedRating?.fpl_rating || rating_data.fpl_rating).toFixed(2)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">FPL</div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-xs font-bold mb-1">
                    {(approvedRating?.participation_rating || rating_data.participation_rating).toFixed(2)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">Part.</div>
                </div>
                <div className="text-center">
                  <Badge variant="default" className="text-xs font-bold mb-1 bg-green-600">
                    {(approvedRating?.final_rating || rating_data.final_rating).toFixed(2)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">Final</div>
                </div>
              </div>

              {/* Adjustment info */}
              {approvedRating?.was_adjusted && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="flex items-center space-x-1 text-xs text-orange-800 mb-1">
                    <Edit3 className="h-3 w-3" />
                    <span className="font-medium">Rating adjusted</span>
                  </div>
                  <div className="text-xs space-y-1">
                    {approvedRating.adjusted_fpl_rating !== null && (
                      <div>
                        <span className="text-muted-foreground">FPL: </span>
                        <span className="line-through">{approvedRating.original_fpl_rating?.toFixed(2)}</span>
                        <span className="ml-1 font-medium text-orange-700">
                          → {approvedRating.adjusted_fpl_rating.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {approvedRating.adjusted_participation_rating !== null && (
                      <div>
                        <span className="text-muted-foreground">Part.: </span>
                        <span className="line-through">{approvedRating.original_participation_rating?.toFixed(2)}</span>
                        <span className="ml-1 font-medium text-orange-700">
                          → {approvedRating.adjusted_participation_rating.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Compact performance breakdown */}
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minutes:</span>
                <span className="font-medium">{rating_data.minutes_played}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FPL Pts:</span>
                <span className="font-medium">{rating_data.fpl_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Result:</span>
                <Badge 
                  variant={
                    rating_data.match_result === 'win' ? 'default' : 
                    rating_data.match_result === 'draw' ? 'secondary' : 
                    'destructive'
                  }
                  className="text-xs"
                >
                  {rating_data.match_result.toUpperCase()}
                </Badge>
              </div>
              {rating_data.rating_breakdown.clean_sheet_eligible && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clean:</span>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
              )}
            </div>
          </div>

          {isApproved && approvedRating && (
            <div className="text-xs text-green-600 text-center">
              Approved {new Date(approvedRating.approved_at).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default MobileRatingCard;
