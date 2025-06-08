
import { Target, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RefereeButton from "../../../shared/RefereeButton";

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
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          Record Goal
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use the wizard to record goals with full details
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default SimplifiedGoalRecording;
