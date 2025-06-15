
import { Target, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RefereeButton from "../../../shared/RefereeButton";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          {t("referee.recordGoalTitle")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("referee.recordGoalDesc")}
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
          {t("referee.openGoalEntry")}
        </RefereeButton>
        
        <div className="text-center text-sm text-muted-foreground">
          {t("referee.recordGoalsFor")
            .replace("{home}", homeTeamName)
            .replace("{away}", awayTeamName)}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedGoalRecording;
