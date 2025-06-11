
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Trophy, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  referee_id: string;
  assigned_role: 'score_goals' | 'cards_discipline' | 'time_tracking' | 'coordination';
  status: 'pending' | 'in_progress' | 'completed';
  completion_timestamp: string | null;
  notes: string | null;
}

interface CoordinationData {
  coordination_id: string;
  fixture_id: number;
  status: string;
  assignments: Assignment[];
  completion_summary: any;
  ready_for_review: boolean;
}

interface MultiRefereeCoordinationProps {
  selectedFixtureData: any;
  onRoleAssigned?: (role: string) => void;
}

const ROLE_LABELS = {
  score_goals: 'Score & Goals',
  cards_discipline: 'Cards & Discipline',
  time_tracking: 'Time Tracking',
  coordination: 'Match Coordination'
};

const ROLE_ICONS = {
  score_goals: Trophy,
  cards_discipline: AlertCircle,
  time_tracking: Clock,
  coordination: Users
};

const MultiRefereeCoordination = ({ 
  selectedFixtureData, 
  onRoleAssigned 
}: MultiRefereeCoordinationProps) => {
  const [coordinationData, setCoordinationData] = useState<CoordinationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  // Load coordination status
  useEffect(() => {
    if (selectedFixtureData?.id) {
      loadCoordinationStatus();
    }
  }, [selectedFixtureData?.id]);

  const loadCoordinationStatus = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_match_coordination_status', {
        p_fixture_id: selectedFixtureData.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setCoordinationData(data[0]);
        
        // Check if current user has an assignment
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          const userAssignment = data[0].assignments.find(
            (a: Assignment) => a.referee_id === user.data.user?.id
          );
          if (userAssignment) {
            setCurrentUserRole(userAssignment.assigned_role);
          }
        }
      }
    } catch (error) {
      console.error('Error loading coordination status:', error);
      toast({
        title: "Error",
        description: "Failed to load coordination status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCoordination = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);

      // Create match coordination
      const { data: coordination, error: coordError } = await supabase
        .from('match_coordination')
        .insert({
          fixture_id: selectedFixtureData.id,
          coordinator_referee_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (coordError) throw coordError;

      // Create initial assignments (will be assigned to referees later)
      const roles = ['score_goals', 'cards_discipline', 'time_tracking', 'coordination'];
      const assignments = roles.map(role => ({
        match_coordination_id: coordination.id,
        assigned_role: role,
        referee_id: (await supabase.auth.getUser()).data.user?.id // Temporary, will be reassigned
      }));

      const { error: assignError } = await supabase
        .from('referee_assignments')
        .insert(assignments);

      if (assignError) throw assignError;

      toast({
        title: "Success",
        description: "Match coordination initialized successfully",
      });

      await loadCoordinationStatus();
    } catch (error) {
      console.error('Error initializing coordination:', error);
      toast({
        title: "Error",
        description: "Failed to initialize coordination",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignRole = async (role: string) => {
    if (!coordinationData) return;

    try {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Update assignment with current user
      const { error } = await supabase
        .from('referee_assignments')
        .update({
          referee_id: user.data.user.id,
          status: 'in_progress'
        })
        .eq('match_coordination_id', coordinationData.coordination_id)
        .eq('assigned_role', role);

      if (error) throw error;

      // Log event
      await supabase.from('coordination_events').insert({
        match_coordination_id: coordinationData.coordination_id,
        event_type: 'task_started',
        referee_id: user.data.user.id,
        event_data: { assigned_role: role }
      });

      setCurrentUserRole(role);
      
      if (onRoleAssigned) {
        onRoleAssigned(role);
      }

      toast({
        title: "Success",
        description: `You've been assigned to ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]}`,
      });

      await loadCoordinationStatus();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async () => {
    if (!coordinationData || !currentUserRole) return;

    try {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Update assignment as completed
      const { error } = await supabase
        .from('referee_assignments')
        .update({
          status: 'completed',
          completion_timestamp: new Date().toISOString()
        })
        .eq('match_coordination_id', coordinationData.coordination_id)
        .eq('referee_id', user.data.user.id);

      if (error) throw error;

      // Log completion event
      await supabase.from('coordination_events').insert({
        match_coordination_id: coordinationData.coordination_id,
        event_type: 'task_completed',
        referee_id: user.data.user.id,
        event_data: { completed_role: currentUserRole }
      });

      toast({
        title: "Success",
        description: `${ROLE_LABELS[currentUserRole as keyof typeof ROLE_LABELS]} task completed`,
      });

      await loadCoordinationStatus();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeMatch = async () => {
    if (!coordinationData) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase.rpc('finalize_match_coordination', {
        p_coordination_id: coordinationData.coordination_id,
        p_final_review_data: {
          finalized_by: (await supabase.auth.getUser()).data.user?.id,
          finalized_at: new Date().toISOString()
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Match has been finalized successfully",
        });
        await loadCoordinationStatus();
      } else {
        throw new Error(data.error || 'Failed to finalize match');
      }
    } catch (error) {
      console.error('Error finalizing match:', error);
      toast({
        title: "Error",
        description: "Failed to finalize match",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const completedTasks = coordinationData?.assignments.filter(a => a.status === 'completed').length || 0;
  const totalTasks = coordinationData?.assignments.length || 4;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Match Selected</h3>
            <p className="text-muted-foreground">Select a fixture to manage multi-referee coordination</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Multi-Referee Coordination
          {coordinationData?.status === 'completed' && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Finalized
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedFixtureData.home_team?.name} vs {selectedFixtureData.away_team?.name}
          </p>
          {coordinationData && (
            <Badge variant="outline">
              {completedTasks}/{totalTasks} Tasks Complete
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!coordinationData ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Initialize multi-referee coordination for this match</p>
            <Button 
              onClick={initializeCoordination} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Initializing...' : 'Initialize Coordination'}
            </Button>
          </div>
        ) : (
          <>
            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>

            {/* Role Assignments */}
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
                          onClick={() => assignRole(role)}
                          disabled={isLoading}
                        >
                          Assign to Me
                        </Button>
                      )}
                      {isCurrentUserRole && assignment?.status === 'in_progress' && (
                        <Button 
                          size="sm"
                          onClick={completeTask}
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

            {/* Current User Role */}
            {currentUserRole && (
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Your Assignment</Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {ROLE_LABELS[currentUserRole as keyof typeof ROLE_LABELS]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You are responsible for this aspect of the match
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Finalize Match Button */}
            {coordinationData.ready_for_review && coordinationData.status !== 'completed' && (
              <div className="pt-4 border-t">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/10 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Ready for Finalization</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-500 mb-3">
                    All referee tasks have been completed. You can now finalize the match.
                  </p>
                  <Button 
                    onClick={finalizeMatch}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Finalizing...' : 'Finalize Match'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiRefereeCoordination;
