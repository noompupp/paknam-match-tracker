
import { Button } from "@/components/ui/button";
import { BaseStepProps } from "./types";
import { useTranslation } from "@/hooks/useTranslation";

interface TeamSelectionStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'onDataChange' | 'onNext'> {}

const TeamSelectionStep = ({ selectedFixtureData, onDataChange, onNext }: TeamSelectionStepProps) => {
  const { t } = useTranslation();
  
  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || t('referee.homeTeam', 'Home Team');
    return selectedFixtureData?.away_team?.name || t('referee.awayTeam', 'Away Team');
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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          {t('wizard.whichTeamScored', 'Which team scored?')}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <Button
          onClick={() => handleTeamSelect('home')}
          variant="outline"
          className="h-12 sm:h-16 text-sm sm:text-lg font-medium touch-manipulation"
        >
          <span className="truncate">{getTeamName('home')}</span>
        </Button>
        <Button
          onClick={() => handleTeamSelect('away')}
          variant="outline"
          className="h-12 sm:h-16 text-sm sm:text-lg font-medium touch-manipulation"
        >
          <span className="truncate">{getTeamName('away')}</span>
        </Button>
      </div>
    </div>
  );
};

export default TeamSelectionStep;
