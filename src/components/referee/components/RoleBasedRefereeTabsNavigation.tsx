
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, FileText, AlertTriangle, Lock } from "lucide-react";
import { useRoleBasedAccess } from "../hooks/useRoleBasedAccess";

interface RoleBasedRefereeTabsNavigationProps {
  selectedFixtureData: any;
}

const RoleBasedRefereeTabsNavigation = ({ selectedFixtureData }: RoleBasedRefereeTabsNavigationProps) => {
  const {
    canAccessTimerControls,
    canAccessScoreManagement,
    canAccessCardManagement,
    isLoading
  } = useRoleBasedAccess(selectedFixtureData?.id);

  if (isLoading) {
    return (
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="timer-tracking" disabled className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Timer</span>
        </TabsTrigger>
        <TabsTrigger value="score" disabled className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span className="hidden sm:inline">Score</span>
        </TabsTrigger>
        <TabsTrigger value="cards" disabled className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Cards</span>
        </TabsTrigger>
        <TabsTrigger value="summary" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Summary</span>
        </TabsTrigger>
      </TabsList>
    );
  }

  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger
        value="timer-tracking"
        disabled={!canAccessTimerControls}
        className="flex items-center gap-2"
        title={!canAccessTimerControls ? "Requires time tracking role access" : ""}
      >
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {!canAccessTimerControls && <Lock className="h-3 w-3" />}
        </div>
        <span className="hidden sm:inline">Timer</span>
      </TabsTrigger>
      <TabsTrigger
        value="score"
        disabled={!canAccessScoreManagement}
        className="flex items-center gap-2"
        title={!canAccessScoreManagement ? "Requires score/goals role access" : ""}
      >
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          {!canAccessScoreManagement && <Lock className="h-3 w-3" />}
        </div>
        <span className="hidden sm:inline">Score</span>
      </TabsTrigger>
      <TabsTrigger
        value="cards"
        disabled={!canAccessCardManagement}
        className="flex items-center gap-2"
        title={!canAccessCardManagement ? "Requires cards/discipline role access" : ""}
      >
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" />
          {!canAccessCardManagement && <Lock className="h-3 w-3" />}
        </div>
        <span className="hidden sm:inline">Cards</span>
      </TabsTrigger>
      <TabsTrigger value="summary" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Summary</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default RoleBasedRefereeTabsNavigation;
