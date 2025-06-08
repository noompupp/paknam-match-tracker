
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import RefereeCard from "../../../shared/RefereeCard";
import RefereeButton from "../../../shared/RefereeButton";
import RefereeLayoutGrid from "../../../shared/RefereeLayoutGrid";

interface MatchControlsSectionProps {
  isRunning: boolean;
  onToggleTimer: () => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
  isSaving?: boolean;
}

const MatchControlsSection = ({
  isRunning,
  onToggleTimer,
  onSaveMatch,
  onResetMatch,
  isSaving = false
}: MatchControlsSectionProps) => {
  return (
    <RefereeCard
      title="Match Controls"
      subtitle="Timer and match management"
    >
      <RefereeLayoutGrid columns={3} gap="sm">
        <RefereeButton
          onClick={onToggleTimer}
          variant={isRunning ? "destructive" : "default"}
          size="lg"
          fullWidth
          icon={isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        >
          {isRunning ? "Pause" : "Start"}
        </RefereeButton>

        <RefereeButton
          onClick={onSaveMatch}
          loading={isSaving}
          variant="outline"
          size="lg"
          fullWidth
          icon={<Save className="h-4 w-4" />}
        >
          Save
        </RefereeButton>

        <RefereeButton
          onClick={onResetMatch}
          variant="outline"
          size="lg"
          fullWidth
          icon={<RotateCcw className="h-4 w-4" />}
        >
          Reset
        </RefereeButton>
      </RefereeLayoutGrid>
    </RefereeCard>
  );
};

export default MatchControlsSection;
