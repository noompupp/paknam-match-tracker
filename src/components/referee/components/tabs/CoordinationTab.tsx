
import EnhancedRefereeCoordination from "../EnhancedRefereeCoordination";
import { WorkflowModeConfig } from "../../workflows/types";

interface CoordinationTabProps {
  selectedFixtureData: any;
  workflowConfig: WorkflowModeConfig;
}

const CoordinationTab = ({ selectedFixtureData, workflowConfig }: CoordinationTabProps) => {
  // Convert WorkflowModeConfig to the format expected by EnhancedRefereeCoordination
  const coordinationConfig = {
    mode: workflowConfig.mode,
    fixtureId: workflowConfig.fixtureId,
    userAssignments: workflowConfig.userAssignments,
    allAssignments: workflowConfig.allAssignments
  };

  return (
    <div className="space-y-6">
      <EnhancedRefereeCoordination
        selectedFixtureData={selectedFixtureData}
        workflowConfig={coordinationConfig}
      />
    </div>
  );
};

export default CoordinationTab;
