
import React from 'react';
import MultiRefereeCoordination from '../MultiRefereeCoordination';

interface CoordinationTabProps {
  selectedFixtureData: any;
  onRoleAssigned?: (role: string) => void;
}

const CoordinationTab = ({ 
  selectedFixtureData, 
  onRoleAssigned 
}: CoordinationTabProps) => {
  return (
    <div className="space-y-6">
      <MultiRefereeCoordination 
        selectedFixtureData={selectedFixtureData}
        onRoleAssigned={onRoleAssigned}
      />
    </div>
  );
};

export default CoordinationTab;
