
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { BaseStepProps } from "./types";
import { ComponentPlayer } from "../../hooks/useRefereeState";

interface AssistStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'homeTeamPlayers' | 'awayTeamPlayers' | 'wizardData' | 'onDataChange' | 'onNext'> {}

const AssistStep = ({ 
  selectedFixtureData, 
  homeTeamPlayers, 
  awayTeamPlayers, 
  wizardData, 
  onDataChange, 
  onNext 
}: AssistStepProps) => {
  const { selectedTeam, selectedPlayer, needsAssist } = wizardData;

  const getTeamPlayers = () => {
    if (selectedTeam === 'home') return homeTeamPlayers || [];
    if (selectedTeam === 'away') return awayTeamPlayers || [];
    return [];
  };

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  const handleAssistDecision = (hasAssist: boolean) => {
    onDataChange({ needsAssist: hasAssist });
    if (!hasAssist) {
      onNext();
    }
  };

  const handleAssistPlayerSelect = (player: ComponentPlayer) => {
    onDataChange({ assistPlayer: player });
    onNext();
  };

  if (!selectedTeam) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Was there an assist?</h3>
      
      {!needsAssist ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleAssistDecision(true)} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Yes, add assist
            </Button>
            <Button onClick={() => handleAssistDecision(false)} variant="outline">
              No assist
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="font-medium">Select assist player from {getTeamName(selectedTeam)}</h4>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {getTeamPlayers()
              .filter(player => player.id !== selectedPlayer?.id)
              .map((player) => (
              <Button
                key={`assist-${player.id}`}
                onClick={() => handleAssistPlayerSelect(player)}
                variant="outline"
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                    {player.number || '?'}
                  </div>
                  <span>{player.name}</span>
                </div>
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => onDataChange({ needsAssist: false })} 
            variant="ghost" 
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to assist decision
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssistStep;
