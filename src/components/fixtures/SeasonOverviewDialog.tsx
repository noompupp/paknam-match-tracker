import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { groupFixturesByDate } from "@/utils/dateGroupingUtils";
import { getThreeLetterAbbreviation } from "@/utils/teamAbbreviations";
import { Fixture } from "@/types/database";
import { cn } from "@/lib/utils";

interface SeasonOverviewDialogProps {
  fixtures: Fixture[];
  isOpen: boolean;
  onClose: () => void;
  onFixtureClick?: (fixture: Fixture) => void;
}

const SeasonOverviewDialog = ({ fixtures, isOpen, onClose, onFixtureClick }: SeasonOverviewDialogProps) => {
  const groups = groupFixturesByDate(fixtures || []);

  const total = fixtures?.length || 0;
  const completed = fixtures?.filter((f: any) => f.status === "completed").length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Season Schedule Overview
          </DialogTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Badge variant="secondary">{groups.length} matchdays</Badge>
            <Badge variant="secondary">{total} fixtures</Badge>
            <Badge variant="secondary">{completed} completed</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="p-4 space-y-4">
            {groups.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No fixtures available.</p>
            ) : (
              groups.map((group) => (
                <div key={group.date} className="space-y-2">
                  <div className="flex items-center justify-between gap-2 sticky top-0 bg-background/95 backdrop-blur py-1.5 z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold border",
                          group.isFinalGameweek
                            ? "bg-amber-400/20 text-amber-700 border-amber-400"
                            : "bg-primary/10 text-primary border-primary/40"
                        )}
                      >
                        {group.gameweekLabel || `MD${group.gameweek ?? ""}`}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {group.displayDate}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {group.fixtures.length} {group.fixtures.length === 1 ? "match" : "matches"}
                    </span>
                  </div>

                  <div className="divide-y border rounded-md overflow-hidden">
                    {group.fixtures.map((fx: any) => {
                      const homeName = fx.home_team?.name || fx.home_team_id || "TBD";
                      const awayName = fx.away_team?.name || fx.away_team_id || "TBD";
                      const isCompleted = fx.status === "completed";
                      const isLive = fx.status === "live";
                      return (
                        <button
                          key={fx.id}
                          onClick={() => onFixtureClick?.(fx)}
                          className="w-full grid grid-cols-[64px_1fr_72px_1fr_auto] items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left"
                        >
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {fx.match_time ? fx.match_time.slice(0, 5) : "--:--"}
                          </span>
                          <span className="font-medium text-right truncate" title={homeName}>
                            {getThreeLetterAbbreviation(homeName)}
                          </span>
                          <span
                            className={cn(
                              "text-center font-bold tabular-nums px-2 py-0.5 rounded",
                              isCompleted && "bg-primary/10 text-primary",
                              isLive && "bg-red-500/15 text-red-600 animate-pulse",
                              !isCompleted && !isLive && "text-muted-foreground"
                            )}
                          >
                            {isCompleted || isLive
                              ? `${fx.home_score ?? 0} - ${fx.away_score ?? 0}`
                              : "vs"}
                          </span>
                          <span className="font-medium truncate" title={awayName}>
                            {getThreeLetterAbbreviation(awayName)}
                          </span>
                          <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground max-w-[120px] truncate">
                            {fx.venue && (
                              <>
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{fx.venue}</span>
                              </>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SeasonOverviewDialog;