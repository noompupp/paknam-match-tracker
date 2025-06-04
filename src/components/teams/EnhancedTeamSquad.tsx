
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, TrendingUp } from "lucide-react";
import { useEnhancedTeamPlayerStats } from "@/hooks/useEnhancedTeamPlayerStats";
import { playerTimeAggregationService } from "@/services/playerTimeAggregationService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import TeamSquadHeader from "./TeamSquadHeader";
import TeamStatsOverview from "./TeamStatsOverview";
import PlayersList from "./PlayersList";

interface EnhancedTeamSquadProps {
  teamId: string;
  teamName: string;
}

const EnhancedTeamSquad = ({ teamId, teamName }: EnhancedTeamSquadProps) => {
  const { data: enhancedPlayers, isLoading: enhancedLoading, refetch } = useEnhancedTeamPlayerStats(teamId);
  const [isAggregating, setIsAggregating] = useState(false);
  const { toast } = useToast();

  const handleAggregatePlayerTimes = async () => {
    setIsAggregating(true);
    try {
      const result = await playerTimeAggregationService.aggregatePlayerTimesToMembers();
      
      if (result.success) {
        toast({
          title: "Time Aggregation Complete!",
          description: result.message,
        });
        
        // Refetch the data to show updated stats
        refetch();
      } else {
        toast({
          title: "Aggregation Issues",
          description: `${result.message}. ${result.errors.length} errors occurred.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Aggregation Failed",
        description: "Failed to aggregate player times. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAggregating(false);
    }
  };

  const playersData = enhancedPlayers || [];
  const totalGoals = playersData?.reduce((sum, player) => sum + (player.goals || 0), 0) || 0;
  const totalAssists = playersData?.reduce((sum, player) => sum + (player.assists || 0), 0) || 0;
  const totalMinutesPlayed = playersData?.reduce((sum, player) => sum + (player.totalMinutesPlayed || 0), 0) || 0;
  const topScorer = playersData?.reduce((prev, current) => 
    (current.goals || 0) > (prev?.goals || 0) ? current : prev, playersData[0]
  );

  console.log('👥 EnhancedTeamSquad: Rendering with enhanced data:', {
    teamName,
    teamId,
    playersCount: playersData?.length,
    totalMinutesPlayed,
    playersWithMinutes: playersData?.filter(p => (p.totalMinutesPlayed || 0) > 0).length,
    usingEnhancedData: !!enhancedPlayers
  });

  return (
    <Card id="team-squad" className="card-shadow-lg animate-fade-in">
      <TeamSquadHeader 
        team={{ name: teamName, id: parseInt(teamId) }} 
        playerCount={playersData?.length || 0} 
      />
      <CardContent>
        <div className="space-y-6">
          {/* Enhanced Controls */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleAggregatePlayerTimes}
              disabled={isAggregating}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Clock className={`h-4 w-4 ${isAggregating ? 'animate-spin' : ''}`} />
              {isAggregating ? 'Aggregating...' : 'Aggregate Playtime'}
            </Button>
            
            <Button 
              onClick={() => refetch()}
              disabled={enhancedLoading}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${enhancedLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          {/* Team Statistics Overview with Enhanced Minutes Display */}
          {!enhancedLoading && playersData && playersData.length > 0 && (
            <TeamStatsOverview 
              totalGoals={totalGoals}
              totalAssists={totalAssists}
              topScorer={topScorer}
              totalMinutesPlayed={totalMinutesPlayed}
            />
          )}

          <Separator />

          {/* Enhanced Players List with Debug Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Players ({playersData?.length || 0})</h3>
              {totalMinutesPlayed > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{playersData?.filter(p => (p.totalMinutesPlayed || 0) > 0).length} players with recorded playtime</span>
                </div>
              )}
            </div>
            
            <PlayersList players={playersData} isLoading={enhancedLoading} />
          </div>

          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Team ID: {teamId}</li>
                <li>Players Count: {playersData?.length || 0}</li>
                <li>Total Minutes: {totalMinutesPlayed}</li>
                <li>Players with Minutes: {playersData?.filter(p => (p.totalMinutesPlayed || 0) > 0).length}</li>
                <li>Enhanced Data: {enhancedPlayers ? 'Yes' : 'No'}</li>
                <li>Loading: {enhancedLoading ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamSquad;
