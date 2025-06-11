
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLE_ICONS } from './constants';
import { CoordinationData } from './types';

interface RoleAssignmentsProps {
  coordinationData: CoordinationData;
  currentUserRole: string | null;
  onAssignRole: (role: string) => void;
  onCompleteTask: () => void;
  isLoading: boolean;
}

const RoleAssignments = ({ 
  coordinationData, 
  currentUserRole, 
  onAssignRole, 
  onCompleteTask, 
  isLoading 
}: RoleAssignmentsProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Referee Assignments</h4>
      {Object.entries(ROLE_LABELS).map(([role, label]) => {
        const assignment = coordinationData.assignments.find(a => a.assigned_role === role);
        const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS];
        const isCurrentUserRole = currentUserRole === role;
        const canAssign = !assignment?.referee_id || assignment.status === 'pending';

        return (
          <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <div>
                <p className="font-medium text-sm">{label}</p>
                {assignment?.completion_timestamp && (
                  <p className="text-xs text-muted-foreground">
                    Completed: {new Date(assignment.completion_timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(assignment?.status || 'pending')}>
                {assignment?.status || 'pending'}
              </Badge>
              {canAssign && !isCurrentUserRole && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAssignRole(role)}
                  disabled={isLoading}
                >
                  Assign to Me
                </Button>
              )}
              {isCurrentUserRole && assignment?.status === 'in_progress' && (
                <Button 
                  size="sm"
                  onClick={onCompleteTask}
                  disabled={isLoading}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleAssignments;
