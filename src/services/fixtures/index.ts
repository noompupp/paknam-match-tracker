
import { getAllFixtures, getUpcomingFixtures, getRecentFixtures } from './fixturesQueries';
import { updateFixtureScore } from './fixturesUpdates';

export const fixturesApi = {
  getAll: getAllFixtures,
  getUpcoming: getUpcomingFixtures,
  getRecent: getRecentFixtures,
  updateScore: updateFixtureScore
};
