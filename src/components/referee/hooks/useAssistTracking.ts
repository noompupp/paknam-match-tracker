
import { useState, useCallback } from 'react';

interface AssistData {
  id: string;
  playerId: number;
  playerName: string;
  team: string;
  time: number;
  goalId?: string; // Link to associated goal
  synced: boolean;
}

export const useAssistTracking = () => {
  const [assists, setAssists] = useState<AssistData[]>([]);

  const addAssist = useCallback((assistData: Omit<AssistData, 'id' | 'synced'>) => {
    const newAssist: AssistData = {
      ...assistData,
      id: `assist-${Date.now()}-${Math.random()}`,
      synced: false
    };

    setAssists(prev => [...prev, newAssist]);
    
    console.log('🎯 useAssistTracking: Assist added (separate from goals):', newAssist);
    return newAssist;
  }, []);

  const markAssistSynced = useCallback((assistId: string) => {
    setAssists(prev => prev.map(assist => 
      assist.id === assistId 
        ? { ...assist, synced: true }
        : assist
    ));
  }, []);

  const removeAssist = useCallback((assistId: string) => {
    setAssists(prev => prev.filter(assist => assist.id !== assistId));
  }, []);

  const getUnsyncedAssists = useCallback(() => {
    return assists.filter(assist => !assist.synced);
  }, [assists]);

  return {
    assists,
    addAssist,
    markAssistSynced,
    removeAssist,
    getUnsyncedAssists
  };
};
