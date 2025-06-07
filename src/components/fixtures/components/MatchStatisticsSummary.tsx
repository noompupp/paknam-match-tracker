
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";

interface MatchStatisticsSummaryProps {
  fixture: any;
  processedEvents: {
    homeGoals: any[];
    awayGoals: any[];
  };
  teamData: {
    homeTeamColor: string;
    awayTeamColor: string;
  };
  cards: any[];
}

const MatchStatisticsSummary = ({
  fixture,
  processedEvents,
  teamData,
  cards
}: MatchStatisticsSummaryProps) => {
  return (
    <Card className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 shadow-lg">
      <CardContent className="pt-8 pb-8">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={teamData.homeTeamColor}
              size="md"
              showName={false}
            />
            <div className="text-5xl font-black mb-2" style={{ color: teamData.homeTeamColor }}>
              {processedEvents.homeGoals.length}
            </div>
            <div className="text-lg font-bold text-muted-foreground">Goals</div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div className="text-5xl font-black mb-2 text-amber-600">
              {cards.length}
            </div>
            <div className="text-lg font-bold text-muted-foreground">Cards</div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={teamData.awayTeamColor}
              size="md"
              showName={false}
            />
            <div className="text-5xl font-black mb-2" style={{ color: teamData.awayTeamColor }}>
              {processedEvents.awayGoals.length}
            </div>
            <div className="text-lg font-bold text-muted-foreground">Goals</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchStatisticsSummary;
