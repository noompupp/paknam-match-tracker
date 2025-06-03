
import { supabase } from '@/integrations/supabase/client';
import { getNumericTeamId } from '@/utils/teamIdMapping';

interface MatchEventData {
  fixture_id: number;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'other';
  player_name: string;
  team_id: number;
  event_time: number;
  description: string;
}

export const createMatchEvent = async (eventData: MatchEventData): Promise<void> => {
  console.log('📝 MatchEventsCreationService: Creating match event:', eventData);
  
  try {
    const { data, error } = await supabase
      .from('match_events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('❌ MatchEventsCreationService: Error creating match event:', error);
      throw error;
    }

    console.log('✅ MatchEventsCreationService: Match event created successfully:', data);
  } catch (error) {
    console.error('❌ MatchEventsCreationService: Critical error creating match event:', error);
    throw error;
  }
};

export const createGoalEvents = async (
  fixtureId: number, 
  homeTeam: { id: number; name: string }, 
  awayTeam: { id: number; name: string }, 
  homeScore: number, 
  awayScore: number,
  currentHomeScore: number = 0,
  currentAwayScore: number = 0
): Promise<void> => {
  console.log('⚽ MatchEventsCreationService: Creating goal events for score change:', {
    fixtureId,
    scoreChange: `${currentHomeScore}-${currentAwayScore} → ${homeScore}-${awayScore}`,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name
  });

  try {
    const events: MatchEventData[] = [];
    
    // Calculate new goals scored
    const newHomeGoals = homeScore - currentHomeScore;
    const newAwayGoals = awayScore - currentAwayScore;

    // Create events for new home goals using numeric team ID
    for (let i = 0; i < newHomeGoals; i++) {
      events.push({
        fixture_id: fixtureId,
        event_type: 'goal',
        player_name: 'Unknown Player',
        team_id: homeTeam.id, // Now using numeric ID directly
        event_time: 0,
        description: `Goal for ${homeTeam.name} - needs player assignment`
      });
    }

    // Create events for new away goals using numeric team ID
    for (let i = 0; i < newAwayGoals; i++) {
      events.push({
        fixture_id: fixtureId,
        event_type: 'goal',
        player_name: 'Unknown Player',
        team_id: awayTeam.id, // Now using numeric ID directly
        event_time: 0,
        description: `Goal for ${awayTeam.name} - needs player assignment`
      });
    }

    if (events.length > 0) {
      console.log(`📝 MatchEventsCreationService: Creating ${events.length} goal events`);
      
      for (const event of events) {
        await createMatchEvent(event);
      }
      
      console.log('✅ MatchEventsCreationService: All goal events created successfully');
    } else {
      console.log('📝 MatchEventsCreationService: No new goals to create events for');
    }

  } catch (error) {
    console.error('❌ MatchEventsCreationService: Error creating goal events:', error);
    throw error;
  }
};
