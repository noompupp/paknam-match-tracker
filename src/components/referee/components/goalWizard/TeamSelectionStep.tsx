
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">
          {t('wizard.whichTeamScored', 'Which team scored?')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('wizard.selectScoringTeam', 'Select the team that scored the goal')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-md mx-auto">
        <Button
          onClick={() => handleTeamSelect('home')}
          variant="outline"
          size="lg"
          className="h-16 sm:h-20 text-base sm:text-lg font-medium touch-manipulation border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold truncate max-w-full">{getTeamName('home')}</span>
            <span className="text-xs text-muted-foreground">{t('referee.homeTeam', 'Home Team')}</span>
          </div>
        </Button>
        <Button
          onClick={() => handleTeamSelect('away')}
          variant="outline"
          size="lg"
          className="h-16 sm:h-20 text-base sm:text-lg font-medium touch-manipulation border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold truncate max-w-full">{getTeamName('away')}</span>
            <span className="text-xs text-muted-foreground">{t('referee.awayTeam', 'Away Team')}</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default TeamSelectionStep;
