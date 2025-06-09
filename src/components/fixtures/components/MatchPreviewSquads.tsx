
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Clock } from "lucide-react";
import { Team, Member } from "@/types/database";
import TeamLogo from "../../teams/TeamLogo";

interface MatchPreviewSquadsProps {
  homeTeam: Team;
  awayTeam: Team;
  homeSquad: Member[];
  awaySquad: Member[];
}

const MatchPreviewSquads = ({ homeTeam, awayTeam, homeSquad, awaySquad }: MatchPreviewSquadsProps) => {
  const getTopScorers = (squad: Member[]) => {
    return squad
      .filter(player => player.goals && player.goals > 0)
      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 3);
  };

  const getSquadStats = (squad: Member[]) => {
    const totalGoals = squad.reduce((sum, player) => sum + (player.goals || 0), 0);
    const totalAssists = squad.reduce((sum, player) => sum + (player.assists || 0), 0);
    const playersWithMinutes = squad.filter(player => (player.total_minutes_played || 0) > 0).length;
    
    return { totalGoals, totalAssists, playersWithMinutes, squadSize: squad.length };
  };

  const homeTopScorers = getTopScorers(homeSquad);
  const awayTopScorers = getTopScorers(awaySquad);
  const homeStats = getSquadStats(homeSquad);
  const awayStats = getSquadStats(awaySquad);

  const PlayerCard = ({ player }: { player: Member }) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
          {player.number || '?'}
        </Badge>
        <div>
          <p className="font-medium text-sm">{player.name}</p>
          <p className="text-xs text-muted-foreground">{player.position || 'Player'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{player.goals || 0}G</p>
        <p className="text-xs text-muted-foreground">{player.assists || 0}A</p>
      </div>
    </div>
  );

  const SquadOverview = ({ team, squad, stats, topScorers }: {
    team: Team;
    squad: Member[];
    stats: ReturnType<typeof getSquadStats>;
    topScorers: Member[];
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TeamLogo team={team} size="small" />
          {team.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Squad Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.squadSize}</span>
            </div>
            <p className="text-xs text-muted-foreground">Players</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Target className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.totalGoals}</span>
            </div>
            <p className="text-xs text-muted-foreground">Goals</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-bold">{stats.playersWithMinutes}</span>
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>

        {/* Top Scorers */}
        {topScorers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Top Scorers</h4>
            <div className="space-y-2">
              {topScorers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        )}

        {/* Recent additions or key players could be shown here */}
        {squad.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No squad information available
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <SquadOverview 
          team={homeTeam}
          squad={homeSquad}
          stats={homeStats}
          topScorers={homeTopScorers}
        />
        
        <SquadOverview 
          team={awayTeam}
          squad={awaySquad}
          stats={awayStats}
          topScorers={awayTopScorers}
        />
      </div>
    </div>
  );
};

export default MatchPreviewSquads;
