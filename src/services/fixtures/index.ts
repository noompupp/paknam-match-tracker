
import { getAllFixtures, getUpcomingFixtures, getRecentFixtures } from './fixturesQueries';
import { updateFixtureScore } from './fixturesUpdates';
import { matchResetService } from './matchResetService';
import { enhancedDuplicatePreventionService } from './enhancedDuplicatePreventionService';
import { unifiedRefereeService } from './unifiedRefereeService';

export const fixturesApi = {
  getAll: getAllFixtures,
  getUpcoming: getUpcomingFixtures,
  getRecent: getRecentFixtures,
  updateScore: updateFixtureScore
};

export { matchResetService, enhancedDuplicatePreventionService, unifiedRefereeService };
