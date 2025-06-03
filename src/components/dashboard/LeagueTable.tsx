
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { Team } from "@/types/database";
import TeamLogo from "../teams/TeamLogo";

interface LeagueTableProps {
  teams: Team[] | undefined;
  isLoading: boolean;
}

const LeagueTable = ({ teams, isLoading }: LeagueTableProps) => {
  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">League Table</CardTitle>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-sm">
                <th className="text-left p-3 font-semibold">Pos</th>
                <th className="text-left p-3 font-semibold">Team</th>
                <th className="text-center p-3 font-semibold">P</th>
                <th className="text-center p-3 font-semibold">W</th>
                <th className="text-center p-3 font-semibold">D</th>
                <th className="text-center p-3 font-semibold">L</th>
                <th className="text-center p-3 font-semibold">GD</th>
                <th className="text-center p-3 font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                    <td className="p-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="p-3 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : teams && teams.length > 0 ? (
                teams.map((team) => (
                  <tr key={team.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold">{team.position}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <TeamLogo team={team} size="small" showColor />
                        <span className="font-semibold">{team.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">{team.played}</td>
                    <td className="p-3 text-center">{team.won}</td>
                    <td className="p-3 text-center">{team.drawn}</td>
                    <td className="p-3 text-center">{team.lost}</td>
                    <td className="p-3 text-center font-semibold">
                      {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                    </td>
                    <td className="p-3 text-center font-bold text-primary">{team.points}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No teams data available
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
