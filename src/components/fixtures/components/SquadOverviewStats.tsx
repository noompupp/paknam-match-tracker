
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Team, Member } from "@/types/database";

interface SquadOverviewStatsProps {
  homeTeam: Team;
  awayTeam: Team;
  homeSquad: Member[];
  awaySquad: Member[];
}

const SquadOverviewStats = ({ homeTeam, awayTeam, homeSquad, awaySquad }: SquadOverviewStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20 border transition-all duration-300 hover:shadow-md hover:border-primary/30 w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg truncate">{homeTeam.name} Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{homeSquad.length}</p>
              <p className="text-xs text-muted-foreground">Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {homeSquad.reduce((sum, p) => sum + (p.goals || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {homeSquad.reduce((sum, p) => sum + (p.assists || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Assists</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-l from-secondary/5 to-transparent border-secondary/20 border transition-all duration-300 hover:shadow-md hover:border-secondary/30 w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg truncate">{awayTeam.name} Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-secondary">{awaySquad.length}</p>
              <p className="text-xs text-muted-foreground">Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {awaySquad.reduce((sum, p) => sum + (p.goals || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {awaySquad.reduce((sum, p) => sum + (p.assists || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Assists</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SquadOverviewStats;
