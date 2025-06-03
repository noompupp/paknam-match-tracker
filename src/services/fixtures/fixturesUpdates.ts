
import { Fixture } from '@/types/database';
import { updateFixtureScore as updateScore } from './scoreUpdateService';

export const updateFixtureScore = async (id: number, homeScore: number, awayScore: number): Promise<Fixture> => {
  return updateScore(id, homeScore, awayScore);
};
