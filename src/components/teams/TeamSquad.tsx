
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Team } from "@/types/database";
import { useEnhancedTeamPlayerStats } from "@/hooks/useEnhancedTeamPlayerStats";
import TeamSquadHeader from "./TeamSquadHeader";
import EnhancedTeamStatsOverview from "./components/EnhancedTeamStatsOverview";
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
  const totalMatches = playersData?.reduce((sum, player) => sum + (player.matches_played || 0), 0) || 0;
  
  const topScorer = playersData?.reduce((prev, current) => 
    (current.goals || 0) > (prev?.goals || 0) ? current : prev, playersData[0]
  );
  
  const topAssister = playersData?.reduce((prev, current) => 
    (current.assists || 0) > (prev?.assists || 0) ? current : prev, playersData[0]
  );

  console.log('👥 TeamSquad: Using enhanced player data:', {
    teamName: team.name,
    playersCount: playersData?.length,
    totalMinutesPlayed,
    usingEnhancedData: !!enhancedPlayers
  });

  return (
    <Card id="team-squad" className="card-shadow-lg animate-fade-in border-primary/20 bg-gradient-to-b from-background via-background to-muted/20">
      <TeamSquadHeader team={team} playerCount={playersData?.length || 0} />
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-6">
          {/* Enhanced Team Statistics Overview */}
          {!actualLoading && playersData && playersData.length > 0 && (
            <EnhancedTeamStatsOverview 
              totalGoals={totalGoals}
              totalAssists={totalAssists}
              totalMinutesPlayed={totalMinutesPlayed}
              totalMatches={totalMatches}
              topScorer={topScorer}
              topAssister={topAssister}
            />
          )}

          <Separator className="bg-border/50" />

          {/* Enhanced Players List */}
          <PlayersList players={playersData} isLoading={actualLoading} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSquad;
