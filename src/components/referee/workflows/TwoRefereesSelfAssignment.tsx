
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { refereeAssignmentService } from '@/services/referee/assignmentService';

interface TwoRefereesSelfAssignmentProps {
  selectedFixtureData: any;
  onAssignmentComplete: () => void;
}

const DEFAULT_RESPONSIBILITIES = {
  home_team: ['score_goals', 'time_tracking'],
  away_team: ['cards_discipline', 'time_tracking']
};

const ROLE_LABELS = {
  score_goals: 'Score & Goals',
  cards_discipline: 'Cards & Discipline',
  time_tracking: 'Time Tracking'
};

const TwoRefereesSelfAssignment = ({ 
  selectedFixtureData, 
  onAssignmentComplete 
}: TwoRefereesSelfAssignmentProps) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const handleSelfAssign = async (teamRole: 'home_team' | 'away_team') => {
    setIsAssigning(true);
    
    try {
      const result = await refereeAssignmentService.assignUserToRole(
        selectedFixtureData.id,
        teamRole,
        'two_referees',
        teamRole,
        DEFAULT_RESPONSIBILITIES[teamRole]
      );

      if (result.success) {
        toast({
          title: "Assignment Successful",
          description: `You have been assigned as ${teamRole === 'home_team' ? 'Home Team' : 'Away Team'} referee`,
        });
        onAssignmentComplete();
      } else {
        throw new Error(result.error || 'Assignment failed');
      }
    } catch (error) {
      console.error('Error in self-assignment:', error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : 'Failed to assign role',
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getTeamIcon = (teamRole: string) => {
    return teamRole === 'home_team' ? <Trophy className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Two Referees Mode - Self Assignment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your referee assignment for {selectedFixtureData.home_team?.name} vs {selectedFixtureData.away_team?.name}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Home Team Assignment */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {getTeamIcon('home_team')}
                {selectedFixtureData.home_team?.name} Referee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Primary Responsibilities:</h4>
                <div className="space-y-1">
                  {DEFAULT_RESPONSIBILITIES.home_team.map((responsibility) => (
                    <div key={responsibility} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {ROLE_LABELS[responsibility as keyof typeof ROLE_LABELS]}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => handleSelfAssign('home_team')}
                disabled={isAssigning}
                className="w-full"
                variant="outline"
              >
                {isAssigning ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trophy className="h-4 w-4 mr-2" />
                )}
                Assign Me to Home Team
              </Button>
            </CardContent>
          </Card>

          {/* Away Team Assignment */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {getTeamIcon('away_team')}
                {selectedFixtureData.away_team?.name} Referee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Primary Responsibilities:</h4>
                <div className="space-y-1">
                  {DEFAULT_RESPONSIBILITIES.away_team.map((responsibility) => (
                    <div key={responsibility} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {ROLE_LABELS[responsibility as keyof typeof ROLE_LABELS]}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => handleSelfAssign('away_team')}
                disabled={isAssigning}
                className="w-full"
                variant="outline"
              >
                {isAssigning ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Assign Me to Away Team
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/10 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-400 mb-1">
                Two Referees Mode
              </p>
              <p className="text-blue-700 dark:text-blue-500">
                Each referee should self-assign to their respective team using their own device. 
                Both referees can coordinate the match once assignments are complete.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoRefereesSelfAssignment;
