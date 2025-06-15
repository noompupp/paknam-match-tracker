import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { BaseStepProps } from "./types";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import MobilePlayerGrid from "./MobilePlayerGrid";

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
    const scoringTeamName = getTeamName(selectedTeam!);
    const playerTeamName = player.team;
    
    const isOwnGoal = playerTeamName !== scoringTeamName;

    onDataChange({ 
      selectedPlayer: player,
      isOwnGoal
    });
    
    onNext();
  };

  if (!selectedTeam) return null;

  const scoringTeamName = getTeamName(selectedTeam);
  const teamPlayers = getTeamPlayers();
  const allPlayers = [...(homeTeamPlayers || []), ...(awayTeamPlayers || [])];
  const otherTeamPlayers = allPlayers.filter(player => 
    !teamPlayers.some(p => p.id === player.id)
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Goal Scorer</h3>
        <p className="text-muted-foreground text-sm">
          Goal will benefit: <strong>{scoringTeamName}</strong>
        </p>
      </div>

      {/* Primary Team Players */}
      <MobilePlayerGrid
        players={teamPlayers}
        onPlayerSelect={handlePlayerSelect}
        variant="primary"
        title={`${scoringTeamName} Players (Regular Goals)`}
      />

      {/* Other Team Players (Own Goals) */}
      {otherTeamPlayers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h4 className="font-medium text-sm text-orange-800">
              Other Team Players (Own Goals)
            </h4>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-orange-700">
              Selecting a player from another team will record this as an own goal, 
              benefiting {scoringTeamName}.
            </p>
          </div>

          <MobilePlayerGrid
            players={otherTeamPlayers}
            onPlayerSelect={handlePlayerSelect}
            variant="secondary"
          />
        </div>
      )}
    </div>
  );
};

export default PlayerSelectionStep;
