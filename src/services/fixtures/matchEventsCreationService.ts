
import { supabase } from '@/integrations/supabase/client';
import { MatchEvent } from '@/types/database';

interface TeamInfo {
  id: string;
  name: string;
}

export const createGoalEventsWithDuplicateCheck = async (
  fixtureId: number,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo,
  homeScore: number,
  awayScore: number,
  currentHomeScore: number,
  currentAwayScore: number
): Promise<void> => {
  console.log('⚽ MatchEventsCreationService: Creating goal events with duplicate check:', {
    fixtureId,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    scoreChange: `${currentHomeScore}-${currentAwayScore} -> ${homeScore}-${awayScore}`
  });

  try {
    const events: Omit<MatchEvent, 'id' | 'created_at'>[] = [];
    
    // Calculate goals needed for home team
    const homeGoalsToAdd = homeScore - currentHomeScore;
    if (homeGoalsToAdd > 0) {
      for (let i = 0; i < homeGoalsToAdd; i++) {
        // Check if this goal event already exists
        const { data: existingGoals } = await supabase
          .from('match_events')
          .select('id')
          .eq('fixture_id', fixtureId)
          .eq('event_type', 'goal')
          .eq('team_id', homeTeam.id)
          .eq('player_name', 'Unknown Player');

        const existingCount = existingGoals?.length || 0;
        
        if (existingCount < homeGoalsToAdd) {
          events.push({
            fixture_id: fixtureId,
            event_type: 'goal',
            player_name: 'Unknown Player',
            team_id: homeTeam.id,
            event_time: 0,
            description: `Goal by Unknown Player (${homeTeam.name})`,
            is_own_goal: false
          });
        }
      }
    }

    // Calculate goals needed for away team
    const awayGoalsToAdd = awayScore - currentAwayScore;
    if (awayGoalsToAdd > 0) {
      for (let i = 0; i < awayGoalsToAdd; i++) {
        // Check if this goal event already exists
        const { data: existingGoals } = await supabase
          .from('match_events')
          .select('id')
          .eq('fixture_id', fixtureId)
          .eq('event_type', 'goal')
          .eq('team_id', awayTeam.id)
          .eq('player_name', 'Unknown Player');

        const existingCount = existingGoals?.length || 0;
        
        if (existingCount < awayGoalsToAdd) {
          events.push({
            fixture_id: fixtureId,
            event_type: 'goal',
            player_name: 'Unknown Player',
            team_id: awayTeam.id,
            event_time: 0,
            description: `Goal by Unknown Player (${awayTeam.name})`,
            is_own_goal: false
          });
        }
      }
    }

    // Insert new events if any
    if (events.length > 0) {
      const { error } = await supabase
        .from('match_events')
        .insert(events);

      if (error) {
        console.error('❌ MatchEventsCreationService: Error creating goal events:', error);
        throw new Error(`Failed to create goal events: ${error.message}`);
      }

      console.log(`✅ MatchEventsCreationService: Successfully created ${events.length} goal events with duplicate prevention`);
    } else {
      console.log('ℹ️ MatchEventsCreationService: No new goal events needed (duplicates prevented)');
    }

  } catch (error) {
    console.error('❌ MatchEventsCreationService: Critical error in createGoalEventsWithDuplicateCheck:', error);
    throw error;
  }
};

export const createCardEvent = async (
  fixtureId: number,
  playerId: number,
  playerName: string,
  teamId: string,
  cardType: 'yellow' | 'red',
  eventTime: number
): Promise<void> => {
  console.log('🟨 MatchEventsCreationService: Creating card event:', {
    fixtureId,
    playerName,
    cardType,
    eventTime
  });

  try {
    // Use consistent event types
    const eventType = cardType === 'yellow' ? 'yellow_card' : 'red_card';
    
    const event: Omit<MatchEvent, 'id' | 'created_at'> = {
      fixture_id: fixtureId,
      event_type: eventType,
      player_name: playerName,
      team_id: teamId,
      event_time: eventTime,
      description: `${cardType} card for ${playerName}`,
      card_type: cardType,
      is_own_goal: false
    };

    const { error } = await supabase
      .from('match_events')
      .insert([event]);

    if (error) {
      console.error('❌ MatchEventsCreationService: Error creating card event:', error);
      throw new Error(`Failed to create card event: ${error.message}`);
    }

    console.log('✅ MatchEventsCreationService: Card event created successfully');

  } catch (error) {
    console.error('❌ MatchEventsCreationService: Critical error in createCardEvent:', error);
    throw error;
  }
};
