
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Users, Clock } from "lucide-react";

interface TeamStatsOverviewProps {
  totalGoals: number;
  totalAssists: number;
  topScorer?: any;
  totalMinutesPlayed?: number;
}

const TeamStatsOverview = ({ 
  totalGoals, 
  totalAssists, 
  topScorer,
  totalMinutesPlayed = 0
}: TeamStatsOverviewProps) => {
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Team Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-700">{totalGoals}</div>
          <div className="text-sm text-green-600">Total Goals</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-700">{totalAssists}</div>
          <div className="text-sm text-blue-600">Total Assists</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-purple-700">{formatMinutes(totalMinutesPlayed)}</div>
          <div className="text-sm text-purple-600">Total Minutes</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
          <div className="text-sm font-medium text-yellow-700">Top Scorer</div>
          <div className="text-sm text-yellow-600 truncate">
            {topScorer?.name || 'N/A'}
          </div>
          {topScorer?.goals > 0 && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {topScorer.goals} goals
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamStatsOverview;
