
import EnhancedCoordinationTab from "../coordination/EnhancedCoordinationTab";
import CoordinationFallback from "../coordination/CoordinationFallback";
import { WorkflowModeConfig } from "../../workflows/types";

interface CoordinationTabProps {
  selectedFixtureData: any;
  workflowConfig: WorkflowModeConfig;
}

const CoordinationTab = ({ selectedFixtureData, workflowConfig }: CoordinationTabProps) => {
  // If no workflow config exists, show fallback
  if (!workflowConfig) {
    return (
      <div className="space-y-6">
        <CoordinationFallback
          selectedFixtureData={selectedFixtureData}
          onSetupWorkflow={() => {
            console.log('Setup workflow clicked - this could navigate back to workflow setup');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedCoordinationTab
        selectedFixtureData={selectedFixtureData}
      />
    </div>
  );
};

export default CoordinationTab;
