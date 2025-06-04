
import { Users, Target, Trophy } from "lucide-react";

interface TeamStatsOverviewProps {
  totalGoals: number;
  totalAssists: number;
  topScorer: any;
}

const TeamStatsOverview = ({ totalGoals, totalAssists, topScorer }: TeamStatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Target className="h-4 w-4 text-green-600" />
          <span className="font-semibold">Total Goals</span>
        </div>
        <p className="text-2xl font-bold text-green-600">{totalGoals}</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="font-semibold">Total Assists</span>
        </div>
        <p className="text-2xl font-bold text-blue-600">{totalAssists}</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-yellow-600" />
          <span className="font-semibold">Top Scorer</span>
        </div>
        <p className="text-sm font-bold text-yellow-600">
          {topScorer?.name || 'N/A'} ({topScorer?.goals || 0}G)
        </p>
      </div>
    </div>
  );
};

export default TeamStatsOverview;
