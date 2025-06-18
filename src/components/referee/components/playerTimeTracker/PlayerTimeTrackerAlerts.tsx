
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, Users } from "lucide-react";

interface PlayerTimeTrackerAlertsProps {
  playerCountValidation: any;
  teamLockValidation: any;
  substitutionManager: any;
  t: any;
}

const PlayerTimeTrackerAlerts = ({
  playerCountValidation,
  teamLockValidation,
  substitutionManager,
  t
}: PlayerTimeTrackerAlertsProps) => {
  
  // Show validation alerts
  if (!playerCountValidation.isValid) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {playerCountValidation.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Show team lock info
  if (teamLockValidation.isLocked && teamLockValidation.lockedTeam) {
    return (
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          {t('referee.teamLocked', 'Team locked to: {team}').replace('{team}', teamLockValidation.lockedTeam)}
        </AlertDescription>
      </Alert>
    );
  }

  // Show substitution alerts
  if (substitutionManager.pendingSubstitution) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('referee.pendingSubstitution', 'Substitution in progress...')}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PlayerTimeTrackerAlerts;
