
import React from "react";
import CardManagementDropdown from "../../CardManagementDropdown";
import UnifiedMatchTimer from "../UnifiedMatchTimer";
import { useEnhancedAutoSave } from "@/hooks/useEnhancedAutoSave";
import { useGlobalBatchSaveManager } from "@/hooks/useGlobalBatchSaveManager";
import { useMatchStore } from "@/stores/useMatchStore";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";

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
  // Get unsaved changes state
  const { hasUnsavedChanges } = useMatchStore();

  // Auto-save manager
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

  // Enhanced auto-save for cards (5 minutes)
  useEnhancedAutoSave({
    enabled: true,
    onAutoSave: async () => {
      await batchSave();
    },
    interval: 5 * 60 * 1000, // 5 minutes
    hasUnsavedChanges,
    tabName: 'Cards'
  });

  // Calculate current phase for 7-a-side timer
  const HALF_DURATION = 25 * 60; // 25 minutes in seconds
  const currentPhase = matchTime <= HALF_DURATION ? 'first' : 
                       matchTime <= HALF_DURATION * 2 ? 'second' : 'overtime';

  const handleAddCard = () => {
    if (!selectedPlayer || !selectedTeam) return;
    
    // Find player in filtered arrays first, then fall back to all players
    let player: ProcessedPlayer | undefined;
    
    if (selectedTeam === 'home' && homeTeamPlayers) {
      player = homeTeamPlayers.find(p => p.id.toString() === selectedPlayer);
    } else if (selectedTeam === 'away' && awayTeamPlayers) {
      player = awayTeamPlayers.find(p => p.id.toString() === selectedPlayer);
    }
    
    // Fallback to all players if not found in filtered arrays
    if (!player) {
      player = allPlayers.find(p => p.id.toString() === selectedPlayer);
    }
    
    if (!player) return;
    
    console.log('🟨 Enhanced Cards: Adding card with autosave:', { 
      player: player.name, 
      team: selectedTeam, 
      cardType: selectedCardType, 
      time: matchTime 
    });
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

      {/* Cards Management */}
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
        onAddCard={handleAddCard}
        formatTime={formatTime}
      />
    </div>
  );
};

export default EnhancedCardsTab;
