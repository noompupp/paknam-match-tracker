
import { useState } from "react";
import { useFixtures } from "@/hooks/useFixtures";
import { useMembers } from "@/hooks/useMembers";
import { useUpdateFixtureScore } from "@/hooks/useFixtures";
import { useCreateMatchEvent, useUpdatePlayerStats } from "@/hooks/useMatchEvents";
import { useMatchTimer } from "@/hooks/useMatchTimer";
import { useResetState } from "@/hooks/useResetState";

export const useRefereeBaseState = () => {
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { data: members } = useMembers();
  const updateFixtureScore = useUpdateFixtureScore();
  const createMatchEvent = useCreateMatchEvent();
  const updatePlayerStats = useUpdatePlayerStats();

  const [selectedFixture, setSelectedFixture] = useState("");
  const [saveAttempts, setSaveAttempts] = useState(0);

  const selectedFixtureData = fixtures?.find(f => f.id.toString() === selectedFixture);

  // Initialize reset state for coordinated state management
  const resetState = useResetState({ fixtureId: selectedFixtureData?.id });

  // Timer state
  const { matchTime, isRunning, toggleTimer, resetTimer, formatTime } = useMatchTimer();

  return {
    // Data
    fixtures,
    fixturesLoading,
    members,
    selectedFixture,
    setSelectedFixture,
    selectedFixtureData,
    
    // Save attempts
    saveAttempts,
    setSaveAttempts,
    
    // Mutation hooks
    updateFixtureScore,
    createMatchEvent,
    updatePlayerStats,
    
    // Timer state
    matchTime,
    isRunning,
    toggleTimer,
    resetTimer,
    formatTime,
    
    // Reset state coordination
    resetState
  };
};
