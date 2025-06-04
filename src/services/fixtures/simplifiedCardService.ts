
import { supabase } from '@/integrations/supabase/client';
import { incrementMemberCards } from './memberStatsUpdateService';

interface CardAssignmentData {
  fixtureId: number;
  playerId: number;
  playerName: string;
  teamId: string;
  cardType: 'yellow' | 'red';
  eventTime: number;
}

export const assignCardToPlayer = async (data: CardAssignmentData) => {
  console.log('🟨🟥 SimplifiedCardService: Starting card assignment:', data);
  
  try {
    // Validate input
    if (!data.playerId || !data.playerName || !data.teamId || !data.fixtureId) {
      throw new Error('Missing required data for card assignment');
    }

    // Ensure teamId is a string and handle numeric values
    const teamIdString = String(data.teamId);

    // Check for existing yellow cards if this is a yellow card
    let isSecondYellow = false;
    if (data.cardType === 'yellow') {
      const { data: existingYellows, error: yellowError } = await supabase
        .from('match_events')
        .select('id')
        .eq('fixture_id', data.fixtureId)
        .eq('player_name', data.playerName)
        .eq('event_type', 'yellow_card');

      if (yellowError) {
        console.error('❌ SimplifiedCardService: Error checking existing yellow cards:', yellowError);
      } else if (existingYellows && existingYellows.length >= 1) {
        isSecondYellow = true;
        console.log('⚠️ SimplifiedCardService: Second yellow card detected - will create red card event');
      }
    }

    // Create match event for the card using consistent event types
    const eventType = data.cardType === 'yellow' ? 'yellow_card' : 'red_card';
    
    const { data: matchEvent, error: eventError } = await supabase
      .from('match_events')
      .insert({
        fixture_id: data.fixtureId,
        event_type: eventType,
        player_name: data.playerName,
        team_id: teamIdString,
        event_time: data.eventTime,
        card_type: data.cardType,
        description: `${data.cardType} card for ${data.playerName}`
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ SimplifiedCardService: Error creating card event:', eventError);
      throw new Error(`Failed to create card event: ${eventError.message}`);
    }

    // Update member stats directly
    await incrementMemberCards(data.playerId, data.cardType, 1);

    // If this is a second yellow, also create a red card event and update red card stats
    if (isSecondYellow) {
      console.log('🟥 SimplifiedCardService: Creating automatic red card for second yellow');
      
      const { error: redEventError } = await supabase
        .from('match_events')
        .insert({
          fixture_id: data.fixtureId,
          event_type: 'red_card',
          player_name: data.playerName,
          team_id: teamIdString,
          event_time: data.eventTime,
          card_type: 'red',
          description: `Automatic red card for ${data.playerName} (second yellow)`
        });

      if (redEventError) {
        console.error('❌ SimplifiedCardService: Error creating automatic red card:', redEventError);
      } else {
        await incrementMemberCards(data.playerId, 'red', 1);
      }
    }

    console.log('✅ SimplifiedCardService: Card assigned successfully');
    return { matchEvent, isSecondYellow };

  } catch (error) {
    console.error('❌ SimplifiedCardService: Critical error:', error);
    throw error;
  }
};

export const checkForSecondYellow = async (fixtureId: number, playerName: string): Promise<boolean> => {
  try {
    const { data: yellowCards, error } = await supabase
      .from('match_events')
      .select('id')
      .eq('fixture_id', fixtureId)
      .eq('player_name', playerName)
      .eq('event_type', 'yellow_card');

    if (error) {
      console.error('❌ SimplifiedCardService: Error checking yellow cards:', error);
      return false;
    }

    return (yellowCards?.length || 0) >= 1;
  } catch (error) {
    console.error('❌ SimplifiedCardService: Error in checkForSecondYellow:', error);
    return false;
  }
};
