
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: number;
  name: string;
  team: string;
  number: number;
  position: string;
}

interface PlayerGoalAssignmentProps {
  allPlayers: Player[];
  selectedFixtureData: any;
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  matchTime: number;
  assignGoal: (player: any, matchTime: number, fixtureId: number, homeTeam: { id: number; name: string }, awayTeam: { id: number; name: string }) => any;
  addEvent: (type: string, description: string, time: number) => void;
  formatTime: (seconds: number) => string;
}

export const usePlayerGoalAssignment = ({
  allPlayers,
  selectedFixtureData,
  selectedGoalPlayer,
  selectedGoalType,
  matchTime,
  assignGoal,
  addEvent,
  formatTime
}: PlayerGoalAssignmentProps) => {
  const { toast } = useToast();

  const handleAssignGoal = async () => {
    if (!selectedGoalPlayer) {
      toast({
        title: "Error",
        description: "Please select a player first.",
        variant: "destructive",
      });
      return;
    }

    const player = allPlayers.find(p => p.id.toString() === selectedGoalPlayer);
    if (!player) {
      toast({
        title: "Error",
        description: "Selected player not found.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFixtureData) {
      toast({
        title: "Error",
        description: "No fixture selected. Please select a match first.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('⚽ PlayerGoalAssignment: Starting goal/assist assignment with improved flow:', {
        player: player.name,
        team: player.team,
        type: selectedGoalType,
        time: matchTime,
        fixture: selectedFixtureData.id
      });

      // Prepare team data for proper ID resolution
      const homeTeam = {
        id: selectedFixtureData.home_team_id,
        name: selectedFixtureData.home_team?.name
      };
      
      const awayTeam = {
        id: selectedFixtureData.away_team_id,
        name: selectedFixtureData.away_team?.name
      };

      console.log('📊 PlayerGoalAssignment: Team data for assignment:', {
        homeTeam,
        awayTeam,
        playerTeam: player.team
      });

      // Validate that we have proper team data
      if (!homeTeam.id || !homeTeam.name || !awayTeam.id || !awayTeam.name) {
        throw new Error('Invalid fixture team data. Please ensure the fixture has valid home and away teams.');
      }

      // Use the improved assignGoal function with proper team data
      const goalData = await assignGoal(
        player, 
        matchTime, 
        selectedFixtureData.id, 
        homeTeam, 
        awayTeam
      );
      
      if (goalData) {
        // Add event to local events
        addEvent(
          selectedGoalType,
          `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} (${player.team})`,
          matchTime
        );

        toast({
          title: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} Assigned!`,
          description: `${selectedGoalType === 'goal' ? 'Goal' : 'Assist'} assigned to ${player.name} at ${formatTime(matchTime)} and saved to database.`,
        });

        console.log('✅ PlayerGoalAssignment: Goal/assist assignment completed successfully');
      }
    } catch (error) {
      console.error('❌ PlayerGoalAssignment: Error in goal/assist assignment:', error);
      
      let errorMessage = 'Failed to assign goal/assist';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    handleAssignGoal
  };
};
