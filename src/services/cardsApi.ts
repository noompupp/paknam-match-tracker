
import { supabase } from '@/integrations/supabase/client';

export interface Card {
  id: number;
  fixture_id: number;
  player_id: number;
  player_name: string;
  team_id: string; // Updated to string to match match_events table
  card_type: 'yellow' | 'red';
  event_time: number;
  created_at: string;
  description?: string;
}

export const cardsApi = {
  async create(cardData: Omit<Card, 'id' | 'created_at'>): Promise<Card> {
    console.log('🟨 CardsAPI: Creating card with improved validation:', cardData);
    
    // Validate required fields
    if (!cardData.fixture_id || !cardData.player_id || !cardData.team_id || !cardData.player_name) {
      throw new Error('Missing required card data: fixture_id, player_id, team_id, and player_name are required');
    }

    if (!['yellow', 'red'].includes(cardData.card_type)) {
      throw new Error('Invalid card type. Must be "yellow" or "red"');
    }

    // Create match event for card
    const { data, error } = await supabase
      .from('match_events')
      .insert([{
        fixture_id: cardData.fixture_id,
        event_type: cardData.card_type,
        player_name: cardData.player_name,
        team_id: cardData.team_id,
        event_time: cardData.event_time,
        description: cardData.description || `${cardData.card_type} card for ${cardData.player_name}`,
        card_type: cardData.card_type
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ CardsAPI: Error creating card:', error);
      throw new Error(`Failed to create card: ${error.message}`);
    }

    console.log('✅ CardsAPI: Card created successfully:', data);
    
    // Transform match_events data to Card format
    return {
      id: data.id,
      fixture_id: data.fixture_id,
      player_id: cardData.player_id, // Use original player_id
      player_name: data.player_name,
      team_id: data.team_id,
      card_type: data.card_type as 'yellow' | 'red',
      event_time: data.event_time,
      created_at: data.created_at,
      description: data.description
    } as Card;
  },

  async getByFixture(fixtureId: number): Promise<Card[]> {
    console.log('🔍 CardsAPI: Fetching cards for fixture:', fixtureId);
    
    if (!fixtureId || fixtureId <= 0) {
      throw new Error('Invalid fixture ID provided');
    }
    
    const { data, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .in('event_type', ['yellow', 'red'])
      .order('event_time', { ascending: true });

    if (error) {
      console.error('❌ CardsAPI: Error fetching cards:', error);
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    console.log('📊 CardsAPI: Cards fetched successfully:', data);
    
    // Transform match_events data to Card format
    return (data || []).map(event => ({
      id: event.id,
      fixture_id: event.fixture_id,
      player_id: 0, // We don't store player_id in match_events, would need to lookup
      player_name: event.player_name,
      team_id: event.team_id,
      card_type: event.event_type as 'yellow' | 'red',
      event_time: event.event_time,
      created_at: event.created_at,
      description: event.description
    })) as Card[];
  },

  async getByPlayer(playerId: number): Promise<Card[]> {
    console.log('🔍 CardsAPI: Fetching cards for player:', playerId);
    
    if (!playerId || playerId <= 0) {
      throw new Error('Invalid player ID provided');
    }
    
    // Get player name first
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('name')
      .eq('id', playerId)
      .single();

    if (memberError || !member) {
      throw new Error(`Player with ID ${playerId} not found`);
    }
    
    const { data, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('player_name', member.name)
      .in('event_type', ['yellow', 'red'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ CardsAPI: Error fetching player cards:', error);
      throw new Error(`Failed to fetch player cards: ${error.message}`);
    }

    // Transform match_events data to Card format
    return (data || []).map(event => ({
      id: event.id,
      fixture_id: event.fixture_id,
      player_id: playerId,
      player_name: event.player_name,
      team_id: event.team_id,
      card_type: event.event_type as 'yellow' | 'red',
      event_time: event.event_time,
      created_at: event.created_at,
      description: event.description
    })) as Card[];
  },

  async delete(cardId: number): Promise<void> {
    console.log('🗑️ CardsAPI: Deleting card:', cardId);
    
    if (!cardId || cardId <= 0) {
      throw new Error('Invalid card ID provided');
    }
    
    const { error } = await supabase
      .from('match_events')
      .delete()
      .eq('id', cardId)
      .in('event_type', ['yellow', 'red']);

    if (error) {
      console.error('❌ CardsAPI: Error deleting card:', error);
      throw new Error(`Failed to delete card: ${error.message}`);
    }

    console.log('✅ CardsAPI: Card deleted successfully');
  },

  async checkForSecondYellow(playerId: number, fixtureId: number): Promise<boolean> {
    console.log('🔍 CardsAPI: Checking for existing yellow cards:', { playerId, fixtureId });
    
    // Get player name first
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('name')
      .eq('id', playerId)
      .single();

    if (memberError || !member) {
      console.error('❌ CardsAPI: Error fetching player:', memberError);
      return false;
    }
    
    const { data, error } = await supabase
      .from('match_events')
      .select('id')
      .eq('player_name', member.name)
      .eq('fixture_id', fixtureId)
      .eq('event_type', 'yellow');

    if (error) {
      console.error('❌ CardsAPI: Error checking for yellow cards:', error);
      return false;
    }

    const hasYellowCard = (data || []).length > 0;
    console.log('📊 CardsAPI: Yellow card check result:', hasYellowCard);
    return hasYellowCard;
  }
};
