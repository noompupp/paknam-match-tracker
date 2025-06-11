
export const WORKFLOW_MODES = {
  TWO_REFEREES: 'two_referees' as const,
  MULTI_REFEREE: 'multi_referee' as const
};

export const WORKFLOW_MODE_LABELS = {
  [WORKFLOW_MODES.TWO_REFEREES]: 'Two Referees Mode',
  [WORKFLOW_MODES.MULTI_REFEREE]: 'Multi-Referee Mode'
};

export const WORKFLOW_MODE_DESCRIPTIONS = {
  [WORKFLOW_MODES.TWO_REFEREES]: 'One referee per team - simplified coordination with clear team-based responsibilities',
  [WORKFLOW_MODES.MULTI_REFEREE]: 'Four specialized referees - comprehensive coverage with role-based assignments'
};

export const TWO_REFEREES_RESPONSIBILITIES = {
  PRIMARY: ['score_goals', 'time_tracking'] as const,
  SECONDARY: ['cards_discipline'] as const
};

export const MULTI_REFEREE_ROLES = {
  SCORE_GOALS: 'score_goals' as const,
  CARDS_DISCIPLINE: 'cards_discipline' as const,
  TIME_TRACKING: 'time_tracking' as const,
  COORDINATION: 'coordination' as const
};
