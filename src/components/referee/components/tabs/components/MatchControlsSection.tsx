import { Play, Pause, RotateCcw, Save } from "lucide-react";
import RefereeCard from "../../../shared/RefereeCard";
import RefereeButton from "../../../shared/RefereeButton";
import RefereeLayoutGrid from "../../../shared/RefereeLayoutGrid";
import { Button } from "@/components/ui/button";

interface MatchControlsSectionProps {
  isRunning: boolean;
  onToggleTimer: () => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
  onFinishMatch?: () => void;
  isSaving?: boolean;
}

const MatchControlsSection = ({
  isRunning,
  onToggleTimer,
  onSaveMatch,
  onResetMatch,
  onFinishMatch,
  isSaving = false
}: MatchControlsSectionProps) => {
  return (
    <RefereeCard
      title="Match Controls"
      subtitle="Timer and match management"
    >
      <RefereeLayoutGrid columns={4} gap="sm">
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

        {/* --- Finish & Exit Button --- */}
        <Button
          onClick={onFinishMatch}
          variant="default"
          size="lg"
          className="w-full flex items-center justify-center gap-2 font-semibold ring-2 ring-primary/10"
          type="button"
        >
          <span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} fill="none" />
            </svg>
          </span>
          Finish & Exit
        </Button>

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
