
import { Trophy, Users } from "lucide-react";
import { getScoreStyle } from "@/utils/scoreColorUtils";

interface LiveScoreDisplayProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  homeTeamGoals: number;
  awayTeamGoals: number;
  totalAssists: number;
}

const LiveScoreDisplay = ({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  homeTeamGoals,
  awayTeamGoals,
  totalAssists
}: LiveScoreDisplayProps) => {
  // Use semantic colors for better visibility
  const homeTeamColor = '#2563eb'; // blue-600
  const awayTeamColor = '#16a34a'; // green-600

  return (
    <div className="match-gradient-primary rounded-lg p-4 border match-border-gradient premier-card-shadow">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-sm font-medium text-muted-foreground">
            {homeTeamName || 'Home'}
          </div>
          <div 
            className="text-2xl font-bold score-text-outline"
            style={getScoreStyle(homeTeamColor)}
          >
            {homeScore}
          </div>
          <div className="text-xs text-muted-foreground">
            Goals from assignments: {homeTeamGoals}
          </div>
        </div>
        <div className="text-center px-4">
          <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1 drop-shadow-sm" />
          <div className="text-xs text-muted-foreground">VS</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-sm font-medium text-muted-foreground">
            {awayTeamName || 'Away'}
          </div>
          <div 
            className="text-2xl font-bold score-text-outline"
            style={getScoreStyle(awayTeamColor)}
          >
            {awayScore}
          </div>
          <div className="text-xs text-muted-foreground">
            Goals from assignments: {awayTeamGoals}
          </div>
        </div>
      </div>
      <div className="text-center mt-2 text-xs text-muted-foreground bg-gradient-to-r from-transparent via-muted/10 to-transparent rounded p-2">
        <Users className="h-4 w-4 inline mr-1" />
        Total Assists: {totalAssists}
      </div>
    </div>
  );
};

export default LiveScoreDisplay;
