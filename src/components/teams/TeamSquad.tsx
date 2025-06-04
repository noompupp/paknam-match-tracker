
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Team } from "@/types/database";
import { useEnhancedTeamPlayerStats } from "@/hooks/useEnhancedTeamPlayerStats";
import TeamSquadHeader from "./TeamSquadHeader";
import TeamStatsOverview from "./TeamStatsOverview";
import PlayersList from "./PlayersList";

interface TeamSquadProps {
  team: Team;
  members: any[] | undefined;
  isLoading: boolean;
}

const TeamSquad = ({ team, members, isLoading }: TeamSquadProps) => {
  // Use enhanced player stats that includes minutes played
  const { data: enhancedPlayers, isLoading: enhancedLoading } = useEnhancedTeamPlayerStats(team.id);
  
  // Use enhanced data if available, fallback to passed members
  const playersData = enhancedPlayers || members || [];
  const actualLoading = enhancedLoading || isLoading;

  const totalGoals = playersData?.reduce((sum, player) => sum + (player.goals || 0), 0) || 0;
  const totalAssists = playersData?.reduce((sum, player) => sum + (player.assists || 0), 0) || 0;
  const totalMinutesPlayed = playersData?.reduce((sum, player) => sum + (player.totalMinutesPlayed || 0), 0) || 0;
  const topScorer = playersData?.reduce((prev, current) => 
    (current.goals || 0) > (prev?.goals || 0) ? current : prev, playersData[0]
  );

  console.log('👥 TeamSquad: Using enhanced player data:', {
    teamName: team.name,
    playersCount: playersData?.length,
    totalMinutesPlayed,
    usingEnhancedData: !!enhancedPlayers
  });

  return (
    <Card id="team-squad" className="card-shadow-lg animate-fade-in">
      <TeamSquadHeader team={team} playerCount={playersData?.length || 0} />
      <CardContent>
        <div className="space-y-6">
          {/* Team Statistics Overview with Minutes Played */}
          {!actualLoading && playersData && playersData.length > 0 && (
            <TeamStatsOverview 
              totalGoals={totalGoals}
              totalAssists={totalAssists}
              topScorer={topScorer}
              totalMinutesPlayed={totalMinutesPlayed}
            />
          )}

          <Separator />

          {/* Players List with Enhanced Stats */}
          <PlayersList players={playersData} isLoading={actualLoading} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSquad;
