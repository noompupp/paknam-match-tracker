
import { supabase } from '@/integrations/supabase/client';

export interface MatchSummaryData {
  goals: Array<{
    id: number;
    playerId: number;
    playerName: string;
    team: string;
    type: 'goal' | 'assist';
    time: number;
  }>;
  cards: Array<{
    id: number;
    playerId: number;
    playerName: string;
    team: string;
    cardType: 'yellow' | 'red';
    time: number;
  }>;
  playerTimes: Array<{
    playerId: number;
    playerName: string;
    team: string;
    totalMinutes: number;
  }>;
}

export const matchSummaryService = {
  async getMatchSummaryData(fixtureId: number): Promise<MatchSummaryData> {
    console.log('📊 MatchSummaryService: Fetching complete match summary for fixture:', fixtureId);
    
    try {
      // Fetch match events (goals, assists, cards)
      const { data: matchEvents, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('event_time', { ascending: true });

      if (eventsError) {
        console.error('❌ MatchSummaryService: Error fetching match events:', eventsError);
        throw eventsError;
      }

      // Fetch player time tracking data
      const { data: playerTimeData, error: timeError } = await supabase
        .from('player_time_tracking')
        .select('*')
        .eq('fixture_id', fixtureId);

      if (timeError) {
        console.error('❌ MatchSummaryService: Error fetching player times:', timeError);
        throw timeError;
      }

      // Process match events into goals and cards
      const goals = matchEvents
        ?.filter(event => event.event_type === 'goal' || event.event_type === 'assist')
        .map(event => ({
          id: event.id,
          playerId: parseInt(event.player_name) || 0, // Handle if player_name contains ID
          playerName: event.player_name,
          team: event.team_id,
          type: event.event_type as 'goal' | 'assist',
          time: event.event_time
        })) || [];

      const cards = matchEvents
        ?.filter(event => event.event_type === 'card')
        .map(event => ({
          id: event.id,
          playerId: parseInt(event.player_name) || 0, // Handle if player_name contains ID
          playerName: event.player_name,
          team: event.team_id,
          cardType: event.card_type as 'yellow' | 'red',
          time: event.event_time
        })) || [];

      // Process player time data
      const playerTimes = playerTimeData?.map(timeRecord => ({
        playerId: timeRecord.player_id,
        playerName: timeRecord.player_name,
        team: timeRecord.team_id.toString(),
        totalMinutes: timeRecord.total_minutes
      })) || [];

      console.log('✅ MatchSummaryService: Successfully processed match summary data:', {
        goalsCount: goals.length,
        cardsCount: cards.length,
        playersWithTime: playerTimes.length
      });

      return {
        goals,
        cards,
        playerTimes
      };

    } catch (error) {
      console.error('❌ MatchSummaryService: Critical error fetching match summary:', error);
      throw error;
    }
  },

  async updateMemberStatsFromMatch(fixtureId: number): Promise<{ success: boolean; message: string }> {
    console.log('🔄 MatchSummaryService: Updating member stats from match events for fixture:', fixtureId);
    
    try {
      const summaryData = await this.getMatchSummaryData(fixtureId);
      
      // Group stats by player
      const playerStats = new Map<number, {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        minutesPlayed: number;
      }>();

      // Process goals and assists
      summaryData.goals.forEach(goal => {
        if (!playerStats.has(goal.playerId)) {
          playerStats.set(goal.playerId, {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0
          });
        }
        
        const stats = playerStats.get(goal.playerId)!;
        if (goal.type === 'goal') {
          stats.goals += 1;
        } else if (goal.type === 'assist') {
          stats.assists += 1;
        }
      });

      // Process cards
      summaryData.cards.forEach(card => {
        if (!playerStats.has(card.playerId)) {
          playerStats.set(card.playerId, {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0
          });
        }
        
        const stats = playerStats.get(card.playerId)!;
        if (card.cardType === 'yellow') {
          stats.yellowCards += 1;
        } else if (card.cardType === 'red') {
          stats.redCards += 1;
        }
      });

      // Process playing time
      summaryData.playerTimes.forEach(timeData => {
        if (!playerStats.has(timeData.playerId)) {
          playerStats.set(timeData.playerId, {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0
          });
        }
        
        const stats = playerStats.get(timeData.playerId)!;
        stats.minutesPlayed += timeData.totalMinutes;
      });

      // Update each player's stats in the database
      let updatedCount = 0;
      for (const [playerId, stats] of playerStats) {
        try {
          const { error } = await supabase.rpc('safe_update_member_stats', {
            p_member_id: playerId,
            p_goals: stats.goals,
            p_assists: stats.assists,
            p_yellow_cards: stats.yellowCards,
            p_red_cards: stats.redCards,
            p_total_minutes_played: stats.minutesPlayed,
            p_matches_played: 1
          });

          if (!error) {
            updatedCount++;
          } else {
            console.warn(`⚠️ MatchSummaryService: Failed to update stats for player ${playerId}:`, error);
          }
        } catch (error) {
          console.warn(`⚠️ MatchSummaryService: Error updating player ${playerId}:`, error);
        }
      }

      console.log(`✅ MatchSummaryService: Updated stats for ${updatedCount}/${playerStats.size} players`);
      
      return {
        success: true,
        message: `Successfully updated stats for ${updatedCount} players`
      };

    } catch (error) {
      console.error('❌ MatchSummaryService: Error updating member stats:', error);
      return {
        success: false,
        message: `Failed to update member stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};
