
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface PlayerTimeTrackerActionsProps {
  isMatchStarted: boolean;
  setShowInitialSelection: (val: boolean) => void;
  selectedFixtureData: any;
  t: any;
}

const PlayerTimeTrackerActions = ({
  isMatchStarted,
  setShowInitialSelection,
  selectedFixtureData,
  t,
}: PlayerTimeTrackerActionsProps) => (
  <div className="flex gap-2">
    {!isMatchStarted ? (
      <Button
        onClick={() => setShowInitialSelection(true)}
        className="flex-1"
        disabled={!selectedFixtureData}
      >
        <Play className="h-4 w-4 mr-2" />
        {t("referee.selectStartingSquadBtn")}
      </Button>
    ) : null}
  </div>
);

export default PlayerTimeTrackerActions;
