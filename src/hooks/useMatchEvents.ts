
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { matchEventsApi } from '@/services/api';
import { MatchEvent } from '@/types/database';

interface LocalMatchEvent {
  id: number;
  type: string;
  description: string;
  time: number;
}

export const useMatchEvents = (fixtureId?: number) => {
  return useQuery({
    queryKey: ['matchEvents', fixtureId],
    queryFn: async () => {
      if (!fixtureId) return [];
      console.log('🎣 useMatchEvents: Starting query for fixture:', fixtureId);
      try {
        const events = await matchEventsApi.getByFixture(fixtureId);
        console.log('🎣 useMatchEvents: Query successful, events:', events);
        return events;
      } catch (error) {
        console.error('🎣 useMatchEvents: Query failed:', error);
        throw error;
      }
    },
    enabled: !!fixtureId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCreateMatchEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: Omit<MatchEvent, 'id' | 'created_at'>) =>
      matchEventsApi.create(eventData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matchEvents', data.fixture_id] });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    },
  });
};

export const useUpdatePlayerStats = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ playerId, goals, assists }: { playerId: number; goals?: number; assists?: number }) =>
      matchEventsApi.updatePlayerStats(playerId, goals, assists),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useLocalMatchEvents = () => {
  const [events, setEvents] = useState<LocalMatchEvent[]>([]);

  const addEvent = (type: string, description: string, time: number) => {
    const newEvent: LocalMatchEvent = {
      id: Date.now(),
      type,
      description,
      time
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const resetEvents = () => {
    setEvents([]);
  };

  return {
    events,
    addEvent,
    resetEvents
  };
};
