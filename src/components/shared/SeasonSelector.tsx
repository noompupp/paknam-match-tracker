import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSeason } from "@/contexts/SeasonContext";

const SeasonSelector = () => {
  const { seasons, currentSeasonId, setCurrentSeasonId, defaultSeason, loading } =
    useSeason();

  if (loading || seasons.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentSeasonId ?? undefined}
        onValueChange={(v) => setCurrentSeasonId(v)}
      >
        <SelectTrigger className="h-9 w-[180px] sm:w-[220px] text-xs sm:text-sm">
          <SelectValue placeholder="เลือกฤดูกาล" />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((s) => {
            const isDefault = defaultSeason?.id === s.id;
            return (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <span>ครั้งที่ {s.season_number}</span>
                  <span className="text-xs text-muted-foreground">
                    {isDefault ? "(ปัจจุบัน)" : "(ประวัติ)"}
                  </span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SeasonSelector;