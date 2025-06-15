
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";
import { Fixture } from "@/types/database";
import { validateMatchData, formatMatchResult } from "@/utils/matchValidation";
import { useMatchStore } from "@/stores/useMatchStore";
import PulseDotBadge from "@/components/ui/PulseDotBadge";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import ScoreHeader from "./scoreManagement/ScoreHeader";
import ScoreTeamsPanel from "./scoreManagement/ScoreTeamsPanel";
import ScoreValidationAlerts from "./scoreManagement/ScoreValidationAlerts";
import ScoreSaveButton from "./scoreManagement/ScoreSaveButton";
import ScoreUnsavedWarning from "./scoreManagement/ScoreUnsavedWarning";
import { useScoreSaveConfig } from "./scoreManagement/useScoreSaveConfig";

interface ScoreManagementProps {
  selectedFixtureData: Fixture;
  isRunning: boolean;
  isPending: boolean;
  onAddGoal: (team: 'home' | 'away') => void;
  onRemoveGoal: (team: 'home' | 'away') => void;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  onSaveMatch: () => void;
}

const ScoreManagement = ({
  selectedFixtureData,
  isRunning,
  isPending,
  onAddGoal,
  onRemoveGoal,
  onToggleTimer,
  onResetMatch,
  onSaveMatch,
}: ScoreManagementProps) => {
  const { homeScore, awayScore } = useMatchStore();

  const isMatchComplete = selectedFixtureData.status === 'completed';
  const hasScoreChange = homeScore !== (selectedFixtureData.home_score || 0) || awayScore !== (selectedFixtureData.away_score || 0);
  const validation = validateMatchData(selectedFixtureData, homeScore, awayScore, 0);

  const {
    hasUnsavedChanges,
    unsavedItemsCount,
    batchSave,
  } = useGlobalBatchSaveManager({
    homeTeamData: { id: selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id, name: selectedFixtureData?.home_team?.name },
    awayTeamData: { id: selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id, name: selectedFixtureData?.away_team?.name },
  });

  const hasUnsaved = hasUnsavedChanges && (unsavedItemsCount.goals > 0 || unsavedItemsCount.cards > 0 || unsavedItemsCount.playerTimes > 0);

  const saveConfig = useScoreSaveConfig({
    isPending,
    isValid: validation.isValid,
    isMatchComplete,
    hasScoreChange,
    hasUnsaved,
    unsavedItemsCount
  });

  return (
    <Card className="card-shadow-lg">
      <ScoreHeader
        fixtureStatus={selectedFixtureData.status}
        homeScore={homeScore}
        awayScore={awayScore}
        dbHomeScore={selectedFixtureData.home_score || 0}
        dbAwayScore={selectedFixtureData.away_score || 0}
      />
      <CardContent className="space-y-4">
        <ScoreValidationAlerts validation={validation} />
        <ScoreTeamsPanel
          homeTeam={selectedFixtureData.home_team}
          awayTeam={selectedFixtureData.away_team}
          homeScore={homeScore}
          awayScore={awayScore}
          onAddGoal={onAddGoal}
          onRemoveGoal={onRemoveGoal}
        />
        <div className="text-center py-3 bg-primary/10 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Current Score</div>
          <div className="text-2xl font-bold">
            {formatMatchResult(
              selectedFixtureData.home_team?.name || 'Home',
              selectedFixtureData.away_team?.name || 'Away',
              homeScore,
              awayScore
            )}
          </div>
          {selectedFixtureData.home_score !== null && selectedFixtureData.away_score !== null && (
            <div className="text-sm text-muted-foreground mt-1">
              Database: {selectedFixtureData.home_score} - {selectedFixtureData.away_score}
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={onToggleTimer} className="flex-1" variant={isRunning ? "destructive" : "default"}>
            {isRunning ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? 'Stop Match' : 'Start Match'}
          </Button>
          <Button variant="outline" onClick={onResetMatch}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        <ScoreSaveButton
          onClick={() => {
            batchSave();
            onSaveMatch();
          }}
          className={saveConfig.className}
          disabled={saveConfig.disabled}
          text={saveConfig.text}
          hasUnsaved={hasUnsaved}
          icon={saveConfig.icon}
          variant={saveConfig.variant}
        />
        <ScoreUnsavedWarning hasScoreChange={hasScoreChange} />
        {isPending && (
          <div className="text-xs text-blue-600 text-center bg-blue-50 p-2 rounded border border-blue-200">
            🔄 Saving match data to database... Please wait.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreManagement;
