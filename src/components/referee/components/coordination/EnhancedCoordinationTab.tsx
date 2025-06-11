
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle, Clock, AlertCircle, Play } from "lucide-react";
import { useCoordinationManager } from "../../hooks/useCoordinationManager";
import { useRoleBasedAccess } from "../../hooks/useRoleBasedAccess";
import { ROLE_LABELS } from './constants';

interface EnhancedCoordinationTabProps {
  selectedFixtureData: any;
}

const EnhancedCoordinationTab = ({ selectedFixtureData }: EnhancedCoordinationTabProps) => {
  const { coordinationData, isLoading, completeAssignment, activateAssignment } = useCoordinationManager(selectedFixtureData?.id);
  const { canAccessCoordination } = useRoleBasedAccess(selectedFixtureData?.id);

  if (!canAccessCoordination) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coordination Access Restricted</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            You don't have permission to access coordination functionality. This feature is only available to referees assigned to coordination roles.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p>Loading coordination data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!coordinationData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Coordination Setup</h3>
          <p className="text-muted-foreground">
            No coordination setup found for this match. Please configure the workflow first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { assignments, user_assignments, completion_status } = coordinationData;
  const progressPercentage = completion_status.total_assignments > 0 
    ? (completion_status.completed_assignments / completion_status.total_assignments) * 100 
    : 0;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'secondary';
      case 'assigned': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Match Coordination
          {completion_status.completed_assignments === completion_status.total_assignments && completion_status.total_assignments > 0 && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedFixtureData.home_team?.name} vs {selectedFixtureData.away_team?.name}
          </p>
          <Badge variant="outline">
            {coordinationData.workflow_mode === 'two_referees' ? 'Two Referees' : 'Multi-Referee'} Mode
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completion_status.total_assignments} Total</span>
            <span>{completion_status.in_progress_assignments} Active</span>
            <span>{completion_status.completed_assignments} Completed</span>
          </div>
        </div>

        {/* User's Assignments */}
        {user_assignments.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Your Assignments</h3>
            <div className="space-y-3">
              {user_assignments.map(assignment => (
                <div key={assignment.assignment_id} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {ROLE_LABELS[assignment.assigned_role as keyof typeof ROLE_LABELS]}
                      </span>
                      {assignment.team_assignment && (
                        <Badge variant="outline" className="text-xs">
                          {assignment.team_assignment} team
                        </Badge>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                  
                  {assignment.completion_timestamp && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Completed: {new Date(assignment.completion_timestamp).toLocaleString()}
                    </p>
                  )}

                  {assignment.status !== 'completed' && (
                    <div className="flex gap-2 mt-3">
                      {assignment.status === 'assigned' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activateAssignment(assignment.assignment_id)}
                          disabled={isLoading}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Task
                        </Button>
                      )}
                      {assignment.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => completeAssignment(assignment.assignment_id)}
                          disabled={isLoading}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Assignments Overview */}
        <div className="space-y-4">
          <h3 className="font-semibold">All Assignments</h3>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No assignments found. Referees need to take their assignments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(assignment => (
                <div key={assignment.assignment_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {ROLE_LABELS[assignment.assigned_role as keyof typeof ROLE_LABELS]}
                      </span>
                      {assignment.team_assignment && (
                        <Badge variant="outline" className="text-xs">
                          {assignment.team_assignment} team
                        </Badge>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {assignment.referee_id && (
                      <p>Referee: {assignment.referee_id.slice(0, 8)}...</p>
                    )}
                    {assignment.assigned_at && (
                      <p>Assigned: {new Date(assignment.assigned_at).toLocaleString()}</p>
                    )}
                    {assignment.completion_timestamp && (
                      <p>Completed: {new Date(assignment.completion_timestamp).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Match Finalization */}
        {completion_status.completed_assignments === completion_status.total_assignments && completion_status.total_assignments > 0 && (
          <div className="pt-4 border-t">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/10 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">
                  All Tasks Completed
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-500">
                All referee assignments have been completed successfully. The match coordination is ready for finalization.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedCoordinationTab;
