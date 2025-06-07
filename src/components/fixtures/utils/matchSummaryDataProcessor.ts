
// Main exports - re-exporting from focused modules
export {
  getGoalTeamId,
  getGoalPlayerName,
  getGoalAssistPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
} from './dataExtractors';

export {
  normalizeTeamId,
  compareTeamIds
} from './teamMatching';

export {
  filterGoalsByTeam
} from './goalFiltering';

export {
  processUnifiedMatchData
} from './dataProcessing';
