
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { BaseStepProps } from "./types";
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

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  const handlePlayerSelect = (player: ComponentPlayer) => {
    // Determine if this is an own goal based on player's team vs selected team
    const playerTeam = player.team;
    const scoringTeam = getTeamName(selectedTeam!);
    const isOwnGoal = playerTeam !== scoringTeam;

    onDataChange({ 
      selectedPlayer: player,
      isOwnGoal
    });
    onNext();
  };

  if (!selectedTeam) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select goal scorer from {getTeamName(selectedTeam)}</h3>
      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
        {getTeamPlayers().map((player) => (
          <Button
            key={`player-${player.id}`}
            onClick={() => handlePlayerSelect(player)}
            variant="outline"
            className="justify-start h-auto p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                {player.number || '?'}
              </div>
              <div className="text-left">
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-muted-foreground">{player.team}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
      
      {/* Show all players option */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Or select from any team (for own goals):</h4>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {[...(homeTeamPlayers || []), ...(awayTeamPlayers || [])]
            .filter(player => !getTeamPlayers().some(p => p.id === player.id))
            .map((player) => (
            <Button
              key={`all-player-${player.id}`}
              onClick={() => handlePlayerSelect(player)}
              variant="ghost"
              className="justify-start h-auto p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <div className="text-left">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-muted-foreground ml-2">({player.team})</span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionStep;
