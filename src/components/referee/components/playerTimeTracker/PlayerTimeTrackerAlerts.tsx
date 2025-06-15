
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  t,
}: PlayerTimeTrackerAlertsProps) => (
  <>
    {/* Dual-Behavior Pending Substitution Alert */}
    {substitutionManager.hasPendingSubstitution && (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              {substitutionManager.isSubOutInitiated
                ? t("referee.substitutionAlertOut").replace(
                    "{name}",
                    substitutionManager.pendingSubstitution?.outgoingPlayerName || ""
                  )
                : t("referee.substitutionAlertIn").replace(
                    "{name}",
                    substitutionManager.pendingSubstitution?.outgoingPlayerName || ""
                  )
              }
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={substitutionManager.cancelPendingSubstitution}
              className="ml-2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )}

    {/* Player Count Alert */}
    {!playerCountValidation.isValid && (
      <Alert variant={playerCountValidation.severity === 'error' ? 'destructive' : 'default'}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>{playerCountValidation.message}</span>
            <Badge variant={playerCountValidation.isValid ? 'default' : 'destructive'}>
              {t("referee.playerOnFieldBadge").replace(
                "{count}",
                `${playerCountValidation.activeCount}`
              )}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    )}

    {/* Team Lock Status */}
    {teamLockValidation.isLocked && (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>{teamLockValidation.message}</span>
            <Badge variant="outline">{t("referee.teamLockedBadge")}</Badge>
          </div>
        </AlertDescription>
      </Alert>
    )}
  </>
);

export default PlayerTimeTrackerAlerts;
