import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  LEVELS,
  buildRound,
  isTypedAnswerCorrect,
  maxRevealsFor,
  scoreAnswer,
  summariseRound,
} from "@/services/game/guessGameEngine";
import { saveHighScore } from "@/services/game/guessGameStorage";
import type {
  GameLevel,
  GamePlayer,
  GameQuestion,
  QuestionResult,
  RoundSummary,
} from "@/services/game/guessGameTypes";

/**
 * Round state machine for the guess-the-member game.
 *
 * A question starts with only the parts the level allows. A wrong answer or a
 * hint reveals one more part and lowers what the question is still worth; once
 * the reveals run out the answer is shown and the question scores nothing.
 */

export type GamePhase = "playing" | "answered" | "finished";

interface GameState {
  level: GameLevel;
  questions: GameQuestion[];
  questionIndex: number;
  /** Index into the level's stage list — how much of the face is revealed. */
  stage: number;
  /** Choice ids already tried and found wrong on this question. */
  eliminatedIds: string[];
  phase: GamePhase;
  /** Whether the question just answered was answered correctly. */
  lastAnswerCorrect: boolean | null;
  results: QuestionResult[];
  summary: RoundSummary | null;
  /** Bumped on a wrong guess so the UI can replay its shake animation. */
  wrongGuessCount: number;
}

type GameAction =
  | { type: "start"; level: GameLevel; questions: GameQuestion[] }
  | { type: "guess"; correct: boolean; choiceId?: string }
  | { type: "reveal" }
  | { type: "next" };

const initialState: GameState = {
  level: 1,
  questions: [],
  questionIndex: 0,
  stage: 0,
  eliminatedIds: [],
  phase: "playing",
  lastAnswerCorrect: null,
  results: [],
  summary: null,
  wrongGuessCount: 0,
};

/** Record a finished question and either move on or end the round. */
const settleQuestion = (
  state: GameState,
  correct: boolean
): GameState => {
  const config = LEVELS[state.level];
  const question = state.questions[state.questionIndex];

  const result: QuestionResult = {
    playerId: question.player.id,
    correct,
    stageUsed: state.stage,
    points: scoreAnswer(config, state.stage, correct),
  };

  return {
    ...state,
    phase: "answered",
    lastAnswerCorrect: correct,
    // The answer is shown on the full photo.
    stage: config.stages.length - 1,
    results: [...state.results, result],
  };
};

const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "start":
      return {
        ...initialState,
        level: action.level,
        questions: action.questions,
      };

    case "guess": {
      if (state.phase !== "playing") return state;
      if (action.correct) return settleQuestion(state, true);

      const config = LEVELS[state.level];
      const eliminatedIds = action.choiceId
        ? [...state.eliminatedIds, action.choiceId]
        : state.eliminatedIds;

      // Out of reveals: the guess was the last chance.
      if (state.stage >= maxRevealsFor(config)) {
        return settleQuestion({ ...state, eliminatedIds }, false);
      }

      return {
        ...state,
        stage: state.stage + 1,
        eliminatedIds,
        wrongGuessCount: state.wrongGuessCount + 1,
      };
    }

    case "reveal": {
      if (state.phase !== "playing") return state;
      const config = LEVELS[state.level];

      // Asking for a hint on the last stage gives the answer away.
      if (state.stage >= maxRevealsFor(config)) {
        return settleQuestion(state, false);
      }

      return { ...state, stage: state.stage + 1 };
    }

    case "next": {
      if (state.phase !== "answered") return state;

      const nextIndex = state.questionIndex + 1;
      if (nextIndex >= state.questions.length) {
        const summary = summariseRound(
          state.level,
          state.results,
          state.questions.length
        );
        return { ...state, phase: "finished", summary };
      }

      return {
        ...state,
        questionIndex: nextIndex,
        stage: 0,
        eliminatedIds: [],
        phase: "playing",
        lastAnswerCorrect: null,
      };
    }

    default:
      return state;
  }
};

export const useGuessGame = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const config = LEVELS[state.level];
  const question = state.questions[state.questionIndex] ?? null;

  const start = useCallback(
    (level: GameLevel, playable: GamePlayer[], roster: GamePlayer[]) => {
      dispatch({
        type: "start",
        level,
        questions: buildRound(playable, roster, level),
      });
    },
    []
  );

  const guessChoice = useCallback(
    (choice: GamePlayer) => {
      if (!question) return;
      dispatch({
        type: "guess",
        correct: choice.id === question.player.id,
        choiceId: choice.id,
      });
    },
    [question]
  );

  const guessTyped = useCallback(
    (typed: string) => {
      if (!question) return;
      dispatch({
        type: "guess",
        correct: isTypedAnswerCorrect(typed, question.player),
      });
    },
    [question]
  );

  const reveal = useCallback(() => dispatch({ type: "reveal" }), []);
  const next = useCallback(() => dispatch({ type: "next" }), []);

  const visibleParts = useMemo(
    () => config.stages[Math.min(state.stage, config.stages.length - 1)],
    [config, state.stage]
  );

  const revealsLeft = maxRevealsFor(config) - state.stage;

  // Persist the record once the round ends.
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  useEffect(() => {
    if (!state.summary) {
      setIsNewHighScore(false);
      return;
    }
    setIsNewHighScore(saveHighScore(state.summary));
  }, [state.summary]);

  const score = state.results.reduce((total, r) => total + r.points, 0);

  return {
    ...state,
    config,
    question,
    visibleParts,
    revealsLeft,
    score,
    isNewHighScore,
    start,
    guessChoice,
    guessTyped,
    reveal,
    next,
  };
};
