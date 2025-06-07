
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
  // Enhanced color fallback system
  const getEnhancedTeamColor = (color: string, fallback: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white') {
      return fallback;
    }
    return color;
  };

  const enhancedHomeColor = getEnhancedTeamColor(teamData.homeTeamColor, '#1f2937');
  const enhancedAwayColor = getEnhancedTeamColor(teamData.awayTeamColor, '#7c3aed');

  return (
    <Card className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 shadow-lg animate-fade-in">
      <CardContent className="pt-8 pb-8">
        <div className="grid grid-cols-3 gap-8 text-center">
          {/* Home Team */}
          <div className="flex flex-col items-center space-y-4 animate-scale-in">
            <div className="transition-transform duration-300 hover:scale-110">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={enhancedHomeColor}
                size="md"
                showName={false}
              />
            </div>
            <div 
              className="text-5xl font-black mb-2 tabular-nums transition-all duration-300 hover:scale-105"
              style={{ 
                color: enhancedHomeColor,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {processedEvents.homeGoals.length}
            </div>
            <div className="text-lg font-bold text-muted-foreground">Goals</div>
          </div>
          
          {/* Center Cards */}
          <div className="flex flex-col items-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div className="text-5xl font-black mb-2 text-amber-600 tabular-nums transition-all duration-300 hover:scale-105">
              {cards.length}
            </div>
            <div className="text-lg font-bold text-muted-foreground">Cards</div>
          </div>
          
          {/* Away Team */}
          <div className="flex flex-col items-center space-y-4 animate-scale-in">
            <div className="transition-transform duration-300 hover:scale-110">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={enhancedAwayColor}
                size="md"
                showName={false}
              />
            </div>
            <div 
              className="text-5xl font-black mb-2 tabular-nums transition-all duration-300 hover:scale-105"
              style={{ 
                color: enhancedAwayColor,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
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
