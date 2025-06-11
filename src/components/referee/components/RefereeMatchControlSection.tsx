
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { AlertCircle, Save, RotateCcw, Clock, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <Card className="referee-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Match Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Current Score:</span>
                <Badge variant="outline" className="font-mono">
                  {homeScore}-{awayScore}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Save attempts:</span>
                <Badge variant="secondary">{saveAttempts}</Badge>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <div className="referee-status-warning rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved Changes ({totalUnsavedItems})
                </div>
                <div className="text-xs space-y-1">
                  {unsavedItemsCount.goals > 0 && (
                    <div>• {unsavedItemsCount.goals} goal{unsavedItemsCount.goals !== 1 ? 's' : ''}</div>
                  )}
                  {unsavedItemsCount.cards > 0 && (
                    <div>• {unsavedItemsCount.cards} card{unsavedItemsCount.cards !== 1 ? 's' : ''}</div>
                  )}
                  {unsavedItemsCount.playerTimes > 0 && (
                    <div>• {unsavedItemsCount.playerTimes} player time{unsavedItemsCount.playerTimes !== 1 ? 's' : ''}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`flex-1 referee-button-primary ${
                !hasUnsavedChanges ? 'referee-status-inactive' : ''
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Match Data
              {hasUnsavedChanges && ` (${totalUnsavedItems})`}
            </Button>
            <Button
              onClick={handleReset}
              variant="destructive"
              className="flex-1 sm:flex-initial"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Match
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefereeMatchControlSection;
