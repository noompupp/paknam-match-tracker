
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamPlayerStats } from "@/hooks/usePlayerStats";
import { useTeams } from "@/hooks/useTeams";
import { Member } from "@/types/database";
import TeamSquadHeader from "./components/TeamSquadHeader";
import TeamPlayersList from "./components/TeamPlayersList";
import TeamStatsSummary from "./components/TeamStatsSummary";

interface EnhancedTeamSquadProps {
  teamId: string;
  teamName: string;
}

const EnhancedTeamSquad = ({ teamId, teamName }: EnhancedTeamSquadProps) => {
  const { data: playerStatsData, isLoading, error } = useTeamPlayerStats(teamId);
  const { data: teams } = useTeams();

  // Find the team data for colors and additional info
  const teamData = teams?.find(team => team.__id__ === teamId || team.id.toString() === teamId);

  // Transform PlayerStatsData[] to Member[] by adding missing properties
  const players: Member[] = playerStatsData ? playerStatsData.map(playerStat => ({
    id: playerStat.id,
    name: playerStat.name,
    nickname: undefined,
    number: playerStat.number,
    position: playerStat.position,
    role: 'Player', // Default role
    goals: playerStat.goals,
    assists: playerStat.assists,
    yellow_cards: playerStat.yellow_cards,
    red_cards: playerStat.red_cards,
    total_minutes_played: playerStat.total_minutes_played,
    matches_played: playerStat.matches_played,
    team_id: playerStat.team_id,
    created_at: new Date().toISOString(), // Default created_at
    updated_at: new Date().toISOString(), // Default updated_at
    ProfileURL: playerStat.ProfileURL
  })) : [];

  if (error) {
    return (
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p className="font-medium">Error loading squad data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Unable to fetch team squad'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premier-league-card border-l-4 border-l-primary">
      <TeamSquadHeader 
        teamName={teamName} 
        playerCount={!isLoading && players ? players.length : 0} 
      />
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-7 w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : players && players.length > 0 ? (
          <div>
            <TeamPlayersList players={players} teamData={teamData} />
            <TeamStatsSummary players={players} />
          </div>
        ) : (
          <TeamPlayersList players={[]} teamData={teamData} />
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamSquad;
