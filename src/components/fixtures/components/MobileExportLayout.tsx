
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";

interface MobileExportLayoutProps {
  fixture: any;
  goals: any[];
  cards: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
}

const MobileExportLayout = ({
  fixture,
  goals,
  cards,
  homeGoals,
  awayGoals,
  homeTeamColor,
  awayTeamColor
}: MobileExportLayoutProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  return (
    <div 
      className="w-[375px] max-h-[667px] bg-white overflow-hidden"
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '500px'
      }}
    >
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-yellow-600" />
          <Badge variant="outline" className="text-sm font-bold bg-white">
            {fixture.status === 'completed' ? 'FULL TIME' : 'MATCH'}
          </Badge>
        </div>
        
        {/* Teams and Score - Horizontal Compact Layout */}
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={homeTeamColor}
              size="sm"
              showName={false}
            />
            <div className="text-right">
              <div className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">
                {fixture.home_team?.name || 'Home'}
              </div>
              <div className="text-2xl font-bold" style={{ color: homeTeamColor }}>
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* Score Separator */}
          <div className="px-3">
            <div className="text-xl font-bold text-muted-foreground">-</div>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1 flex-row-reverse">
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={awayTeamColor}
              size="sm"
              showName={false}
            />
            <div className="text-left">
              <div className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">
                {fixture.away_team?.name || 'Away'}
              </div>
              <div className="text-2xl font-bold" style={{ color: awayTeamColor }}>
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="text-center mt-3">
          <div className="text-xs text-muted-foreground">
            {fixture.match_date}
          </div>
        </div>
      </div>

      {/* Goals Section - Compact */}
      {goals.length > 0 && (
        <div className="p-3 border-b bg-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚽</span>
            </div>
            <h3 className="font-semibold text-sm">Goals ({goals.length})</h3>
          </div>
          
          <div className="space-y-2">
            {goals.map((goal, index) => {
              const isHomeGoal = homeGoals.includes(goal);
              const teamColor = isHomeGoal ? homeTeamColor : awayTeamColor;
              const playerName = getGoalPlayerName(goal);
              const assistName = getGoalAssistPlayerName(goal);
              const time = getGoalTime(goal);
              
              return (
                <div key={`goal-${goal.id}-${index}`} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: teamColor }}
                    />
                    <div>
                      <div className="text-sm font-medium truncate max-w-[120px]">
                        {playerName}
                      </div>
                      {assistName && (
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                          Assist: {assistName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {formatTime(time)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards Section - Compact */}
      {cards.length > 0 && (
        <div className="p-3 border-b bg-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <h3 className="font-semibold text-sm">Cards ({cards.length})</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {cards.slice(0, 6).map((card, index) => (
              <div key={`card-${card.id}-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                <Badge 
                  variant={card.type === 'red' ? 'destructive' : 'outline'}
                  className="text-xs px-1 py-0"
                >
                  {card.type}
                </Badge>
                <span className="truncate flex-1 font-medium">
                  {card.player || card.playerName}
                </span>
              </div>
            ))}
          </div>
          
          {cards.length > 6 && (
            <div className="text-center mt-2">
              <span className="text-xs text-muted-foreground">
                +{cards.length - 6} more cards
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer - App Branding */}
      <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 text-center">
        <div className="text-xs text-muted-foreground">
          Generated by Referee Tools
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default MobileExportLayout;
