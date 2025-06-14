
import { Goal, Target, Clock, Zap } from "lucide-react";

const statItems = [
  {
    icon: Goal,
    abbr: "G",
    label: "Goals",
    color: "text-yellow-600 dark:text-yellow-400"
  },
  {
    icon: Target,
    abbr: "A",
    label: "Assists",
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    icon: Clock,
    abbr: "M",
    label: "Minutes Played",
    color: "text-green-600 dark:text-green-400"
  },
  {
    icon: Zap,
    abbr: "★",
    label: "Performance Score",
    color: "text-purple-600 dark:text-purple-400"
  }
];

/**
 * Responsive stat legend for player stat icons.
 * - On mobile (flex-col), stacks vertically.
 * - On wider screens, aligns horizontally.
 * - Muted foreground and small text.
 */
const PlayerStatsLegend = () => (
  <div className="w-full flex flex-col mt-4 items-center">
    <div className="w-full flex flex-col sm:flex-row sm:justify-center flex-wrap gap-x-8 gap-y-2 text-xs text-muted-foreground leading-relaxed">
      {statItems.map(({ icon: Icon, abbr, label, color }, i) => (
        <div key={abbr} className="flex items-center gap-1 min-w-[90px]">
          <Icon className={`inline-block h-4 w-4 ${color}`} aria-hidden="true"/>
          <span className="font-semibold text-foreground">{abbr}</span>
          <span className="ml-1">{`= ${label}`}</span>
        </div>
      ))}
    </div>
  </div>
);

export default PlayerStatsLegend;

