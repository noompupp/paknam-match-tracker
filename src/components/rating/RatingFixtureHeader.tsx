
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Fixture {
  id: number;
  home_team_id: string;
  away_team_id: string;
  home_score?: number;
  away_score?: number;
  match_date: string;
  time?: string;
  venue?: string;
  status: string;
}

interface RatingFixtureHeaderProps {
  fixture: Fixture;
  className?: string;
}

const RatingFixtureHeader: React.FC<RatingFixtureHeaderProps> = ({ 
  fixture, 
  className = "" 
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">{t('fixtures.completed')}</Badge>;
      case 'live':
        return <Badge variant="destructive">{t('fixtures.live')}</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">{t('fixtures.scheduled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatMatchDate = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    const dateString = date.toLocaleDateString();
    
    if (timeStr) {
      return `${dateString} ${timeStr}`;
    }
    return dateString;
  };

  const hasScore = fixture.home_score !== null && fixture.away_score !== null;

  return (
    <Card className={`mb-4 ${className}`}>
      <CardContent className="py-4">
        <div className="space-y-3">
          {/* Match Title */}
          <div className="text-center">
            <h3 className="text-lg font-bold">
              {fixture.home_team_id} vs {fixture.away_team_id}
            </h3>
            {hasScore && (
              <div className="text-2xl font-bold text-primary mt-1">
                {fixture.home_score} - {fixture.away_score}
              </div>
            )}
          </div>

          {/* Match Details */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatMatchDate(fixture.match_date, fixture.time)}</span>
            </div>

            {fixture.venue && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{fixture.venue}</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              {getStatusBadge(fixture.status)}
            </div>
          </div>

          {fixture.status === 'completed' && (
            <div className="text-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {t('rating.ratingAvailable')}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingFixtureHeader;
