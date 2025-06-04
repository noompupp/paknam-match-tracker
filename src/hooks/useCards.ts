
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi, Card } from '@/services/cardsApi';

export const useCards = (fixtureId?: number) => {
  return useQuery({
    queryKey: ['cards', fixtureId],
    queryFn: async () => {
      if (!fixtureId) return [];
      console.log('🎣 useCards: Starting query for fixture:', fixtureId);
      try {
        const cards = await cardsApi.getByFixture(fixtureId);
        console.log('🎣 useCards: Query successful, cards:', cards);
        return cards;
      } catch (error) {
        console.error('🎣 useCards: Query failed:', error);
        throw error;
      }
    },
    enabled: !!fixtureId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cardData: Omit<Card, 'id' | 'created_at'>) =>
      cardsApi.create(cardData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards', data.fixture_id] });
      queryClient.invalidateQueries({ queryKey: ['matchEvents', data.fixture_id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const usePlayerCards = (playerId?: number) => {
  return useQuery({
    queryKey: ['playerCards', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      return await cardsApi.getByPlayer(playerId);
    },
    enabled: !!playerId,
  });
};
