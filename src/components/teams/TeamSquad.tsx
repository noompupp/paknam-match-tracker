
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Team } from "@/types/database";
import { useTeamPlayerStats } from "@/hooks/usePlayerStats";
import TeamSquadHeader from "./TeamSquadHeader";
import TeamStatsOverview from "./TeamStatsOverview";
import PlayersList from "./PlayersList";

interface TeamSquadProps {
  team: Team;
  members: any[] | undefined;
  isLoading: boolean;
}

const TeamSquad = ({ team, members, isLoading }: TeamSquadProps) => {
  // Use enhanced player stats instead of the passed members
  const { data: enhancedPlayers, isLoading: enhancedLoading } = useTeamPlayerStats(team.__id__);
  
  // Use enhanced data if available, fallback to passed members
  const playersData = enhancedPlayers || members || [];
  const actualLoading = enhancedLoading || isLoading;

  const totalGoals = playersData?.reduce((sum, player) => sum + (player.goals || 0), 0) || 0;
  const totalAssists = playersData?.reduce((sum, player) => sum + (player.assists || 0), 0) || 0;
  const topScorer = playersData?.reduce((prev, current) => 
    (current.goals || 0) > (prev?.goals || 0) ? current : prev, playersData[0]
  );

  return (
    <Card id="team-squad" className="card-shadow-lg animate-fade-in">
      <TeamSquadHeader team={team} playerCount={playersData?.length || 0} />
      <CardContent>
        <div className="space-y-6">
          {/* Team Statistics Overview */}
          {!actualLoading && playersData && playersData.length > 0 && (
            <TeamStatsOverview 
              totalGoals={totalGoals}
              totalAssists={totalAssists}
              topScorer={topScorer}
            />
          )}

          <Separator />

          {/* Players List */}
          <PlayersList players={playersData} isLoading={actualLoading} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSquad;
