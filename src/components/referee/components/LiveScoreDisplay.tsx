
import { Trophy, Users } from "lucide-react";

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
  // Enhanced score styling for better visibility and contrast
  const getScoreStyle = (isHome: boolean) => ({
    color: isHome ? '#2563eb' : '#16a34a', // Use semantic blue/green instead of team colors
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    fontWeight: 'bold'
  });

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-sm font-medium text-gray-600">
            {homeTeamName || 'Home'}
          </div>
          <div 
            className="text-2xl font-bold"
            style={getScoreStyle(true)}
          >
            {homeScore}
          </div>
          <div className="text-xs text-gray-500">
            Goals from assignments: {homeTeamGoals}
          </div>
        </div>
        <div className="text-center px-4">
          <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
          <div className="text-xs text-gray-500">VS</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-sm font-medium text-gray-600">
            {awayTeamName || 'Away'}
          </div>
          <div 
            className="text-2xl font-bold"
            style={getScoreStyle(false)}
          >
            {awayScore}
          </div>
          <div className="text-xs text-gray-500">
            Goals from assignments: {awayTeamGoals}
          </div>
        </div>
      </div>
      <div className="text-center mt-2 text-xs text-gray-600">
        <Users className="h-4 w-4 inline mr-1" />
        Total Assists: {totalAssists}
      </div>
    </div>
  );
};

export default LiveScoreDisplay;
