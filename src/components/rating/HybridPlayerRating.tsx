
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Trophy, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { PlayerRatingRow, ApprovedRating, HybridRatingData } from "@/hooks/useHybridPlayerRatings";

interface HybridPlayerRatingProps {
  playerRating: PlayerRatingRow;
  approvedRating?: ApprovedRating;
  canApprove: boolean;
  onApprove: () => void;
  isApproving: boolean;
}

const RatingBadge = ({ 
  value, 
  maxValue = 10, 
  label, 
  color = "primary" 
}: { 
  value: number; 
  maxValue?: number; 
  label: string;
  color?: "primary" | "secondary" | "success" | "warning";
}) => {
  const percentage = (value / maxValue) * 100;
  const colorClasses = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground", 
    success: "bg-green-600 text-white",
    warning: "bg-orange-500 text-white"
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <Badge className={`${colorClasses[color]} font-bold text-sm px-3 py-1`}>
        {value.toFixed(2)}/{maxValue}
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

const HybridPlayerRating: React.FC<HybridPlayerRatingProps> = ({
  playerRating,
  approvedRating,
  canApprove,
  onApprove,
  isApproving
}) => {
  const { t } = useTranslation();
  const { player_name, team_name, position, rating_data } = playerRating;
  const isApproved = !!approvedRating;

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
            </div>
          </div>
          
          {canApprove && !isApproved && (
            <Button
              onClick={onApprove}
              disabled={isApproving}
              size="sm"
              className="ml-2"
            >
              {isApproving ? t('rating.approving') : t('rating.approveRating')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating Display */}
        <div className="grid grid-cols-3 gap-4">
          <RatingBadge
            value={rating_data.fpl_rating}
            label={t('rating.fplRating')}
            color="primary"
          />
          <RatingBadge
            value={rating_data.participation_rating}
            label={t('rating.participationRating')}
            color="secondary"
          />
          <RatingBadge
            value={rating_data.final_rating}
            label={t('rating.finalRating')}
            color="success"
          />
        </div>

        {/* Formula Display */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-sm text-center">
            <span className="font-mono">
              {t('rating.finalRating')} = ({rating_data.fpl_rating.toFixed(2)} × 0.7) + ({rating_data.participation_rating.toFixed(2)} × 0.3) = 
              <span className="font-bold text-green-600 ml-1">
                {rating_data.final_rating.toFixed(2)}
              </span>
            </span>
          </div>
        </div>

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

export default HybridPlayerRating;
