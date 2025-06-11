
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { refereeAssignmentService, FixtureAssignment } from '@/services/referee/assignmentService';

interface EnhancedRefereeCoordinationProps {
  selectedFixtureData: any;
  workflowConfig: {
    mode: 'two_referees' | 'multi_referee';
    fixtureId: number;
    userAssignments: any[];
    allAssignments: any[];
  };
}

const ROLE_LABELS = {
  home_team: 'Home Team Referee',
  away_team: 'Away Team Referee',
  score_goals: 'Score & Goals',
  cards_discipline: 'Cards & Discipline',
  time_tracking: 'Time Tracking',
  coordination: 'Match Coordination'
};

const STATUS_COLORS = {
  assigned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
};

const EnhancedRefereeCoordination = ({ 
  selectedFixtureData, 
  workflowConfig 
}: EnhancedRefereeCoordinationProps) => {
  const [assignments, setAssignments] = useState<FixtureAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (workflowConfig?.fixtureId) {
      loadAssignments();
    }
  }, [workflowConfig?.fixtureId]);

  const loadAssignments = async () => {
    if (!workflowConfig?.fixtureId) return;

    try {
      setIsLoading(true);
      const data = await refereeAssignmentService.getAllFixtureAssignments(workflowConfig.fixtureId);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: 'assigned' | 'active' | 'completed') => {
    try {
      setIsLoading(true);
      await refereeAssignmentService.updateAssignmentStatus(assignmentId, status);
      
      toast({
        title: "Success",
        description: `Assignment status updated to ${status}`,
      });

      await loadAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalRoles = () => {
    return workflowConfig.mode === 'two_referees' ? 2 : 4;
  };

  const getCompletedCount = () => {
    return assignments.filter(a => a.status === 'completed').length;
  };

  const getActiveCount = () => {
    return assignments.filter(a => a.status === 'active').length;
  };

  const getProgressPercentage = () => {
    const total = getTotalRoles();
    const completed = getCompletedCount();
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const isAllCompleted = () => {
    return assignments.length === getTotalRoles() && getCompletedCount() === getTotalRoles();
  };

  if (isLoading && assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p>Loading coordination data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referee Coordination
          {isAllCompleted() && (
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
            {workflowConfig.mode === 'two_referees' ? 'Two Referees' : 'Multi-Referee'} Mode
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <Progress value={getProgressPercentage()} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{assignments.length} Assigned</span>
            <span>{getActiveCount()} Active</span>
            <span>{getCompletedCount()} Completed</span>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Assignment Status</h3>
          
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No assignments yet. Referees need to take their assignments.</p>
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
                    <Badge 
                      variant="secondary" 
                      className={STATUS_COLORS[assignment.status]}
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    <p>Referee ID: {assignment.referee_id.slice(0, 8)}...</p>
                    <p>Assigned: {new Date(assignment.assigned_at).toLocaleString()}</p>
                    {assignment.responsibilities.length > 0 && (
                      <p>Responsibilities: {assignment.responsibilities.join(', ')}</p>
                    )}
                  </div>

                  {assignment.status !== 'completed' && (
                    <div className="flex gap-2">
                      {assignment.status === 'assigned' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAssignmentStatus(assignment.assignment_id, 'active')}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Start Task
                        </Button>
                      )}
                      {assignment.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => updateAssignmentStatus(assignment.assignment_id, 'completed')}
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
          )}
        </div>

        {/* Match Finalization */}
        {isAllCompleted() && (
          <div className="pt-4 border-t">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/10 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">
                  All Tasks Completed
                </span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-500 mb-3">
                All referee assignments have been completed. The match coordination is ready for finalization.
              </p>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  toast({
                    title: "Match Finalized",
                    description: "All referee tasks have been completed successfully",
                  });
                }}
              >
                Finalize Match Coordination
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedRefereeCoordination;
