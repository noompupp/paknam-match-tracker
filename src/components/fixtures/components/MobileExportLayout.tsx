
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Calendar } from "lucide-react";
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
      className="w-[375px] bg-white overflow-hidden shadow-xl"
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minHeight: '600px',
        maxHeight: '667px'
      }}
    >
      {/* Enhanced Header with Team Layout */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 border-b-2 border-gray-100">
        {/* Match Status Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <Trophy className="h-4 w-4 text-amber-500" />
            <Badge variant="outline" className="text-sm font-bold border-0 bg-transparent">
              {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE MATCH'}
            </Badge>
          </div>
        </div>
        
        {/* Teams Layout - Horizontal with proper spacing */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team - Left Aligned */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={homeTeamColor}
              size="md"
              showName={false}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-600 mb-1 truncate">
                {fixture.home_team?.name || 'Home'}
              </div>
              <div 
                className="text-3xl font-bold leading-none"
                style={{ color: homeTeamColor }}
              >
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* Score Separator */}
          <div className="px-4 flex items-center">
            <div className="text-2xl font-light text-slate-400">—</div>
          </div>

          {/* Away Team - Right Aligned */}
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse">
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={awayTeamColor}
              size="md"
              showName={false}
            />
            <div className="flex-1 min-w-0 text-right">
              <div className="text-xs font-medium text-slate-600 mb-1 truncate">
                {fixture.away_team?.name || 'Away'}
              </div>
              <div 
                className="text-3xl font-bold leading-none"
                style={{ color: awayTeamColor }}
              >
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Match Info Row */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{fixture.match_date}</span>
          </div>
          {fixture.venue && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{fixture.venue}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Goals Section - Enhanced Design */}
      {goals.length > 0 && (
        <div className="p-4 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚽</span>
            </div>
            <h3 className="font-bold text-base text-slate-800">
              Goals ({goals.length})
            </h3>
          </div>
          
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const isHomeGoal = homeGoals.includes(goal);
              const teamColor = isHomeGoal ? homeTeamColor : awayTeamColor;
              const playerName = getGoalPlayerName(goal);
              const assistName = getGoalAssistPlayerName(goal);
              const time = getGoalTime(goal);
              
              return (
                <div 
                  key={`goal-${goal.id}-${index}`} 
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {playerName}
                      </div>
                      {assistName && (
                        <div className="text-xs text-slate-500 truncate">
                          Assist: {assistName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-mono text-slate-600 bg-white px-2 py-1 rounded border">
                    {formatTime(time)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards Section - Enhanced Design */}
      {cards.length > 0 && (
        <div className="p-4 bg-slate-25 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <h3 className="font-bold text-base text-slate-800">
              Disciplinary ({cards.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {cards.slice(0, 4).map((card, index) => (
              <div 
                key={`card-${card.id}-${index}`} 
                className="flex items-center gap-3 p-2 bg-white rounded border"
              >
                <Badge 
                  variant={card.type === 'red' ? 'destructive' : 'outline'}
                  className="text-xs px-2 py-1 font-semibold"
                >
                  {card.type?.toUpperCase()}
                </Badge>
                <span className="text-sm font-medium text-slate-700 truncate flex-1">
                  {card.player || card.playerName}
                </span>
              </div>
            ))}
          </div>
          
          {cards.length > 4 && (
            <div className="text-center mt-3 p-2 bg-white rounded border">
              <span className="text-xs text-slate-500 font-medium">
                +{cards.length - 4} more disciplinary actions
              </span>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Footer */}
      <div className="mt-auto p-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-t-2 border-slate-200">
        <div className="text-center">
          <div className="text-sm font-bold text-slate-700 mb-1">
            📊 Match Summary Report
          </div>
          <div className="text-xs text-slate-500">
            Generated by Referee Tools • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileExportLayout;
