
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { AlertCircle, Save, RotateCcw, Clock } from "lucide-react";

interface RefereeMatchControlSectionProps {
  selectedFixtureData: any;
  saveAttempts: number;
  onSaveMatch: () => void;
  onResetMatch: () => void;
}

const RefereeMatchControlSection = ({
  selectedFixtureData,
  saveAttempts,
  onSaveMatch,
  onResetMatch
}: RefereeMatchControlSectionProps) => {
  // Get global match state
  const {
    homeScore,
    awayScore,
    hasUnsavedChanges,
    resetState,
    getUnsavedItemsCount
  } = useMatchStore();

  // Get batch save functionality
  const { batchSave, unsavedItemsCount } = useGlobalBatchSaveManager({
    homeTeamData: {
      id: selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id,
      name: selectedFixtureData?.home_team?.name || 'Home Team'
    },
    awayTeamData: {
      id: selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id,
      name: selectedFixtureData?.away_team?.name || 'Away Team'
    }
  });

  if (!selectedFixtureData) return null;

  const handleSave = async () => {
    await batchSave();
    onSaveMatch(); // Keep backward compatibility
  };

  const handleReset = () => {
    resetState();
    onResetMatch();
  };

  const totalUnsavedItems = Object.values(unsavedItemsCount).reduce((total, count) => total + count, 0);

  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            Match Control
            {hasUnsavedChanges && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {totalUnsavedItems} unsaved
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Save attempts: {saveAttempts} | Global Score: {homeScore}-{awayScore}
          </p>
          {hasUnsavedChanges && (
            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {unsavedItemsCount.goals} goals, {unsavedItemsCount.cards} cards, {unsavedItemsCount.playerTimes} player times pending
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded hover:opacity-90 transition-colors ${
              hasUnsavedChanges 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Save Match Data
            {hasUnsavedChanges && ` (${totalUnsavedItems})`}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            <RotateCcw className="h-4 w-4 mr-2 inline" />
            Reset Match
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefereeMatchControlSection;
