
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { BaseStepProps } from "./types";

interface GoalTypeStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'wizardData' | 'onNext'> {}

const GoalTypeStep = ({ selectedFixtureData, wizardData, onNext }: GoalTypeStepProps) => {
  const { selectedPlayer, selectedTeam, isOwnGoal } = wizardData;

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  if (!selectedPlayer || !selectedTeam) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Confirm Goal Details</h3>
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          <strong>Scorer:</strong> {selectedPlayer.name}
        </div>
        <div className="flex items-center gap-2">
          <strong>Team:</strong> {selectedPlayer.team}
        </div>
        <div className="flex items-center gap-2">
          <strong>Goal for:</strong> {getTeamName(selectedTeam)}
        </div>
        {isOwnGoal && (
          <Badge variant="destructive" className="mt-2">
            Own Goal
          </Badge>
        )}
      </div>
      <Button onClick={onNext} className="w-full">
        {isOwnGoal ? 'Confirm Own Goal' : 'Continue to Assist'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default GoalTypeStep;
