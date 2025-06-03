
import { supabase } from '@/integrations/supabase/client';

interface MatchEventData {
  fixture_id: number;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'other' | 'assist';
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
        team_id: homeTeam.id,
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
        team_id: awayTeam.id,
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

export const createGoalEventsWithDuplicateCheck = async (
  fixtureId: number, 
  homeTeam: { id: number; name: string }, 
  awayTeam: { id: number; name: string }, 
  homeScore: number, 
  awayScore: number,
  currentHomeScore: number = 0,
  currentAwayScore: number = 0
): Promise<void> => {
  console.log('⚽ MatchEventsCreationService: Creating goal events with duplicate prevention:', {
    fixtureId,
    scoreChange: `${currentHomeScore}-${currentAwayScore} → ${homeScore}-${awayScore}`,
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name
  });

  try {
    // Get existing events for this fixture
    const { data: existingEvents, error: eventsError } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'goal');

    if (eventsError) {
      console.error('❌ MatchEventsCreationService: Error fetching existing events:', eventsError);
      throw eventsError;
    }

    // Count existing goals per team
    const existingHomeGoals = existingEvents?.filter(e => e.team_id === homeTeam.id).length || 0;
    const existingAwayGoals = existingEvents?.filter(e => e.team_id === awayTeam.id).length || 0;

    console.log('📊 MatchEventsCreationService: Existing goal events:', {
      home: existingHomeGoals,
      away: existingAwayGoals,
      total: existingEvents?.length || 0
    });

    // Calculate how many events we need to create
    const eventsNeededHome = Math.max(0, homeScore - existingHomeGoals);
    const eventsNeededAway = Math.max(0, awayScore - existingAwayGoals);

    // Calculate how many events we need to remove (if score decreased)
    const eventsToRemoveHome = Math.max(0, existingHomeGoals - homeScore);
    const eventsToRemoveAway = Math.max(0, existingAwayGoals - awayScore);

    // Remove excess events if score decreased
    if (eventsToRemoveHome > 0) {
      const homeEventsToRemove = existingEvents
        ?.filter(e => e.team_id === homeTeam.id)
        .slice(-eventsToRemoveHome) || [];
      
      for (const event of homeEventsToRemove) {
        const { error: deleteError } = await supabase
          .from('match_events')
          .delete()
          .eq('id', event.id);
        
        if (deleteError) {
          console.error('❌ MatchEventsCreationService: Error removing excess home goal event:', deleteError);
        } else {
          console.log('🗑️ MatchEventsCreationService: Removed excess home goal event:', event.id);
        }
      }
    }

    if (eventsToRemoveAway > 0) {
      const awayEventsToRemove = existingEvents
        ?.filter(e => e.team_id === awayTeam.id)
        .slice(-eventsToRemoveAway) || [];
      
      for (const event of awayEventsToRemove) {
        const { error: deleteError } = await supabase
          .from('match_events')
          .delete()
          .eq('id', event.id);
        
        if (deleteError) {
          console.error('❌ MatchEventsCreationService: Error removing excess away goal event:', deleteError);
        } else {
          console.log('🗑️ MatchEventsCreationService: Removed excess away goal event:', event.id);
        }
      }
    }

    const events: MatchEventData[] = [];

    // Create events for additional home goals
    for (let i = 0; i < eventsNeededHome; i++) {
      events.push({
        fixture_id: fixtureId,
        event_type: 'goal',
        player_name: 'Unknown Player',
        team_id: homeTeam.id,
        event_time: 0,
        description: `Goal for ${homeTeam.name} - needs player assignment`
      });
    }

    // Create events for additional away goals
    for (let i = 0; i < eventsNeededAway; i++) {
      events.push({
        fixture_id: fixtureId,
        event_type: 'goal',
        player_name: 'Unknown Player',
        team_id: awayTeam.id,
        event_time: 0,
        description: `Goal for ${awayTeam.name} - needs player assignment`
      });
    }

    if (events.length > 0) {
      console.log(`📝 MatchEventsCreationService: Creating ${events.length} new goal events`);
      
      for (const event of events) {
        await createMatchEvent(event);
      }
      
      console.log('✅ MatchEventsCreationService: All new goal events created successfully');
    } else {
      console.log('📝 MatchEventsCreationService: No new goal events needed');
    }

    console.log('✅ MatchEventsCreationService: Goal events synchronized with score successfully');

  } catch (error) {
    console.error('❌ MatchEventsCreationService: Error creating goal events with duplicate check:', error);
    throw error;
  }
};
