
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users2, UserCheck, Clock, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { refereeAssignmentService, RefereeAssignment, FixtureAssignment, WorkflowConfig } from '@/services/referee/assignmentService';

interface EnhancedWorkflowModeManagerProps {
  selectedFixtureData: any;
  onWorkflowConfigured: (config: any) => void;
}

const ROLE_LABELS = {
  home_team: 'Home Team Referee',
  away_team: 'Away Team Referee',
  score_goals: 'Score & Goals',
  cards_discipline: 'Cards & Discipline',
  time_tracking: 'Time Tracking',
  coordination: 'Match Coordination'
};

const ROLE_ICONS = {
  home_team: Users2,
  away_team: Users2,
  score_goals: Trophy,
  cards_discipline: AlertCircle,
  time_tracking: Clock,
  coordination: UserCheck
};

const EnhancedWorkflowModeManager = ({ 
  selectedFixtureData, 
  onWorkflowConfigured 
}: EnhancedWorkflowModeManagerProps) => {
  const [selectedMode, setSelectedMode] = useState<'two_referees' | 'multi_referee' | null>(null);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig | null>(null);
  const [userAssignments, setUserAssignments] = useState<RefereeAssignment[]>([]);
  const [allAssignments, setAllAssignments] = useState<FixtureAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedFixtureData?.id) {
      loadWorkflowData();
    }
  }, [selectedFixtureData?.id]);

  const loadWorkflowData = async () => {
    if (!selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      
      const [config, userAssgn, allAssgn] = await Promise.all([
        refereeAssignmentService.getWorkflowConfig(selectedFixtureData.id),
        refereeAssignmentService.getUserAssignments(selectedFixtureData.id),
        refereeAssignmentService.getAllFixtureAssignments(selectedFixtureData.id)
      ]);

      setWorkflowConfig(config);
      setUserAssignments(userAssgn);
      setAllAssignments(allAssgn);

      if (config) {
        setSelectedMode(config.workflow_mode);
        onWorkflowConfigured({
          mode: config.workflow_mode,
          fixtureId: selectedFixtureData.id,
          userAssignments: userAssgn,
          allAssignments: allAssgn
        });
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWorkflow = async () => {
    if (!selectedMode || !selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      
      await refereeAssignmentService.setWorkflowConfig(
        selectedFixtureData.id,
        selectedMode,
        { initialized_at: new Date().toISOString() }
      );

      toast({
        title: "Success",
        description: `${selectedMode === 'two_referees' ? 'Two Referees' : 'Multi-Referee'} workflow initialized`,
      });

      await loadWorkflowData();
    } catch (error) {
      console.error('Error initializing workflow:', error);
      toast({
        title: "Error",
        description: "Failed to initialize workflow",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignToRole = async (role: string, teamAssignment?: string) => {
    if (!selectedMode || !selectedFixtureData?.id) return;

    try {
      setIsLoading(true);
      
      const responsibilities = selectedMode === 'two_referees' 
        ? teamAssignment === 'home' 
          ? ['score_goals', 'time_tracking']
          : ['cards_discipline']
        : [role];

      await refereeAssignmentService.assignUserToRole(
        selectedFixtureData.id,
        role,
        selectedMode,
        teamAssignment,
        responsibilities
      );

      toast({
        title: "Success",
        description: `Assigned to ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]}`,
      });

      await loadWorkflowData();
    } catch (error) {
      console.error('Error assigning to role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableRoles = () => {
    if (selectedMode === 'two_referees') {
      return ['home_team', 'away_team'];
    } else {
      return ['score_goals', 'cards_discipline', 'time_tracking', 'coordination'];
    }
  };

  const isRoleAssigned = (role: string) => {
    return allAssignments.some(a => a.assigned_role === role);
  };

  const hasUserAssignment = () => {
    return userAssignments.length > 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p>Loading workflow configuration...</p>
        </CardContent>
      </Card>
    );
  }

  if (!workflowConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Initialize Referee Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Workflow Mode</Label>
            <RadioGroup value={selectedMode || ''} onValueChange={(value) => setSelectedMode(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="two_referees" id="two_referees" />
                <Label htmlFor="two_referees" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4" />
                    <span className="font-medium">Two Referees Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    One referee per team with divided responsibilities
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi_referee" id="multi_referee" />
                <Label htmlFor="multi_referee" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span className="font-medium">Multi-Referee Mode</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Four specialized referees with role-based assignments
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            onClick={initializeWorkflow}
            disabled={!selectedMode}
            className="w-full"
          >
            Initialize {selectedMode === 'two_referees' ? 'Two Referees' : 'Multi-Referee'} Workflow
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          {workflowConfig.workflow_mode === 'two_referees' ? 'Two Referees' : 'Multi-Referee'} Workflow
          <Badge variant="outline">Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasUserAssignment() && (
          <div className="space-y-4">
            <h3 className="font-semibold">Available Assignments</h3>
            <div className="grid gap-3">
              {getAvailableRoles().map(role => {
                const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS];
                const isAssigned = isRoleAssigned(role);
                
                return (
                  <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">
                        {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                      </span>
                      {isAssigned && <Badge variant="secondary">Assigned</Badge>}
                    </div>
                    <Button
                      size="sm"
                      disabled={isAssigned}
                      onClick={() => {
                        if (workflowConfig.workflow_mode === 'two_referees') {
                          const teamAssignment = role === 'home_team' ? 'home' : 'away';
                          assignToRole(role, teamAssignment);
                        } else {
                          assignToRole(role);
                        }
                      }}
                    >
                      {isAssigned ? 'Assigned' : 'Take Assignment'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasUserAssignment() && (
          <div className="space-y-4">
            <h3 className="font-semibold">Your Assignments</h3>
            <div className="space-y-2">
              {userAssignments.map(assignment => {
                const Icon = ROLE_ICONS[assignment.assigned_role as keyof typeof ROLE_ICONS];
                return (
                  <div key={assignment.assignment_id} className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">
                      {ROLE_LABELS[assignment.assigned_role as keyof typeof ROLE_LABELS]}
                    </span>
                    <Badge variant="default">{assignment.status}</Badge>
                    {assignment.team_assignment && (
                      <Badge variant="outline">{assignment.team_assignment} team</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Assignment Overview</h3>
          <div className="text-sm text-muted-foreground">
            {allAssignments.length} of {getAvailableRoles().length} roles assigned
          </div>
          <div className="space-y-2">
            {allAssignments.map(assignment => {
              const Icon = ROLE_ICONS[assignment.assigned_role as keyof typeof ROLE_ICONS];
              return (
                <div key={assignment.assignment_id} className="flex items-center gap-2 text-sm">
                  <Icon className="h-3 w-3" />
                  <span>{ROLE_LABELS[assignment.assigned_role as keyof typeof ROLE_LABELS]}</span>
                  <Badge variant="outline" className="text-xs">{assignment.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedWorkflowModeManager;
