
import React from "react";
import CardManagementDropdown from "../../CardManagementDropdown";
import UnifiedMatchTimer from "../UnifiedMatchTimer";
import { useEnhancedAutoSave } from "@/hooks/useEnhancedAutoSave";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { useMatchStore } from "@/stores/useMatchStore";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useCardHandlers } from "../../hooks/handlers/useCardHandlers";

interface EnhancedCardsTabProps {
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
  cards: any[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  matchTime: number;
  selectedFixtureData: any;
  onPlayerSelect: (value: string) => void;
  onTeamChange: (value: string) => void;
  onCardTypeChange: (value: 'yellow' | 'red') => void;
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onResetMatch: () => void;
  isRunning: boolean;
  homeScore: number;
  awayScore: number;
}

const EnhancedCardsTab = ({
  allPlayers,
  homeTeamPlayers,
  awayTeamPlayers,
  cards,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  matchTime,
  selectedFixtureData,
  onPlayerSelect,
  onTeamChange,
  onCardTypeChange,
  formatTime,
  onToggleTimer,
  onResetMatch,
  isRunning,
  homeScore,
  awayScore
}: EnhancedCardsTabProps) => {
  // Get unsaved changes state and sync methods
  const { hasUnsavedChanges, syncCardsToDatabase, addEvent } = useMatchStore();

  // Set up card handlers (use working DB-driven handler)
  const { handleAddCard } = useCardHandlers({
    allPlayers,
    matchTime,
    selectedFixtureData,
    addCard: () => {}, // Not used directly since we commit to DB
    addEvent: addEvent
  });

  // Optimized batch save manager for cards
  const { batchSave } = useGlobalBatchSaveManager({
    homeTeamData: { 
      id: selectedFixtureData?.home_team?.__id__ || selectedFixtureData?.home_team_id, 
      name: selectedFixtureData?.home_team?.name || 'Home Team' 
    },
    awayTeamData: { 
      id: selectedFixtureData?.away_team?.__id__ || selectedFixtureData?.away_team_id, 
      name: selectedFixtureData?.away_team?.name || 'Away Team' 
    }
  });

  // Enhanced auto-save with optimized card syncing
  useEnhancedAutoSave({
    enabled: true,
    onAutoSave: async () => {
      if (selectedFixtureData?.id) {
        await syncCardsToDatabase(selectedFixtureData.id);
        console.log('✅ Enhanced Cards: Auto-save completed with improved sync');
      }
    },
    interval: 3 * 60 * 1000, // 3 minutes for cards
    hasUnsavedChanges,
    tabName: 'Cards',
    optimizedMode: true
  });

  // Calculate current phase for 7-a-side timer
  const HALF_DURATION = 25 * 60; // 25 minutes in seconds
  const currentPhase = matchTime <= HALF_DURATION ? 'first' : 
                       matchTime <= HALF_DURATION * 2 ? 'second' : 'overtime';

  // Actual handler wired up: resolves playerId, team, type and calls useCardHandlers.handleAddCard
  const handleAddCardWrapper = async () => {
    if (!selectedPlayer || !selectedTeam) return;

    // Find player in filtered arrays first, then fall back to all players
    let player: ProcessedPlayer | undefined;
    if (selectedTeam === 'home' && homeTeamPlayers) {
      player = homeTeamPlayers.find(p => p.id.toString() === selectedPlayer);
    } else if (selectedTeam === 'away' && awayTeamPlayers) {
      player = awayTeamPlayers.find(p => p.id.toString() === selectedPlayer);
    }
    if (!player) {
      player = allPlayers.find(p => p.id.toString() === selectedPlayer);
    }
    if (!player) return;

    // Delegate to main handler (which writes to DB and manages events)
    await handleAddCard(player.name, selectedTeam, selectedCardType, matchTime);
  };

  return (
    <div className="space-y-6">
      {/* Unified Match Timer */}
      <UnifiedMatchTimer
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        isRunning={isRunning}
        formatTime={formatTime}
        onToggleTimer={onToggleTimer}
        onResetMatch={onResetMatch}
        phase={currentPhase}
      />

      {/* Cards Management with improved saving */}
      <CardManagementDropdown
        selectedFixtureData={selectedFixtureData}
        allPlayers={allPlayers}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        selectedPlayer={selectedPlayer}
        selectedTeam={selectedTeam}
        selectedCardType={selectedCardType}
        cards={cards}
        onPlayerSelect={onPlayerSelect}
        onTeamChange={onTeamChange}
        onCardTypeChange={onCardTypeChange}
        onAddCard={handleAddCardWrapper}
        formatTime={formatTime}
      />

      {/* Improved sync status indicator */}
      {hasUnsavedChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 dark:bg-orange-900/10 dark:border-orange-800">
          <div className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-1">
            Cards Auto-Save Enhanced
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-500">
            Card changes are automatically saved every 3 minutes with improved database sync.
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCardsTab;

