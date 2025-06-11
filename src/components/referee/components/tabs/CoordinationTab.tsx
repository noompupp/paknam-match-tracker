
import EnhancedRefereeCoordination from "../EnhancedRefereeCoordination";

interface CoordinationTabProps {
  selectedFixtureData: any;
  workflowConfig: {
    mode: 'two_referees' | 'multi_referee';
    fixtureId: number;
    userAssignments: any[];
    allAssignments: any[];
  };
}

const CoordinationTab = ({ selectedFixtureData, workflowConfig }: CoordinationTabProps) => {
  return (
    <div className="space-y-6">
      <EnhancedRefereeCoordination
        selectedFixtureData={selectedFixtureData}
        workflowConfig={workflowConfig}
      />
    </div>
  );
};

export default CoordinationTab;
