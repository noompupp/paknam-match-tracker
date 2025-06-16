
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";
import { BaseStepProps } from "./types";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { useTranslation } from "@/hooks/useTranslation";

interface PlayerSelectionStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'homeTeamPlayers' | 'awayTeamPlayers' | 'wizardData' | 'onDataChange' | 'onNext'> {}

const PlayerSelectionStep = ({ 
  selectedFixtureData, 
  homeTeamPlayers, 
  awayTeamPlayers, 
  wizardData, 
  onDataChange, 
  onNext 
}: PlayerSelectionStepProps) => {
  const { t } = useTranslation();
  const { selectedTeam } = wizardData;

  const getTeamPlayers = () => {
    if (selectedTeam === 'home') return homeTeamPlayers || [];
    if (selectedTeam === 'away') return awayTeamPlayers || [];
    return [];
  };

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || t('referee.homeTeam', 'Home Team');
    return selectedFixtureData?.away_team?.name || t('referee.awayTeam', 'Away Team');
  };

  const handlePlayerSelect = (player: ComponentPlayer) => {
    const scoringTeamName = getTeamName(selectedTeam!);
    const playerTeamName = player.team;
    
    // Enhanced own goal detection logic
    const isOwnGoal = playerTeamName !== scoringTeamName;
    
    console.log('⚽ PlayerSelectionStep: Player selected with own goal detection:', {
      playerName: player.name,
      playerTeam: playerTeamName,
      scoringTeam: scoringTeamName,
      selectedTeam: selectedTeam,
      isOwnGoal,
      detectionReason: isOwnGoal ? 'Player team differs from scoring team' : 'Player team matches scoring team'
    });

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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          {t('wizard.selectGoalScorer', 'Select Goal Scorer')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('wizard.goalBenefits', 'Goal will benefit')}: <strong>{scoringTeamName}</strong>
        </p>
      </div>

      {/* Primary Team Players */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          {scoringTeamName} ({t('wizard.regularGoalSelected', 'Regular Goals')})
        </h4>
        <div className="grid grid-cols-1 gap-2 max-h-48 sm:max-h-60 overflow-y-auto">
          {teamPlayers.map((player) => (
            <Button
              key={`team-player-${player.id}`}
              onClick={() => handlePlayerSelect(player)}
              variant="outline"
              className="justify-start h-auto p-3 hover:bg-green-50 hover:border-green-300 touch-manipulation"
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 shrink-0">
                  {player.number || '?'}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{player.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300 shrink-0 text-xs">
                  {t('wizard.regularGoal', 'Regular')}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Other Team Players (Own Goals) */}
      {otherTeamPlayers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h4 className="font-medium text-sm text-orange-800">
              {t('wizard.playerFromOtherTeam', 'Other Team Players (Own Goals)')}
            </h4>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-orange-700">
              {t('wizard.selectingOtherTeamNotice', 'Selecting a player from another team will record this as an own goal, benefiting {teamName}.', {
                teamName: scoringTeamName
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
            {otherTeamPlayers.map((player) => (
              <Button
                key={`other-player-${player.id}`}
                onClick={() => handlePlayerSelect(player)}
                variant="ghost"
                className="justify-start h-auto p-3 hover:bg-orange-50 hover:border-orange-300 border border-transparent touch-manipulation"
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700 shrink-0">
                    {player.number || '?'}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{player.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                  </div>
                  <Badge variant="destructive" className="text-xs shrink-0">
                    {t('wizard.ownGoal', 'Own Goal')}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSelectionStep;
