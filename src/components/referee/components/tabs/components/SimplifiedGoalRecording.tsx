
import { Target, Plus } from "lucide-react";
import RefereeCard from "../../../shared/RefereeCard";
import RefereeButton from "../../../shared/RefereeButton";
import RefereeLayoutGrid from "../../../shared/RefereeLayoutGrid";

interface SimplifiedGoalRecordingProps {
  homeTeamName: string;
  awayTeamName: string;
  onRecordGoal: () => void;
  isDisabled?: boolean;
}

const SimplifiedGoalRecording = ({
  homeTeamName,
  awayTeamName,
  onRecordGoal,
  isDisabled = false
}: SimplifiedGoalRecordingProps) => {
  return (
    <RefereeCard
      title="Record Goal"
      icon={<Target className="h-5 w-5" />}
      subtitle="Use the wizard to record goals with full details"
    >
      <RefereeLayoutGrid columns={1} gap="md">
        <RefereeButton
          onClick={onRecordGoal}
          disabled={isDisabled}
          variant="default"
          size="lg"
          fullWidth
          icon={<Plus className="h-4 w-4" />}
        >
          Open Goal Entry Wizard
        </RefereeButton>
        
        <div className="text-center text-sm text-muted-foreground">
          Record goals for <span className="font-medium">{homeTeamName}</span> vs <span className="font-medium">{awayTeamName}</span>
        </div>
      </RefereeLayoutGrid>
    </RefereeCard>
  );
};

export default SimplifiedGoalRecording;
