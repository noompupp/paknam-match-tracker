import React from "react";
import { Tabs } from "@/components/ui/tabs";
import RoleBasedRefereeTabsNavigation from "./RoleBasedRefereeTabsNavigation";
import RefereeTabsContent from "./RefereeTabsContent";
import RefereeMatchHeader from "./RefereeMatchHeader";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeMainContentProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  goals: any[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  setSelectedGoalPlayer: (value: string) => void;
  setSelectedGoalType: (value: 'goal' | 'assist') => void;
  setSelectedGoalTeam: (value: string) => void;
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  setSelectedPlayer: (value: string) => void;
  setSelectedTeam: (value: string) => void;
  setSelectedCardType: (value: 'yellow' | 'red') => void;
  cards: any[];
  trackedPlayers: any[];
  selectedTimePlayer: string;
  selectedTimeTeam: string;
  setSelectedTimePlayer: (value: string) => void;
  setSelectedTimeTeam: (value: string) => void;
  events: any[];
  saveAttempts: any[];
  toggleTimer: () => void;
  resetTimer: () => void;
  assignGoal: (player: ComponentPlayer) => void;
  addPlayer: (player: ComponentPlayer) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
  onDataRefresh: () => void;
}

const RefereeMainContent = (props: any) => {
  // Remove all workflowConfig and coordination logic.
  const handleAddGoal = (team: 'home' | 'away') => {
    console.log('🎯 Adding goal for team:', team);
  };

  const handleRemoveGoal = (team: 'home' | 'away') => {
    console.log('🎯 Removing goal for team:', team);
  };

  const handleQuickGoal = (team: 'home' | 'away') => {
    console.log('🎯 Quick goal for team:', team);
  };

  const handleOpenGoalWizard = () => {
    console.log('🎯 Opening goal wizard');
  };

  const handleAddCard = (playerName: string, team: string, cardType: 'yellow' | 'red', time: number) => {
    console.log('🎯 Adding card:', { playerName, team, cardType, time });
  };

  const handleExportSummary = () => {
    console.log('🎯 Exporting summary');
  };

  return (
    <div className="space-y-6">
      <RefereeMatchHeader selectedFixtureData={props.selectedFixtureData} />
      <Tabs defaultValue="score" className="w-full">
        {/* Remove all workflowConfig/coordination navigation */}
        <RoleBasedRefereeTabsNavigation selectedFixtureData={props.selectedFixtureData} />
        <RefereeTabsContent
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          isRunning={props.isRunning}
          formatTime={props.formatTime}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          goals={props.goals}
          selectedGoalPlayer={props.selectedGoalPlayer}
          selectedGoalType={props.selectedGoalType}
          selectedGoalTeam={props.selectedGoalTeam}
          setSelectedGoalPlayer={props.setSelectedGoalPlayer}
          setSelectedGoalType={props.setSelectedGoalType}
          setSelectedGoalTeam={props.setSelectedGoalTeam}
          selectedPlayer={props.selectedPlayer}
          selectedTeam={props.selectedTeam}
          selectedCardType={props.selectedCardType}
          setSelectedPlayer={props.setSelectedPlayer}
          setSelectedTeam={props.setSelectedTeam}
          setSelectedCardType={props.setSelectedCardType}
          cards={props.cards}
          trackedPlayers={props.trackedPlayers}
          selectedTimePlayer={props.selectedTimePlayer}
          selectedTimeTeam={props.selectedTimeTeam}
          setSelectedTimePlayer={props.setSelectedTimePlayer}
          setSelectedTimeTeam={props.setSelectedTimeTeam}
          events={props.events}
          onAddGoal={handleAddGoal}
          onRemoveGoal={handleRemoveGoal}
          onToggleTimer={props.toggleTimer}
          onResetMatch={props.onResetMatch}
          onSaveMatch={props.onSaveMatch}
          onQuickGoal={handleQuickGoal}
          onOpenGoalWizard={handleOpenGoalWizard}
          onAssignGoal={props.assignGoal}
          onAddCard={handleAddCard}
          onAddPlayer={props.addPlayer}
          onRemovePlayer={props.removePlayer}
          onTogglePlayerTime={props.togglePlayerTime}
          onExportSummary={handleExportSummary}
        />
      </Tabs>
    </div>
  );
};

export default RefereeMainContent;
