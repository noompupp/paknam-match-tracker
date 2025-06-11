
import { Target, Timer, CreditCard, BarChart3, LucideIcon } from "lucide-react";

export interface RefereeTabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const refereeTabItems: RefereeTabItem[] = [
  {
    value: "score",
    label: "Score",
    icon: Target
  },
  {
    value: "timer-tracking", 
    label: "Timer & Tracking",
    icon: Timer
  },
  {
    value: "cards",
    label: "Cards", 
    icon: CreditCard
  },
  {
    value: "summary",
    label: "Summary",
    icon: BarChart3
  }
];
