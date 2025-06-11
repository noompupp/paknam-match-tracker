
import React from 'react';
import MultiRefereeCoordination from '../MultiRefereeCoordination';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck } from "lucide-react";
import { WorkflowModeConfig } from '../../workflows/types';
import { WORKFLOW_MODES, WORKFLOW_MODE_LABELS } from '../../workflows/constants';

interface CoordinationTabProps {
  selectedFixtureData: any;
  workflowConfig: WorkflowModeConfig;
  onRoleAssigned?: (role: string) => void;
}

const CoordinationTab = ({ 
  selectedFixtureData, 
  workflowConfig,
  onRoleAssigned 
}: CoordinationTabProps) => {
  // Handle Two Referees Mode - show simplified coordination
  if (workflowConfig.mode === WORKFLOW_MODES.TWO_REFEREES) {
    const config = workflowConfig.twoRefereesConfig;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {WORKFLOW_MODE_LABELS[WORKFLOW_MODES.TWO_REFEREES]} - Active
            <Badge variant="default">Configured</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {config && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {selectedFixtureData?.home_team?.name || 'Home Team'} Referee
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {config.homeReferee.name}
                      </div>
                      <div>
                        <span className="font-medium">Responsibilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {config.homeReferee.responsibilities.map((resp) => (
                            <Badge key={resp} variant="outline" className="text-xs">
                              {resp.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {selectedFixtureData?.away_team?.name || 'Away Team'} Referee
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {config.awayReferee.name}
                      </div>
                      <div>
                        <span className="font-medium">Responsibilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {config.awayReferee.responsibilities.map((resp) => (
                            <Badge key={resp} variant="outline" className="text-xs">
                              {resp.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Team-based referee coordination is active for this match. 
              Each referee is responsible for their assigned team and specific match responsibilities.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle Multi-Referee Mode - show full coordination system
  if (workflowConfig.mode === WORKFLOW_MODES.MULTI_REFEREE) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5" />
          <span className="font-semibold">{WORKFLOW_MODE_LABELS[WORKFLOW_MODES.MULTI_REFEREE]} - Active</span>
          <Badge variant="default">Configured</Badge>
        </div>
        
        <MultiRefereeCoordination 
          selectedFixtureData={selectedFixtureData}
          workflowConfig={workflowConfig}
          onRoleAssigned={onRoleAssigned}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Unknown Workflow Mode</h3>
        <p className="text-muted-foreground">
          Please reconfigure the workflow mode for this match.
        </p>
      </CardContent>
    </Card>
  );
};

export default CoordinationTab;
