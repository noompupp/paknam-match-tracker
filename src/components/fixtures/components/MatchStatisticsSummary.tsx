
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30">
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold mb-1" style={{ color: homeTeamColor }}>
              {homeGoalsCount}
            </div>
            <div className="text-sm text-muted-foreground mb-2">Goals</div>
            <div className="text-xs text-muted-foreground truncate">
              {fixture.home_team?.name || 'Home'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1 text-amber-600">
              {cardsCount}
            </div>
            <div className="text-sm text-muted-foreground mb-2">Cards</div>
            <div className="text-xs text-muted-foreground">
              {timelineEventsCount} Events
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1" style={{ color: awayTeamColor }}>
              {awayGoalsCount}
            </div>
            <div className="text-sm text-muted-foreground mb-2">Goals</div>
            <div className="text-xs text-muted-foreground truncate">
              {fixture.away_team?.name || 'Away'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchStatisticsSummary;
