
import { Card, CardContent } from "@/components/ui/card";
import SevenASideValidationPanel from "../SevenASideValidationPanel";
import { PlayerTime } from "@/types/playerTime";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { usePlayerTimeTrackerState, UsePlayerTimeTrackerStateProps } from "./usePlayerTimeTrackerState";
import PlayerTimeTrackerAlerts from "./PlayerTimeTrackerAlerts";
import PlayerTimeTrackerActions from "./PlayerTimeTrackerActions";
import PlayerTimeTrackerContent from "./PlayerTimeTrackerContent";

interface EnhancedPlayerTimeTrackerProps extends UsePlayerTimeTrackerStateProps {}

const EnhancedPlayerTimeTracker = (props: EnhancedPlayerTimeTrackerProps) => {
  const state = usePlayerTimeTrackerState(props);

  console.log('🎯 EnhancedPlayerTimeTracker Debug (Fixed Integration):', {
    propsTrackedCount: props.trackedPlayers.length,
    stateTrackedCount: state.trackedPlayers.length,
    activeCount: state.playerCountValidation.activeCount,
    isValid: state.playerCountValidation.isValid,
    teamLocked: state.teamLockValidation.isLocked,
    lockedTeam: state.teamLockValidation.lockedTeam,
    pendingSubstitution: state.substitutionManager.pendingSubstitution,
    substitutionType: state.substitutionManager.isSubOutInitiated ? 'modal' : 'streamlined',
    showInitialSelection: state.showInitialSelection,
    isMatchStarted: state.isMatchStarted,
    homePlayersCount: state.homeTeamPlayers?.length || 0,
    awayPlayersCount: state.awayTeamPlayers?.length || 0
  });

  return (
    <div className="space-y-4">
      {/* Enhanced 7-a-Side Validation Panel */}
      <SevenASideValidationPanel
        trackedPlayers={state.trackedPlayers}
        allPlayers={state.allPlayers}
        matchTime={state.matchTime}
        formatTime={state.formatTime}
      />

      {/* Alerts */}
      <PlayerTimeTrackerAlerts
        playerCountValidation={state.playerCountValidation}
        teamLockValidation={state.teamLockValidation}
        substitutionManager={state.substitutionManager}
        t={state.t}
      />

      {/* Quick Actions */}
      <PlayerTimeTrackerActions
        isMatchStarted={state.isMatchStarted}
        setShowInitialSelection={state.setShowInitialSelection}
        selectedFixtureData={state.selectedFixtureData}
        t={state.t}
      />

      {/* Main Content */}
      <PlayerTimeTrackerContent
        trackedPlayers={state.trackedPlayers}
        allPlayers={state.allPlayers}
        formatTime={state.formatTime}
        onTogglePlayerTime={state.handleTogglePlayerTime}
        matchTime={state.matchTime}
        substitutionManager={{
          ...state.substitutionManager,
          handleAddPlayer: state.handleAddPlayer,
          handleUndoSubOut: state.handleUndoSubOut,
        }}
        showInitialSelection={state.showInitialSelection}
        setShowInitialSelection={state.setShowInitialSelection}
        homeTeamPlayers={state.homeTeamPlayers}
        awayTeamPlayers={state.awayTeamPlayers}
        handleStartMatch={state.handleStartMatch}
        selectedFixtureData={state.selectedFixtureData}
        isMatchStarted={state.isMatchStarted}
        t={state.t}
      />
    </div>
  );
};

export default EnhancedPlayerTimeTracker;
