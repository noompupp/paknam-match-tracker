import { AlertTriangle } from "lucide-react";
import { useSeason } from "@/contexts/SeasonContext";

const HistoricalSeasonBanner = () => {
  const { isViewingHistorical, currentSeason } = useSeason();

  if (!isViewingHistorical || !currentSeason) return null;

  return (
    <div className="bg-amber-100 dark:bg-amber-950/40 border-y border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-2 text-sm flex items-center gap-2 justify-center">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        กำลังดูข้อมูล <strong>ครั้งที่ {currentSeason.season_number}</strong>{" "}
        (ประวัติ — อ่านอย่างเดียว)
      </span>
    </div>
  );
};

export default HistoricalSeasonBanner;