
import { Card, CardContent } from "@/components/ui/card";
import { getScoreStyle } from "@/utils/scoreColorUtils";

interface MatchStatisticsSummaryProps {
  fixture: any;
  homeGoalsCount: number;
  awayGoalsCount: number;
  cardsCount: number;
  timelineEventsCount: number;
  homeTeamColor: string;
  awayTeamColor: string;
}

const MatchStatisticsSummary = ({
  fixture,
  homeGoalsCount,
  awayGoalsCount,
  cardsCount,
  timelineEventsCount,
  homeTeamColor,
  awayTeamColor
}: MatchStatisticsSummaryProps) => {
  return (
    <Card className="premier-card-shadow match-border-gradient">
      <CardContent className="pt-6 match-gradient-stats">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-lg stat-block-home-gradient premier-card-shadow">
            <div 
              className="text-2xl font-bold mb-1 score-text-outline"
              style={getScoreStyle(homeTeamColor)}
            >
              {homeGoalsCount}
            </div>
            <div className="text-sm text-muted-foreground mb-2 font-medium">Goals</div>
            <div className="text-xs text-muted-foreground truncate font-medium">
              {fixture.home_team?.name || 'Home'}
            </div>
          </div>
          
          <div className="p-4 rounded-lg stat-block-neutral-gradient premier-card-shadow">
            <div className="text-2xl font-bold mb-1 text-amber-600 score-text-shadow">
              {cardsCount}
            </div>
            <div className="text-sm text-muted-foreground mb-2 font-medium">Cards</div>
            <div className="text-xs text-muted-foreground font-medium">
              {timelineEventsCount} Events
            </div>
          </div>
          
          <div className="p-4 rounded-lg stat-block-away-gradient premier-card-shadow">
            <div 
              className="text-2xl font-bold mb-1 score-text-outline"
              style={getScoreStyle(awayTeamColor)}
            >
              {awayGoalsCount}
            </div>
            <div className="text-sm text-muted-foreground mb-2 font-medium">Goals</div>
            <div className="text-xs text-muted-foreground truncate font-medium">
              {fixture.away_team?.name || 'Away'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchStatisticsSummary;
