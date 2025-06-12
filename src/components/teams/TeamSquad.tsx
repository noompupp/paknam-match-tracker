
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Team } from "@/types/database";
import { useEnhancedTeamPlayerStats } from "@/hooks/useEnhancedTeamPlayerStats";
import TeamSquadHeader from "./TeamSquadHeader";
import EnhancedTeamStatsOverview from "./components/EnhancedTeamStatsOverview";
import PlayersList from "./PlayersList";
import type { TeamStatsOverview } from "@/services/enhancedTeamStatsService";

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

  const mostExperienced = playersData?.reduce((prev, current) => 
    (current.totalMinutesPlayed || 0) > (prev?.totalMinutesPlayed || 0) ? current : prev, playersData[0]
  );

  // Create overview object that matches TeamStatsOverview interface
  const overview: TeamStatsOverview = {
    totalPlayers: playersData?.length || 0,
    totalGoals,
    totalAssists,
    totalMinutes: totalMinutesPlayed,
    totalMatches: Math.max(...(playersData?.map(p => p.matches_played || 0) || [0])),
    averageGoalsPerMatch: totalMatches > 0 ? Number((totalGoals / totalMatches).toFixed(2)) : 0,
    averageMinutesPerPlayer: playersData?.length > 0 ? Math.round(totalMinutesPlayed / playersData.length) : 0,
    topScorer: topScorer ? {
      ...topScorer,
      goalsPerMatch: (topScorer.matches_played || 0) > 0 ? Number(((topScorer.goals || 0) / (topScorer.matches_played || 1)).toFixed(2)) : 0,
      assistsPerMatch: (topScorer.matches_played || 0) > 0 ? Number(((topScorer.assists || 0) / (topScorer.matches_played || 1)).toFixed(2)) : 0,
      minutesPerMatch: (topScorer.matches_played || 0) > 0 ? Math.round((topScorer.totalMinutesPlayed || 0) / (topScorer.matches_played || 1)) : 0,
      contributionScore: (topScorer.goals || 0) * 3 + (topScorer.assists || 0) * 2 + Math.floor((topScorer.totalMinutesPlayed || 0) / 90),
      team: {
        id: team.__id__,
        name: team.name,
        color: team.color,
        logo: team.logo
      }
    } : null,
    topAssister: topAssister ? {
      ...topAssister,
      goalsPerMatch: (topAssister.matches_played || 0) > 0 ? Number(((topAssister.goals || 0) / (topAssister.matches_played || 1)).toFixed(2)) : 0,
      assistsPerMatch: (topAssister.matches_played || 0) > 0 ? Number(((topAssister.assists || 0) / (topAssister.matches_played || 1)).toFixed(2)) : 0,
      minutesPerMatch: (topAssister.matches_played || 0) > 0 ? Math.round((topAssister.totalMinutesPlayed || 0) / (topAssister.matches_played || 1)) : 0,
      contributionScore: (topAssister.goals || 0) * 3 + (topAssister.assists || 0) * 2 + Math.floor((topAssister.totalMinutesPlayed || 0) / 90),
      team: {
        id: team.__id__,
        name: team.name,
        color: team.color,
        logo: team.logo
      }
    } : null,
    mostExperienced: mostExperienced ? {
      ...mostExperienced,
      goalsPerMatch: (mostExperienced.matches_played || 0) > 0 ? Number(((mostExperienced.goals || 0) / (mostExperienced.matches_played || 1)).toFixed(2)) : 0,
      assistsPerMatch: (mostExperienced.matches_played || 0) > 0 ? Number(((mostExperienced.assists || 0) / (mostExperienced.matches_played || 1)).toFixed(2)) : 0,
      minutesPerMatch: (mostExperienced.matches_played || 0) > 0 ? Math.round((mostExperienced.totalMinutesPlayed || 0) / (mostExperienced.matches_played || 1)) : 0,
      contributionScore: (mostExperienced.goals || 0) * 3 + (mostExperienced.assists || 0) * 2 + Math.floor((mostExperienced.totalMinutesPlayed || 0) / 90),
      team: {
        id: team.__id__,
        name: team.name,
        color: team.color,
        logo: team.logo
      }
    } : null
  };

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
            <EnhancedTeamStatsOverview overview={overview} />
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
