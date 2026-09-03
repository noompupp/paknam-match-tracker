import type {
  GameLevel,
  GamePlayer,
  GameQuestion,
  LevelConfig,
  QuestionResult,
  RoundSummary,
} from "./guessGameTypes";

/** Questions in a full round, when enough photographed players are available. */
export const QUESTIONS_PER_ROUND = 10;

/** Score kept when answering after 0, 1, 2 or 3 reveals. */
const STAGE_MULTIPLIERS = [1, 0.6, 0.35, 0.15];

export const LEVELS: Record<GameLevel, LevelConfig> = {
  1: {
    level: 1,
    title: "ง่ายมาก",
    titleEn: "Very easy",
    hint: "เห็น ตา + จมูก + ปาก พร้อมกัน",
    hintEn: "Eyes, nose and mouth together",
    stars: 1,
    stages: [["eyes", "nose", "mouth"], ["full"]],
    choiceCount: 4,
    basePoints: 100,
  },
  2: {
    level: 2,
    title: "ง่าย",
    titleEn: "Easy",
    hint: "เห็น ตา + ปาก",
    hintEn: "Eyes and mouth",
    stars: 2,
    stages: [["eyes", "mouth"], ["eyes", "nose", "mouth"], ["full"]],
    choiceCount: 4,
    basePoints: 150,
  },
  3: {
    level: 3,
    title: "ปานกลาง",
    titleEn: "Medium",
    hint: "เห็น ตา อย่างเดียว",
    hintEn: "Eyes only",
    stars: 3,
    stages: [["eyes"], ["eyes", "nose"], ["eyes", "nose", "mouth"], ["full"]],
    choiceCount: 4,
    basePoints: 200,
  },
  4: {
    level: 4,
    title: "ยาก",
    titleEn: "Hard",
    hint: "เห็น จมูก อย่างเดียว · 6 ตัวเลือก",
    hintEn: "Nose only · 6 choices",
    stars: 4,
    stages: [["nose"], ["nose", "eyes"], ["nose", "eyes", "mouth"], ["full"]],
    choiceCount: 6,
    basePoints: 300,
  },
  5: {
    level: 5,
    title: "ยากมาก",
    titleEn: "Very hard",
    hint: "เห็น ปาก อย่างเดียว · พิมพ์ชื่อเอง",
    hintEn: "Mouth only · type the name",
    stars: 5,
    stages: [["mouth"], ["mouth", "eyes"], ["mouth", "eyes", "nose"], ["full"]],
    choiceCount: null,
    basePoints: 400,
  },
};

export const LEVEL_ORDER: GameLevel[] = [1, 2, 3, 4, 5];

/** Reveals available before the answer is given away. */
export const maxRevealsFor = (config: LevelConfig): number =>
  config.stages.length - 1;

export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Points for an answer.
 *
 * Answering with less of the face revealed is worth more; a wrong final answer
 * scores nothing.
 */
export const scoreAnswer = (
  config: LevelConfig,
  stageUsed: number,
  correct: boolean
): number => {
  if (!correct) return 0;
  const multiplier =
    STAGE_MULTIPLIERS[Math.min(stageUsed, STAGE_MULTIPLIERS.length - 1)];
  return Math.round(config.basePoints * multiplier);
};

/** Best possible score for a round: every question right with nothing revealed. */
export const maxScoreForRound = (
  config: LevelConfig,
  questionCount: number
): number => config.basePoints * questionCount;

/**
 * Build the multiple-choice options for a question: the answer plus decoys
 * drawn from the rest of the roster, shuffled together.
 */
const buildChoices = (
  answer: GamePlayer,
  roster: GamePlayer[],
  choiceCount: number
): GamePlayer[] => {
  const seenNames = new Set([answer.displayName]);
  const decoyPool = roster.filter((p) => {
    if (p.id === answer.id) return false;
    // Two members sharing a display name would make the question unanswerable.
    if (seenNames.has(p.displayName)) return false;
    seenNames.add(p.displayName);
    return true;
  });

  const decoys = shuffle(decoyPool).slice(0, Math.max(choiceCount - 1, 0));
  return shuffle([answer, ...decoys]);
};

/**
 * Assemble a round.
 *
 * @param playable Players that have a photo — only these can be asked about.
 * @param roster   The whole season roster, used as the decoy pool.
 */
export const buildRound = (
  playable: GamePlayer[],
  roster: GamePlayer[],
  level: GameLevel,
  questionCount: number = QUESTIONS_PER_ROUND
): GameQuestion[] => {
  const config = LEVELS[level];
  const subjects = shuffle(playable).slice(0, Math.min(questionCount, playable.length));

  return subjects.map((player) => ({
    player,
    choices: config.choiceCount
      ? buildChoices(player, roster, config.choiceCount)
      : [],
  }));
};

/** Stars awarded for a completed round, from the share of the maximum scored. */
export const starsForRound = (score: number, maxScore: number): number => {
  if (maxScore <= 0) return 0;
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  if (ratio >= 0.25) return 1;
  return 0;
};

export const summariseRound = (
  level: GameLevel,
  results: QuestionResult[],
  questionCount: number
): RoundSummary => {
  const config = LEVELS[level];
  const score = results.reduce((total, r) => total + r.points, 0);
  const maxScore = maxScoreForRound(config, questionCount);

  return {
    level,
    score,
    maxScore,
    correctCount: results.filter((r) => r.correct).length,
    totalQuestions: questionCount,
    stars: starsForRound(score, maxScore),
    results,
  };
};

/** Normalise a typed answer for comparison: trim, fold case, collapse spaces. */
const normaliseAnswer = (value: string): string =>
  value.trim().toLocaleLowerCase().replace(/\s+/g, " ");

/**
 * Whether a typed answer identifies the player.
 *
 * Display name, nickname and full name are all accepted, since members are
 * known by different ones.
 */
export const isTypedAnswerCorrect = (
  typed: string,
  player: GamePlayer
): boolean => {
  const needle = normaliseAnswer(typed);
  if (!needle) return false;

  return [player.displayName, player.nickname, player.fullName]
    .filter((name): name is string => !!name)
    .some((name) => normaliseAnswer(name) === needle);
};
