
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

      // Process match events into goals and cards (playerId will be resolved later)
      const goals = matchEvents
        ?.filter(event => event.event_type === 'goal' || event.event_type === 'assist')
        .map(event => ({
          id: event.id,
          playerId: 0, // Will be resolved in updateMemberStatsFromMatch
          playerName: event.player_name,
          team: event.team_id,
          type: event.event_type as 'goal' | 'assist',
          time: event.event_time
        })) || [];

      const cards = matchEvents
        ?.filter(event => event.event_type === 'card')
        .map(event => ({
          id: event.id,
          playerId: 0, // Will be resolved in updateMemberStatsFromMatch
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

      // First, get all unique player names from match events
      const allPlayerNames = new Set<string>();
      summaryData.goals.forEach(goal => allPlayerNames.add(goal.playerName));
      summaryData.cards.forEach(card => allPlayerNames.add(card.playerName));
      summaryData.playerTimes.forEach(timeData => allPlayerNames.add(timeData.playerName));

      // Create a lookup map from player names to player IDs
      const playerNameToIdMap = new Map<string, number>();
      
      if (allPlayerNames.size > 0) {
        console.log('🔍 MatchSummaryService: Looking up player IDs for names:', Array.from(allPlayerNames));
        
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('id, name, team_id')
          .in('name', Array.from(allPlayerNames));

        if (membersError) {
          console.error('❌ MatchSummaryService: Error fetching member data:', membersError);
        } else if (membersData) {
          membersData.forEach(member => {
            playerNameToIdMap.set(member.name, member.id);
          });
          console.log('✅ MatchSummaryService: Player name to ID mapping:', Object.fromEntries(playerNameToIdMap));
        }
      }

      // Helper function to get player ID with fallback
      const getPlayerId = (playerName: string): number | null => {
        const playerId = playerNameToIdMap.get(playerName);
        if (!playerId) {
          console.warn(`⚠️ MatchSummaryService: Could not find player ID for name: "${playerName}"`);
          return null;
        }
        return playerId;
      };

      // Process goals and assists with proper player ID lookup
      summaryData.goals.forEach(goal => {
        const playerId = getPlayerId(goal.playerName);
        if (!playerId) return; // Skip if player ID not found

        if (!playerStats.has(playerId)) {
          playerStats.set(playerId, {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0
          });
        }
        
        const stats = playerStats.get(playerId)!;
        if (goal.type === 'goal') {
          stats.goals += 1;
          console.log(`⚽ MatchSummaryService: Added goal for ${goal.playerName} (ID: ${playerId})`);
        } else if (goal.type === 'assist') {
          stats.assists += 1;
          console.log(`🅰️ MatchSummaryService: Added assist for ${goal.playerName} (ID: ${playerId})`);
        }
      });

      // Process cards with proper player ID lookup
      summaryData.cards.forEach(card => {
        const playerId = getPlayerId(card.playerName);
        if (!playerId) return; // Skip if player ID not found

        if (!playerStats.has(playerId)) {
          playerStats.set(playerId, {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0
          });
        }
        
        const stats = playerStats.get(playerId)!;
        if (card.cardType === 'yellow') {
          stats.yellowCards += 1;
          console.log(`🟨 MatchSummaryService: Added yellow card for ${card.playerName} (ID: ${playerId})`);
        } else if (card.cardType === 'red') {
          stats.redCards += 1;
          console.log(`🟥 MatchSummaryService: Added red card for ${card.playerName} (ID: ${playerId})`);
        }
      });

      // Process playing time - use the player_id directly from player_time_tracking
      summaryData.playerTimes.forEach(timeData => {
        const playerId = timeData.playerId; // This should be the actual player ID from the database
        
        if (!playerStats.has(playerId)) {
          playerStats.set(playerId, {
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0
          });
        }
        
        const stats = playerStats.get(playerId)!;
        stats.minutesPlayed += timeData.totalMinutes;
        console.log(`⏱️ MatchSummaryService: Added ${timeData.totalMinutes} minutes for ${timeData.playerName} (ID: ${playerId})`);
      });

      // Update each player's stats in the database
      let updatedCount = 0;
      let failedCount = 0;
      
      console.log(`📊 MatchSummaryService: Updating stats for ${playerStats.size} players`);
      
      for (const [playerId, stats] of playerStats) {
        try {
          console.log(`🔄 MatchSummaryService: Updating player ${playerId} with stats:`, stats);
          
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
            console.log(`✅ MatchSummaryService: Successfully updated stats for player ${playerId}`);
          } else {
            failedCount++;
            console.error(`❌ MatchSummaryService: Failed to update stats for player ${playerId}:`, error);
          }
        } catch (error) {
          failedCount++;
          console.error(`❌ MatchSummaryService: Exception updating player ${playerId}:`, error);
        }
      }

      console.log(`✅ MatchSummaryService: Updated stats for ${updatedCount}/${playerStats.size} players (${failedCount} failed)`);
      
      return {
        success: updatedCount > 0,
        message: failedCount > 0 
          ? `Updated stats for ${updatedCount} players, ${failedCount} failed`
          : `Successfully updated stats for ${updatedCount} players`
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
