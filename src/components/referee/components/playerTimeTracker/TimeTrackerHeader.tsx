import { CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Clock } from "lucide-react";
import { SEVEN_A_SIDE_CONSTANTS, isSecondHalf, getCurrentHalfTime } from "@/utils/timeUtils";
import { useTranslation } from "@/hooks/useTranslation";

interface TimeTrackerHeaderProps {
  matchTime: number;
  formatTime: (seconds: number) => string;
}

const TimeTrackerHeader = ({ matchTime, formatTime }: TimeTrackerHeaderProps) => {
  const { t } = useTranslation();
  const currentHalf = isSecondHalf(matchTime) ? 2 : 1;
  const halfProgress = getCurrentHalfTime(matchTime);
  const halfProgressPercent = Math.min((halfProgress / SEVEN_A_SIDE_CONSTANTS.HALF_DURATION) * 100, 100);

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Timer className="h-5 w-5" />
        {t("referee.timeTracker")}
      </CardTitle>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {t("referee.timer.half")
              .replace("{half}", currentHalf.toString())
              .replace("{time}", formatTime(halfProgress))}
          </span>
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${halfProgressPercent}%` }}
          />
        </div>
      </div>
    </CardHeader>
  );
};

export default TimeTrackerHeader;
