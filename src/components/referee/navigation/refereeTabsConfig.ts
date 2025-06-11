
import { Target, Timer, CreditCard, BarChart3 } from "lucide-react";

export interface RefereeTabItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export const refereeTabItems: RefereeTabItem[] = [
  {
    value: "score",
    label: "Score",
    icon: <Target className="h-4 w-4" />
  },
  {
    value: "timer-tracking", 
    label: "Timer & Tracking",
    icon: <Timer className="h-4 w-4" />
  },
  {
    value: "cards",
    label: "Cards", 
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    value: "summary",
    label: "Summary",
    icon: <BarChart3 className="h-4 w-4" />
  }
];
