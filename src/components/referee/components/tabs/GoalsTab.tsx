
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import ScoreDisplay from '../ScoreDisplay';
import GoalEntryWizard from '../GoalEntryWizard';
import { ComponentPlayer } from '../../hooks/useRefereeState';

interface GoalsTabProps {
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
  formatTime: (seconds: number) => string;
  onGoalAssigned: (goalData: any) => void;
  homeScore: number;
  awayScore: number;
  showGoalWizard: boolean;
  onCancelGoalWizard: () => void;
}

const GoalsTab = ({
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  matchTime,
  formatTime,
  onGoalAssigned,
  homeScore,
  awayScore,
  showGoalWizard,
  onCancelGoalWizard
}: GoalsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Database-driven scoreboard */}
      <ScoreDisplay 
        selectedFixtureData={selectedFixtureData}
        localHomeScore={homeScore}
        localAwayScore={awayScore}
        showLocal={true}
      />

      {showGoalWizard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalEntryWizard
              selectedFixtureData={selectedFixtureData}
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              matchTime={matchTime}
              formatTime={formatTime}
              onGoalAssigned={onGoalAssigned}
              onCancel={onCancelGoalWizard}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsTab;
