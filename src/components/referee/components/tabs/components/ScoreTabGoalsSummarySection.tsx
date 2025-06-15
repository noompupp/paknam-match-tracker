
import React from "react";
import GoalsSummary from "./GoalsSummary";
import { MatchGoal } from "@/stores/match/types";

interface Props {
  goals: any[]; // now enhanced DB or local format
  formatTime: (seconds: number) => string;
}

const ScoreTabGoalsSummarySection = ({ goals, formatTime }: Props) => {
  if (!goals?.length) return null;
  return <GoalsSummary goals={goals} formatTime={formatTime} />;
};

export default ScoreTabGoalsSummarySection;
