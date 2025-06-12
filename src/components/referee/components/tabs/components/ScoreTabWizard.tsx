
import React from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import GoalEntryWizard from "../../GoalEntryWizard";
import { useMatchStore } from "@/stores/useMatchStore";

interface ScoreTabWizardProps {
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
  formatTime: (seconds: number) => string;
  onGoalAssigned: (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => void;
  onCancel: () => void;
}

const ScoreTabWizard = ({
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  matchTime,
  formatTime,
  onGoalAssigned,
  onCancel
}: ScoreTabWizardProps) => {
  const homeTeamName = selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = selectedFixtureData?.away_team?.name || 'Away Team';
  const homeTeamId = selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id;
  const awayTeamId = selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id;

  const { addGoal, addAssist, addEvent } = useMatchStore();

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
    isEdit?: boolean;
    originalGoalId?: string | number;
  }) => {
    console.log('🎯 ScoreTabWizard: Goal assigned via wizard:', goalData);
    
    const teamId = goalData.team === 'home' ? homeTeamId : awayTeamId;
    const teamName = goalData.team === 'home' ? homeTeamName : awayTeamName;

    // Add the goal to the store
    addGoal({
      playerId: goalData.player.id,
      playerName: goalData.player.name,
      team: goalData.team,
      teamId,
      teamName,
      type: 'goal',
      time: matchTime,
      isOwnGoal: goalData.isOwnGoal
    });

    // Add assist if provided and not an own goal
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      addAssist({
        playerId: goalData.assistPlayer.id,
        playerName: goalData.assistPlayer.name,
        team: goalData.team,
        teamId,
        teamName,
        type: 'assist',
        time: matchTime
      });
    }

    addEvent('Goal Assignment', `Goal assigned to ${goalData.player.name}`, matchTime);
    
    // Call the parent handler
    onGoalAssigned(goalData);
  };

  return (
    <div className="space-y-6">
      <GoalEntryWizard
        selectedFixtureData={selectedFixtureData}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        matchTime={matchTime}
        formatTime={formatTime}
        onGoalAssigned={handleWizardGoalAssigned}
        onCancel={onCancel}
      />
    </div>
  );
};

export default ScoreTabWizard;
