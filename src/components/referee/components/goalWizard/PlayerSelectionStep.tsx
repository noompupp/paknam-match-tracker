
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BaseStepProps, GoalWizardData } from "./types";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface PlayerSelectionStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'homeTeamPlayers' | 'awayTeamPlayers' | 'wizardData' | 'onDataChange' | 'onNext'> {}

const PlayerSelectionStep = ({ 
  selectedFixtureData, 
  homeTeamPlayers, 
  awayTeamPlayers, 
  wizardData, 
  onDataChange, 
  onNext 
}: PlayerSelectionStepProps) => {
  const { selectedTeam } = wizardData;

  const getTeamPlayers = () => {
    if (selectedTeam === 'home') return homeTeamPlayers || [];
    if (selectedTeam === 'away') return awayTeamPlayers || [];
    return [];
  };

  const getOpposingTeamPlayers = () => {
    if (selectedTeam === 'home') return awayTeamPlayers || [];
    if (selectedTeam === 'away') return homeTeamPlayers || [];
    return [];
  };

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  const handlePlayerSelect = (player: ComponentPlayer) => {
    if (selectedTeam) {
      const playerTeam = player.team;
      const scoringTeamName = getTeamName(selectedTeam);
      const isOwnGoalScenario = playerTeam !== scoringTeamName;
      
      onDataChange({
        selectedPlayer: player,
        isOwnGoal: isOwnGoalScenario
      });
      onNext();
    }
  };

  if (!selectedTeam) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Who scored for {getTeamName(selectedTeam)}?
      </h3>
      <p className="text-sm text-muted-foreground">
        Tip: You can also select a player from the opposing team if it was an own goal
      </p>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium mb-2">{getTeamName(selectedTeam)} Players</h4>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {getTeamPlayers().map((player) => (
              <Button
                key={`team-${player.id}`}
                onClick={() => handlePlayerSelect(player)}
                variant="outline"
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
                    {player.number || '?'}
                  </div>
                  <span>{player.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-muted-foreground">
            {selectedTeam === 'home' ? getTeamName('away') : getTeamName('home')} Players (Own Goal)
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {getOpposingTeamPlayers().map((player) => (
              <Button
                key={`opposing-${player.id}`}
                onClick={() => handlePlayerSelect(player)}
                variant="outline"
                className="justify-start h-auto p-3 border-orange-200 hover:border-orange-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">
                    {player.number || '?'}
                  </div>
                  <span className="text-orange-700">{player.name}</span>
                  <Badge variant="outline" className="ml-auto text-orange-600 border-orange-300">
                    Own Goal
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionStep;
