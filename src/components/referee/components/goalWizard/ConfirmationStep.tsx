
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { BaseStepProps } from "./types";

interface ConfirmationStepProps extends Pick<BaseStepProps, 'selectedFixtureData' | 'wizardData'> {
  matchTime: number;
  formatTime: (seconds: number) => string;
  onConfirm: () => void;
}

const ConfirmationStep = ({ 
  selectedFixtureData, 
  wizardData, 
  matchTime, 
  formatTime, 
  onConfirm 
}: ConfirmationStepProps) => {
  const { selectedPlayer, selectedTeam, isOwnGoal, assistPlayer } = wizardData;

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  if (!selectedTeam || !selectedPlayer) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Confirm Goal Entry</h3>
      <div className="bg-muted p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Goal Scorer:</span>
          <span>{selectedPlayer.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Team Scored For:</span>
          <span>{getTeamName(selectedTeam)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Time:</span>
          <span>{formatTime(matchTime)}</span>
        </div>
        {isOwnGoal && (
          <Badge variant="destructive" className="w-full justify-center">
            Own Goal
          </Badge>
        )}
        {assistPlayer && (
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-medium">Assist:</span>
            <span>{assistPlayer.name}</span>
          </div>
        )}
      </div>
      <Button onClick={onConfirm} className="w-full" size="lg">
        <Check className="h-4 w-4 mr-2" />
        Confirm Goal Entry
      </Button>
    </div>
  );
};

export default ConfirmationStep;
