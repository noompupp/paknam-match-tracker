
import { getAllFixtures, getUpcomingFixtures, getRecentFixtures } from './fixturesQueries';
import { updateFixtureScore } from './fixturesUpdates';
import { matchResetService } from './matchResetService';
import { enhancedDuplicatePreventionService } from './enhancedDuplicatePreventionService';

export const fixturesApi = {
  getAll: getAllFixtures,
  getUpcoming: getUpcomingFixtures,
  getRecent: getRecentFixtures,
  updateScore: updateFixtureScore
};

export { matchResetService, enhancedDuplicatePreventionService };
