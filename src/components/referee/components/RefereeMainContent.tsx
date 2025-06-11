
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Target, AlertTriangle, Users, Save } from "lucide-react";
import RefereeTimerSection from "./RefereeTimerSection";
import GoalsTab from "./tabs/GoalsTab";
import CardsTab from "./tabs/CardsTab";
import PlayerTimeTab from "./tabs/PlayerTimeTab";
import RefereeMatchControlSection from "./RefereeMatchControlSection";
import RefereeMatchSummary from "./RefereeMatchSummary";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

interface RefereeMainContentProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
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
  saveAttempts: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  assignGoal: (player: any, matchTime: number, fixtureId: number, homeTeam: any, awayTeam: any) => any;
  addPlayer: (player: any) => void;
  removePlayer: (playerId: number) => void;
  togglePlayerTime: (playerId: number) => void;
  onSaveMatch: () => void;
  onResetMatch: () => void;
}

const RefereeMainContent = (props: RefereeMainContentProps) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Timer Section */}
      <RefereeTimerSection
        matchTime={props.matchTime}
        isRunning={props.isRunning}
        homeScore={props.homeScore}
        awayScore={props.awayScore}
        formatTime={props.formatTime}
        toggleTimer={props.toggleTimer}
        resetTimer={props.resetTimer}
        selectedFixtureData={props.selectedFixtureData}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Main Tabs Panel */}
        <div className="xl:col-span-2">
          <Card className="referee-card">
            <CardContent className="p-6">
              <Tabs defaultValue="goals" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-6">
                  <TabsTrigger value="goals" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">Goals</span>
                  </TabsTrigger>
                  <TabsTrigger value="cards" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </TabsTrigger>
                  <TabsTrigger value="time" className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span className="hidden sm:inline">Time</span>
                  </TabsTrigger>
                  <TabsTrigger value="control" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Control</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="mt-0">
                  <GoalsTab
                    allPlayers={props.allPlayers}
                    homeTeamPlayers={props.homeTeamPlayers}
                    awayTeamPlayers={props.awayTeamPlayers}
                    goals={props.goals}
                    selectedGoalPlayer={props.selectedGoalPlayer}
                    selectedGoalType={props.selectedGoalType}
                    selectedGoalTeam={props.selectedGoalTeam}
                    matchTime={props.matchTime}
                    selectedFixtureData={props.selectedFixtureData}
                    onPlayerSelect={props.setSelectedGoalPlayer}
                    onGoalTypeChange={props.setSelectedGoalType}
                    onTeamChange={props.setSelectedGoalTeam}
                    formatTime={props.formatTime}
                    assignGoal={props.assignGoal}
                  />
                </TabsContent>

                <TabsContent value="cards" className="mt-0">
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

                <TabsContent value="time" className="mt-0">
                  <PlayerTimeTab
                    allPlayers={props.allPlayers}
                    homeTeamPlayers={props.homeTeamPlayers}
                    awayTeamPlayers={props.awayTeamPlayers}
                    trackedPlayers={props.trackedPlayers}
                    selectedTimePlayer={props.selectedTimePlayer}
                    selectedTimeTeam={props.selectedTimeTeam}
                    matchTime={props.matchTime}
                    setSelectedTimePlayer={props.setSelectedTimePlayer}
                    setSelectedTimeTeam={props.setSelectedTimeTeam}
                    addPlayer={props.addPlayer}
                    removePlayer={props.removePlayer}
                    togglePlayerTime={props.togglePlayerTime}
                    formatTime={props.formatTime}
                  />
                </TabsContent>

                <TabsContent value="control" className="mt-0">
                  <RefereeMatchControlSection
                    selectedFixtureData={props.selectedFixtureData}
                    saveAttempts={props.saveAttempts}
                    onSaveMatch={props.onSaveMatch}
                    onResetMatch={props.onResetMatch}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Match Summary */}
        <div className="xl:col-span-1">
          <RefereeMatchSummary
            goals={props.goals}
            cards={props.cards}
            events={props.events}
            trackedPlayers={props.trackedPlayers}
            selectedFixtureData={props.selectedFixtureData}
            formatTime={props.formatTime}
          />
        </div>
      </div>
    </div>
  );
};

export default RefereeMainContent;
