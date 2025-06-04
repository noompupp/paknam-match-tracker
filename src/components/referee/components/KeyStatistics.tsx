
import { TrendingUp } from "lucide-react";

interface KeyStatisticsProps {
  events: any[];
  goals: any[];
  cards: any[];
  trackedPlayers: any[];
}

const KeyStatistics = ({
  events,
  goals,
  cards,
  trackedPlayers
}: KeyStatisticsProps) => {
  const keyStats = {
    totalEvents: events.length,
    totalGoals: goals.length,
    totalCards: cards.length,
    averagePlaytime: trackedPlayers.length > 0 ? 
      Math.round((trackedPlayers.reduce((sum, p) => sum + p.totalTime, 0) / trackedPlayers.length) / 60 * 100) / 100 : 0
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Key Statistics
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">{keyStats.totalEvents}</p>
          <p className="text-xs text-blue-800">Total Events</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">{keyStats.totalGoals}</p>
          <p className="text-xs text-green-800">Goals & Assists</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-600">{keyStats.totalCards}</p>
          <p className="text-xs text-yellow-800">Cards Issued</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">{keyStats.averagePlaytime}m</p>
          <p className="text-xs text-purple-800">Avg. Playtime</p>
        </div>
      </div>
    </div>
  );
};

export default KeyStatistics;
