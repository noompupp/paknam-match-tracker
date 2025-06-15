
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, AlertCircle, AlertTriangle } from "lucide-react";
import { useMatchStore } from "@/stores/useMatchStore";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import PulseDotBadge from "@/components/ui/PulseDotBadge";

// Displayed props _ignore_ manualScore. Always show match store scores. Optionally, show DB sync warning.

interface ScoreDisplayProps {
  selectedFixtureData: any;
  showLocal?: boolean;
}

const ScoreDisplay = ({
  selectedFixtureData,
  showLocal = false
}: ScoreDisplayProps) => {
  const { homeScore, awayScore } = useMatchStore();

  // Unsaved changes indicator from batch save manager
  const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id || "";
  const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id || "";
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';
  const batchSaveManager = useGlobalBatchSaveManager({
    homeTeamData: { id: homeTeamId, name: homeTeamName },
    awayTeamData: { id: awayTeamId, name: awayTeamName }
  });

  const hasUnsaved =
    batchSaveManager.hasUnsavedChanges &&
    (batchSaveManager.unsavedItemsCount.goals > 0 ||
      batchSaveManager.unsavedItemsCount.cards > 0 ||
      batchSaveManager.unsavedItemsCount.playerTimes > 0);

  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-muted-foreground mr-2" />
          <span className="text-muted-foreground">No fixture selected</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Match Score
        </CardTitle>

        {hasUnsaved && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="destructive" className="flex items-center gap-1 text-xs text-red-800 bg-red-50 ring-2 ring-red-300 animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />
              Unsaved
              <PulseDotBadge className="ml-1" />
              Changes
            </Badge>
            <span className="text-red-600 text-xs font-semibold">Save to database soon!</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                {selectedFixtureData.home_team?.name || 'Home'}
              </h3>
              <div className="text-4xl font-bold text-blue-600">
                {homeScore}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                {selectedFixtureData.away_team?.name || 'Away'}
              </h3>
              <div className="text-4xl font-bold text-red-600">
                {awayScore}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreDisplay;
