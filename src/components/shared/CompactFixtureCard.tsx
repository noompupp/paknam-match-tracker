
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamLogo from "../teams/TeamLogo";
import MobileTeamName from "../fixtures/components/MobileTeamName";
import { getScoreStyle } from "@/utils/scoreColorUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/useTranslation";

interface CompactFixtureCardProps {
  fixture: any;
  onClick?: () => void;
  className?: string;
  variant?: 'upcoming' | 'result' | 'live';
  showVenue?: boolean;
}

const CompactFixtureCard = ({ 
  fixture, 
  onClick, 
  className,
  variant = 'upcoming',
  showVenue = false
}: CompactFixtureCardProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isClickable = onClick && (variant === 'result' || fixture.status === 'completed');

  const getStatusBadge = () => {
    if (variant === 'live' || fixture.status === 'live') {
      return <Badge variant="destructive" className="animate-pulse">{t('fixtures.live')}</Badge>;
    }
    if (variant === 'result' || fixture.status === 'completed') {
      return <Badge variant="secondary">{t('fixtures.completed')}</Badge>;
    }
    return <Badge variant="outline">{t('fixtures.scheduled')}</Badge>;
  };

  const formatDateTime = (date: string, time?: string) => {
    try {
      const matchDate = new Date(date);
      const dateStr = matchDate.toLocaleDateString();
      
      if (time && time !== 'TBD') {
        return `${dateStr} • ${time}`;
      }
      return dateStr;
    } catch (error) {
      return date;
    }
  };

  const homeTeamColor = '#2563eb';
  const awayTeamColor = '#16a34a';

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-lg border-border/50",
        isClickable && "cursor-pointer hover:border-primary/30 hover:bg-accent/20",
        className
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with status and date */}
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(fixture.match_date, fixture.match_time)}</span>
            </div>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo team={fixture.home_team} size="small" />
              <MobileTeamName teamName={fixture.home_team?.name || 'Home'} className="flex-1" />
            </div>

            {/* Score or VS */}
            <div className="mx-4 text-center min-w-[60px]">
              {variant === 'result' || fixture.status === 'completed' ? (
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xl font-bold"
                    style={getScoreStyle(homeTeamColor)}
                  >
                    {fixture.home_score || 0}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span 
                    className="text-xl font-bold"
                    style={getScoreStyle(awayTeamColor)}
                  >
                    {fixture.away_score || 0}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground font-medium">{t('common.vs')}</span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <MobileTeamName teamName={fixture.away_team?.name || 'Away'} className="flex-1 text-right" />
              <TeamLogo team={fixture.away_team} size="small" />
            </div>
          </div>

          {/* Venue (if enabled) */}
          {showVenue && fixture.venue && fixture.venue !== 'TBD' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{fixture.venue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactFixtureCard;
