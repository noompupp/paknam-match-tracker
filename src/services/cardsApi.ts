
import { supabase } from '@/integrations/supabase/client';

export interface Card {
  id: number;
  fixture_id: number;
  player_id: number;
  player_name: string;
  team_id: number;
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

    const { data, error } = await supabase
      .from('cards')
      .insert([cardData])
      .select()
      .single();

    if (error) {
      console.error('❌ CardsAPI: Error creating card:', error);
      throw new Error(`Failed to create card: ${error.message}`);
    }

    console.log('✅ CardsAPI: Card created successfully:', data);
    return data as Card;
  },

  async getByFixture(fixtureId: number): Promise<Card[]> {
    console.log('🔍 CardsAPI: Fetching cards for fixture:', fixtureId);
    
    if (!fixtureId || fixtureId <= 0) {
      throw new Error('Invalid fixture ID provided');
    }
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('fixture_id', fixtureId)
      .order('event_time', { ascending: true });

    if (error) {
      console.error('❌ CardsAPI: Error fetching cards:', error);
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    console.log('📊 CardsAPI: Cards fetched successfully:', data);
    return (data || []) as Card[];
  },

  async getByPlayer(playerId: number): Promise<Card[]> {
    console.log('🔍 CardsAPI: Fetching cards for player:', playerId);
    
    if (!playerId || playerId <= 0) {
      throw new Error('Invalid player ID provided');
    }
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ CardsAPI: Error fetching player cards:', error);
      throw new Error(`Failed to fetch player cards: ${error.message}`);
    }

    return (data || []) as Card[];
  },

  async delete(cardId: number): Promise<void> {
    console.log('🗑️ CardsAPI: Deleting card:', cardId);
    
    if (!cardId || cardId <= 0) {
      throw new Error('Invalid card ID provided');
    }
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('❌ CardsAPI: Error deleting card:', error);
      throw new Error(`Failed to delete card: ${error.message}`);
    }

    console.log('✅ CardsAPI: Card deleted successfully');
  },

  async checkForSecondYellow(playerId: number, fixtureId: number): Promise<boolean> {
    console.log('🔍 CardsAPI: Checking for existing yellow cards:', { playerId, fixtureId });
    
    const { data, error } = await supabase
      .from('cards')
      .select('id')
      .eq('player_id', playerId)
      .eq('fixture_id', fixtureId)
      .eq('card_type', 'yellow');

    if (error) {
      console.error('❌ CardsAPI: Error checking for yellow cards:', error);
      return false;
    }

    const hasYellowCard = (data || []).length > 0;
    console.log('📊 CardsAPI: Yellow card check result:', hasYellowCard);
    return hasYellowCard;
  }
};
