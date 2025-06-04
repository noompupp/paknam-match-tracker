
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
    console.log('🟨 CardsAPI: Creating card:', cardData);
    
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
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('❌ CardsAPI: Error deleting card:', error);
      throw new Error(`Failed to delete card: ${error.message}`);
    }

    console.log('✅ CardsAPI: Card deleted successfully');
  }
};
