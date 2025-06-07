
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { Team } from "@/types/database";
import TeamLogo from "../teams/TeamLogo";
import RankChangeIndicator from "./RankChangeIndicator";

interface LeagueTableProps {
  teams: Team[] | undefined;
  isLoading: boolean;
}

const LeagueTable = ({ teams, isLoading }: LeagueTableProps) => {
  const getPositionBadgeColor = (position: number) => {
    if (position <= 4) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (position <= 6) return "bg-gradient-to-r from-blue-500 to-blue-600";
    if (position >= teams?.length! - 2) return "bg-gradient-to-r from-red-500 to-red-600";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };

  const getRowGradient = (position: number, index: number) => {
    const isEven = index % 2 === 0;
    const baseGradient = isEven 
      ? "bg-gradient-to-r from-white via-gray-50/30 to-white" 
      : "bg-gradient-to-r from-gray-50/50 via-white/30 to-gray-50/50";
    
    if (position <= 4) return `${baseGradient} hover:from-green-50 hover:via-emerald-50/50 hover:to-green-50`;
    if (position <= 6) return `${baseGradient} hover:from-blue-50 hover:via-blue-50/50 hover:to-blue-50`;
    if (position >= teams?.length! - 2) return `${baseGradient} hover:from-red-50 hover:via-red-50/50 hover:to-red-50`;
    return `${baseGradient} hover:from-gray-50 hover:via-gray-100/50 hover:to-gray-50`;
  };

  return (
    <Card className="card-shadow-lg animate-fade-in overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary text-white">
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <span className="flex items-center gap-3">
            🏆 Premier League Table
          </span>
          <ArrowRight className="h-5 w-5 text-white/80" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 border-primary/20">
              <tr className="text-sm">
                <th className="text-left p-4 font-bold text-slate-700">Pos</th>
                <th className="text-left p-4 font-bold text-slate-700">Club</th>
                <th className="text-center p-4 font-bold text-slate-700">Pl</th>
                <th className="text-center p-4 font-bold text-slate-700">W</th>
                <th className="text-center p-4 font-bold text-slate-700">D</th>
                <th className="text-center p-4 font-bold text-slate-700">L</th>
                <th className="text-center p-4 font-bold text-slate-700">GD</th>
                <th className="text-center p-4 font-bold text-slate-700">Pts</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-200/50">
                    <td className="p-4"><Skeleton className="h-4 w-6" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="p-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : teams && teams.length > 0 ? (
                teams.map((team, index) => (
                  <tr 
                    key={team.id} 
                    className={`${getRowGradient(team.position, index)} border-b border-slate-200/30 transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${getPositionBadgeColor(team.position)} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                          {team.position}
                        </div>
                        <RankChangeIndicator 
                          currentPosition={team.position} 
                          previousPosition={team.previous_position} 
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <TeamLogo team={team} size="small" showColor />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{team.name}</span>
                          <span className="text-xs text-slate-500 uppercase tracking-wide">
                            {team.name.length > 12 ? team.name.substring(0, 3).toUpperCase() : team.name.substring(0, 6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-700">{team.played}</td>
                    <td className="p-4 text-center font-semibold text-green-600">{team.won}</td>
                    <td className="p-4 text-center font-semibold text-yellow-600">{team.drawn}</td>
                    <td className="p-4 text-center font-semibold text-red-600">{team.lost}</td>
                    <td className="p-4 text-center font-bold text-slate-800">
                      <span className={team.goal_difference > 0 ? 'text-green-600' : team.goal_difference < 0 ? 'text-red-600' : 'text-slate-600'}>
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-3 py-1 rounded-full font-bold text-lg shadow-md">
                        {team.points}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-8">
                      <div className="text-slate-400 text-6xl mb-4">🏆</div>
                      <p className="text-slate-600 font-semibold">No teams data available</p>
                      <p className="text-slate-500 text-sm mt-2">League table will appear once teams are added</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeagueTable;
