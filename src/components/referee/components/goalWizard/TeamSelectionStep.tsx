
import { Button } from "@/components/ui/button";
import { BaseStepProps } from "./types";

interface TeamSelectionStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'onDataChange' | 'onNext'> {}

const TeamSelectionStep = ({ selectedFixtureData, onDataChange, onNext }: TeamSelectionStepProps) => {
  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  const handleTeamSelect = (team: 'home' | 'away') => {
    onDataChange({
      selectedTeam: team,
      selectedPlayer: null,
      isOwnGoal: false
    });
    onNext();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Which team scored?</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => handleTeamSelect('home')}
          variant="outline"
          className="h-16 text-lg"
        >
          {getTeamName('home')}
        </Button>
        <Button
          onClick={() => handleTeamSelect('away')}
          variant="outline"
          className="h-16 text-lg"
        >
          {getTeamName('away')}
        </Button>
      </div>
    </div>
  );
};

export default TeamSelectionStep;
