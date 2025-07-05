
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { matchEventsApi } from '@/services/api';
import { MatchEvent } from '@/types/database';
import { realTimeScoreService } from '@/services/fixtures/realTimeScoreService';

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
    onSuccess: async (data) => {
      console.log('🎯 useCreateMatchEvent: Event created, triggering comprehensive synchronization');
      
      // Phase 3: Comprehensive data invalidation for all views
      const invalidateQueries = async () => {
        // Core match data
        queryClient.invalidateQueries({ queryKey: ['matchEvents', data.fixture_id] });
        queryClient.invalidateQueries({ queryKey: ['fixtures'] });
        
        // Member and player stats (for Top Scorers, etc.)
        queryClient.invalidateQueries({ queryKey: ['members'] });
        queryClient.invalidateQueries({ queryKey: ['playerStats'] });
        queryClient.invalidateQueries({ queryKey: ['topScorers'] });
        queryClient.invalidateQueries({ queryKey: ['topAssists'] });
        
        // Team stats and league table
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        queryClient.invalidateQueries({ queryKey: ['leagueTable'] });
        
        // Enhanced match summary and rating data
        queryClient.invalidateQueries({ queryKey: ['enhancedMatchSummary'] });
        queryClient.invalidateQueries({ queryKey: ['matchSummary'] });
        queryClient.invalidateQueries({ queryKey: ['playerRatings'] });
      };
      
      // Invalidate immediately
      await invalidateQueries();
      
      // Trigger real-time score update if it's a goal event
      if (data.event_type === 'goal') {
        console.log('🔄 useCreateMatchEvent: Triggering real-time score update for goal event');
        try {
          const scoreResult = await realTimeScoreService.updateFixtureScoreRealTime(data.fixture_id);
          if (scoreResult.success) {
            console.log('✅ useCreateMatchEvent: Real-time score update successful:', scoreResult);
            // Additional invalidation after score update to ensure all views sync
            await invalidateQueries();
          } else {
            console.error('❌ useCreateMatchEvent: Real-time score update failed:', scoreResult.error);
          }
        } catch (error) {
          console.error('❌ useCreateMatchEvent: Real-time score update error:', error);
        }
      }
    },
  });
};

export const useUpdateMatchEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: number; updates: Partial<Omit<MatchEvent, 'id' | 'created_at'>> }) =>
      matchEventsApi.update(eventId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matchEvents', data.fixture_id] });
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    },
  });
};

export const useDeleteMatchEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, fixtureId }: { eventId: number; fixtureId: number }) => 
      matchEventsApi.delete(eventId),
    onSuccess: async (_, variables) => {
      console.log('🎯 useDeleteMatchEvent: Event deleted, triggering comprehensive synchronization');
      
      // Phase 3: Comprehensive data invalidation for all views
      const invalidateQueries = async () => {
        // Core match data
        queryClient.invalidateQueries({ queryKey: ['matchEvents', variables.fixtureId] });
        queryClient.invalidateQueries({ queryKey: ['fixtures'] });
        
        // Member and player stats (for Top Scorers, etc.)
        queryClient.invalidateQueries({ queryKey: ['members'] });
        queryClient.invalidateQueries({ queryKey: ['playerStats'] });
        queryClient.invalidateQueries({ queryKey: ['topScorers'] });
        queryClient.invalidateQueries({ queryKey: ['topAssists'] });
        
        // Team stats and league table
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        queryClient.invalidateQueries({ queryKey: ['leagueTable'] });
        
        // Enhanced match summary and rating data
        queryClient.invalidateQueries({ queryKey: ['enhancedMatchSummary'] });
        queryClient.invalidateQueries({ queryKey: ['matchSummary'] });
        queryClient.invalidateQueries({ queryKey: ['playerRatings'] });
      };
      
      // Invalidate immediately
      await invalidateQueries();
      
      // Always trigger real-time score update for deletions (in case it was a goal)
      console.log('🔄 useDeleteMatchEvent: Triggering real-time score update after event deletion');
      try {
        const scoreResult = await realTimeScoreService.updateFixtureScoreRealTime(variables.fixtureId);
        if (scoreResult.success) {
          console.log('✅ useDeleteMatchEvent: Real-time score update successful:', scoreResult);
          // Additional invalidation after score update to ensure all views sync
          await invalidateQueries();
        } else {
          console.error('❌ useDeleteMatchEvent: Real-time score update failed:', scoreResult.error);
        }
      } catch (error) {
        console.error('❌ useDeleteMatchEvent: Real-time score update error:', error);
      }
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
