
import EnhancedCoordinationTab from "./EnhancedCoordinationTab";
import { WorkflowModeConfig } from "../../workflows/types";

interface CoordinationTabProps {
  selectedFixtureData: any;
  workflowConfig: WorkflowModeConfig;
}

const CoordinationTab = ({ selectedFixtureData, workflowConfig }: CoordinationTabProps) => {
  return (
    <div className="space-y-6">
      <EnhancedCoordinationTab
        selectedFixtureData={selectedFixtureData}
      />
    </div>
  );
};

export default CoordinationTab;
