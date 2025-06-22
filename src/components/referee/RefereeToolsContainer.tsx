
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useRefereeStateOrchestrator } from "./hooks/useRefereeStateOrchestrator";
import { useTranslation } from "@/hooks/useTranslation";
import RefereeHeader from "./components/RefereeHeader";
import MatchSelection from "./MatchSelection";
import UnifiedTimerTab from "./components/tabs/UnifiedTimerTab";
import ScoreTab from "./components/tabs/ScoreTab";
import GoalsTab from "./components/tabs/GoalsTab";
import PlayerTimeTab from "./components/tabs/PlayerTimeTab";
import CardsTab from "./components/tabs/CardsTab";
import SummaryTab from "./components/tabs/SummaryTab";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Target, FileText, AlertTriangle } from "lucide-react";
import { useState } from "react";

const RefereeToolsContainer = () => {
  const { t } = useTranslation();
  const state = useRefereeStateOrchestrator();

  // Local state for GoalsTab
  const [showGoalWizard, setShowGoalWizard] = useState(false);

  // Debug the half times at this level
  console.log('🎯 RefereeToolsContainer - Half times state check:', {
    playerHalfTimesSize: state.playerHalfTimes?.size || 0,
    playerHalfTimesExists: !!state.playerHalfTimes,
    trackedPlayersCount: state.trackedPlayers?.length || 0,
    sampleHalfTimes: state.playerHalfTimes ? 
      Array.from(state.playerHalfTimes.entries()).slice(0, 2).map(([id, times]) => ({
        playerId: id,
        firstHalf: `${Math.floor(times.firstHalf / 60)}:${String(times.firstHalf % 60).padStart(2, '0')}`,
        secondHalf: `${Math.floor(times.secondHalf / 60)}:${String(times.secondHalf % 60).padStart(2, '0')}`
      })) : []
  });

  if (!state.selectedFixtureData) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <RefereeHeader 
          saveAttempts={state.saveAttempts || 0}
          playersNeedingAttention={state.playersNeedingAttention || []}
        />
        <MatchSelection
          fixtures={state.fixtures}
          selectedFixture={state.selectedFixture}
          onFixtureChange={state.setSelectedFixture}
        />
      </div>
    );
  }

  const getTabBadgeCount = (tab: string) => {
    switch (tab) {
      case 'goals':
        return state.goals?.length || 0;
      case 'cards':
        return state.cards?.length || 0;
      case 'time':
        return state.trackedPlayers?.length || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <RefereeHeader 
        saveAttempts={state.saveAttempts || 0}
        playersNeedingAttention={state.playersNeedingAttention || []}
      />
      
      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{t("referee.tabs.timer", "Timer")}</span>
          </TabsTrigger>
          
          <TabsTrigger value="score" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">{t("referee.tabs.score", "Score")}</span>
          </TabsTrigger>
          
          <TabsTrigger value="goals" className="flex items-center gap-2 relative">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">{t("referee.tabs.goals", "Goals")}</span>
            {getTabBadgeCount('goals') > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-xs absolute -top-1 -right-1">
                {getTabBadgeCount('goals')}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="time" className="flex items-center gap-2 relative">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t("referee.tabs.playerTime", "Time")}</span>
            {getTabBadgeCount('time') > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-xs absolute -top-1 -right-1">
                {getTabBadgeCount('time')}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="cards" className="flex items-center gap-2 relative">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">{t("referee.tabs.cards", "Cards")}</span>
            {getTabBadgeCount('cards') > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-xs absolute -top-1 -right-1">
                {getTabBadgeCount('cards')}
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t("referee.tabs.summary", "Summary")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer">
          <UnifiedTimerTab
            matchTime={state.matchTime}
            isRunning={state.isRunning}
            onToggleTimer={state.toggleTimer}
            formatTime={state.formatTime}
            selectedFixtureData={state.selectedFixtureData}
            allPlayers={state.allPlayers}
            homeTeamPlayers={state.homeTeamPlayers}
            awayTeamPlayers={state.awayTeamPlayers}
            trackedPlayers={state.trackedPlayers}
            onResetMatch={state.handleResetMatch}
            onAddPlayer={state.handleAddPlayer}
            onRemovePlayer={state.handleRemovePlayer}
            onTogglePlayerTime={state.handleTogglePlayerTime}
          />
        </TabsContent>

        <TabsContent value="score">
          <ScoreTab
            selectedFixtureData={state.selectedFixtureData}
            onSaveMatch={state.handleSaveMatch}
            matchTime={state.matchTime}
            formatTime={state.formatTime}
            onResetMatch={state.handleResetMatch}
            forceRefresh={state.forceRefresh}
            isRunning={state.isRunning}
            homeTeamPlayers={state.homeTeamPlayers}
            awayTeamPlayers={state.awayTeamPlayers}
            onToggleTimer={state.toggleTimer}
            onAssignGoal={state.handleAssignGoal}
          />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsTab
            selectedFixtureData={state.selectedFixtureData}
            formatTime={state.formatTime}
            matchTime={state.matchTime}
            homeTeamPlayers={state.homeTeamPlayers}
            awayTeamPlayers={state.awayTeamPlayers}
            onGoalAssigned={(goalData) => {
              console.log('Goal assigned:', goalData);
              setShowGoalWizard(false);
            }}
            showGoalWizard={showGoalWizard}
            onCancelGoalWizard={() => setShowGoalWizard(false)}
          />
        </TabsContent>

        <TabsContent value="time">
          <PlayerTimeTab
            trackedPlayers={state.trackedPlayers}
            selectedTimePlayer={state.selectedTimePlayer}
            setSelectedTimePlayer={state.setSelectedTimePlayer}
            allPlayers={state.allPlayers}
            homeTeamPlayers={state.homeTeamPlayers}
            awayTeamPlayers={state.awayTeamPlayers}
            selectedTimeTeam={state.selectedTimeTeam}
            setSelectedTimeTeam={state.setSelectedTimeTeam}
            handleAddPlayer={state.handleAddPlayer}
            handleTogglePlayerTime={state.handleTogglePlayerTime}
            formatTime={state.formatTime}
            matchTime={state.matchTime}
            selectedFixtureData={state.selectedFixtureData}
            playerHalfTimes={state.playerHalfTimes}
          />
        </TabsContent>

        <TabsContent value="cards">
          <CardsTab
            cards={state.cards}
            selectedPlayer={state.selectedPlayer}
            selectedTeam={state.selectedTeam}
            selectedCardType={state.selectedCardType}
            onPlayerSelect={state.setSelectedPlayer}
            onTeamChange={state.setSelectedTeam}
            onCardTypeChange={state.setSelectedCardType}
            allPlayers={state.allPlayers}
            homeTeamPlayers={state.homeTeamPlayers}
            awayTeamPlayers={state.awayTeamPlayers}
            selectedFixtureData={state.selectedFixtureData}
            formatTime={state.formatTime}
            matchTime={state.matchTime}
          />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryTab
            selectedFixtureData={state.selectedFixtureData}
            homeScore={state.homeScore}
            awayScore={state.awayScore}
            goals={state.goals}
            cards={state.cards}
            trackedPlayers={state.trackedPlayers}
            events={state.events}
            formatTime={state.formatTime}
            matchTime={state.matchTime}
            handleSaveMatch={state.handleSaveMatch}
            saveAttempts={state.saveAttempts}
            handleResetMatch={state.handleResetMatch}
            allPlayers={state.allPlayers}
            playerHalfTimes={state.playerHalfTimes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefereeToolsContainer;
