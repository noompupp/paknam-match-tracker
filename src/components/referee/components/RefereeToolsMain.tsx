import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import RefereeTabsNavigation from "./RefereeTabsNavigation";
import ScoreTab from "./tabs/ScoreTab";
import UnifiedTimerTab from "./tabs/UnifiedTimerTab";
import GoalsTab from "./tabs/GoalsTab";
import CardsTab from "./tabs/CardsTab";
import SummaryTab from "./tabs/SummaryTab";
import GoalEntryWizard from "./GoalEntryWizard";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface RefereeToolsMainProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ComponentPlayer[];
  homeTeamPlayers: ComponentPlayer[];
  awayTeamPlayers: ComponentPlayer[];
  goals: any[];
  selectedGoalPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  setSelectedGoalPlayer: (value: string) => void;
  setSelectedGoalType: (value: 'goal' | 'assist') => void;
  setSelectedGoalTeam: (value: string) => void;
  cards: any[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  setSelectedPlayer: (value: string) => void;
  setSelectedTeam: (value: string) => void;
  setSelectedCardType: (value: 'yellow' | 'red') => void;
  trackedPlayers: any[];
  selectedTimePlayer: string;
  selectedTimeTeam: string;
  setSelectedTimePlayer: (value: string) => void;
  setSelectedTimeTeam: (value: string) => void;
  events: any[];
  toggleTimer: () => void;
  resetTimer: () => void;
  assignGoal: (player: ComponentPlayer, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  addPlayer: (player: ComponentPlayer) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
}

const RefereeToolsMain = (props: RefereeToolsMainProps) => {
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [goalWizardInitialTeam, setGoalWizardInitialTeam] = useState<'home' | 'away' | undefined>(undefined);

  // Handle quick goal from Score tab
  const handleQuickGoal = (team: 'home' | 'away') => {
    setGoalWizardInitialTeam(team);
    setShowGoalWizard(true);
  };

  const handleGoalWizardAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => {
    if (!props.selectedFixtureData) return;
    
    const homeTeam = { 
      id: String(props.selectedFixtureData.home_team_id || ''), 
      name: props.selectedFixtureData.home_team?.name || '' 
    };
    const awayTeam = { 
      id: String(props.selectedFixtureData.away_team_id || ''), 
      name: props.selectedFixtureData.away_team?.name || '' 
    };
    
    // Handle the main goal assignment
    props.assignGoal(goalData.player, props.matchTime, props.selectedFixtureData.id, homeTeam, awayTeam);
    
    // Handle assist if present
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      // Set goal type to assist temporarily
      props.setSelectedGoalType('assist');
      setTimeout(() => {
        props.assignGoal(goalData.assistPlayer!, props.matchTime, props.selectedFixtureData.id, homeTeam, awayTeam);
        // Reset back to goal type
        props.setSelectedGoalType('goal');
      }, 200);
    }
    
    setShowGoalWizard(false);
    setGoalWizardInitialTeam(undefined);
  };

  const playersForTimeTracker = props.trackedPlayers.map(player => ({
    id: player.id,
    name: player.name,
    team: player.team,
    totalTime: player.totalTime,
    isPlaying: player.isPlaying
  }));

  const handleSaveMatch = () => {
    console.warn('⚠️ RefereeToolsMain: Save functionality needs database hooks from container');
    console.log('Current match state:', {
      homeScore: props.homeScore,
      awayScore: props.awayScore,
      goals: props.goals,
      cards: props.cards,
      trackedPlayers: playersForTimeTracker
    });
  };

  const handleResetMatch = () => {
    props.resetTimer();
    console.log('🔄 RefereeToolsMain: Reset match - full reset needs container-level coordination');
  };

  const handleAssignGoal = (player: ComponentPlayer) => {
    if (!props.selectedFixtureData) return;
    
    const homeTeam = { 
      id: String(props.selectedFixtureData.home_team_id || ''), 
      name: props.selectedFixtureData.home_team?.name || '' 
    };
    const awayTeam = { 
      id: String(props.selectedFixtureData.away_team_id || ''), 
      name: props.selectedFixtureData.away_team?.name || '' 
    };
    
    props.assignGoal(player, props.matchTime, props.selectedFixtureData.id, homeTeam, awayTeam);
  };

  const handleExportSummary = () => {
    console.log('📄 RefereeToolsMain: Export summary functionality');
  };

  // Show goal wizard overlay if active
  if (showGoalWizard) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GoalEntryWizard
            selectedFixtureData={props.selectedFixtureData}
            homeTeamPlayers={props.homeTeamPlayers}
            awayTeamPlayers={props.awayTeamPlayers}
            matchTime={props.matchTime}
            formatTime={props.formatTime}
            onGoalAssigned={handleGoalWizardAssigned}
            onCancel={() => {
              setShowGoalWizard(false);
              setGoalWizardInitialTeam(undefined);
            }}
            initialTeam={goalWizardInitialTeam}
          />
        </div>
        
        {/* Background content (blurred) */}
        <div className="pointer-events-none opacity-50">
          <Tabs defaultValue="score" className="w-full">
            <RefereeTabsNavigation />
            <div className="mt-6">
              <p className="text-center text-muted-foreground">Goal Entry Wizard Active...</p>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="score" className="w-full">
      <RefereeTabsNavigation />
      
      <TabsContent value="score" className="mt-6">
        <ScoreTab
          selectedFixtureData={props.selectedFixtureData}
          isRunning={props.isRunning}
          matchTime={props.matchTime}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          formatTime={props.formatTime}
          onToggleTimer={props.toggleTimer}
          onResetMatch={handleResetMatch}
          onSaveMatch={handleSaveMatch}
          onAssignGoal={handleAssignGoal}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
        />
      </TabsContent>

      <TabsContent value="timer-tracking" className="mt-6">
        <UnifiedTimerTab
          selectedFixtureData={props.selectedFixtureData}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          matchTime={props.matchTime}
          isRunning={props.isRunning}
          formatTime={props.formatTime}
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          trackedPlayers={props.trackedPlayers}
          onToggleTimer={props.toggleTimer}
          onResetMatch={handleResetMatch}
          onAddPlayer={props.addPlayer}
          onRemovePlayer={props.removePlayer}
          onTogglePlayerTime={props.togglePlayerTime}
        />
      </TabsContent>

      <TabsContent value="goals" className="mt-6">
        <GoalsTab
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          goals={props.goals}
          selectedPlayer={props.selectedGoalPlayer}
          selectedGoalType={props.selectedGoalType}
          selectedGoalTeam={props.selectedGoalTeam}
          matchTime={props.matchTime}
          onPlayerSelect={props.setSelectedGoalPlayer}
          onGoalTypeChange={props.setSelectedGoalType}
          onGoalTeamChange={props.setSelectedGoalTeam}
          onAssignGoal={handleAssignGoal}
          formatTime={props.formatTime}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          selectedFixtureData={props.selectedFixtureData}
        />
      </TabsContent>

      <TabsContent value="cards" className="mt-6">
        <CardsTab
          allPlayers={props.allPlayers}
          homeTeamPlayers={props.homeTeamPlayers}
          awayTeamPlayers={props.awayTeamPlayers}
          cards={props.cards}
          selectedPlayer={props.selectedPlayer}
          selectedTeam={props.selectedTeam}
          selectedCardType={props.selectedCardType}
          matchTime={props.matchTime}
          selectedFixtureData={props.selectedFixtureData}
          onPlayerSelect={props.setSelectedPlayer}
          onTeamChange={props.setSelectedTeam}
          onCardTypeChange={props.setSelectedCardType}
          formatTime={props.formatTime}
        />
      </TabsContent>

      <TabsContent value="summary" className="mt-6">
        <SummaryTab
          matchTime={props.matchTime}
          homeScore={props.homeScore}
          awayScore={props.awayScore}
          goals={props.goals}
          cards={props.cards}
          trackedPlayers={props.trackedPlayers}
          events={props.events}
          allPlayers={props.allPlayers}
          selectedFixtureData={props.selectedFixtureData}
          formatTime={props.formatTime}
          onExportSummary={handleExportSummary}
        />
      </TabsContent>
    </Tabs>
  );
};

export default RefereeToolsMain;
