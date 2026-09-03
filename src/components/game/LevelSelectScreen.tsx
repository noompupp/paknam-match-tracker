import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LEVELS, LEVEL_ORDER, QUESTIONS_PER_ROUND } from "@/services/game/guessGameEngine";
import { readHighScores } from "@/services/game/guessGameStorage";
import type { GameLevel } from "@/services/game/guessGameTypes";
import StarRating from "./components/StarRating";
import { ChevronRight, Trophy, Users } from "lucide-react";

interface LevelSelectScreenProps {
  /** How many roster members have a photo, i.e. can be asked about. */
  playableCount: number;
  onSelectLevel: (level: GameLevel) => void;
}

const LevelSelectScreen = ({
  playableCount,
  onSelectLevel,
}: LevelSelectScreenProps) => {
  const highScores = readHighScores();
  const questionCount = Math.min(QUESTIONS_PER_ROUND, playableCount);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3.5 w-3.5" />
          สมาชิกที่มีรูป {playableCount} คน
        </Badge>
        <Badge variant="secondary">{questionCount} ข้อต่อรอบ</Badge>
      </div>

      <div className="grid gap-3">
        {LEVEL_ORDER.map((level) => {
          const config = LEVELS[level];
          const best = highScores[level];

          return (
            <Card
              key={level}
              className="group cursor-pointer border-border transition-all hover:border-primary/60 hover:shadow-md"
              onClick={() => onSelectLevel(level)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-lg font-bold text-primary">
                  {level}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{config.title}</h3>
                    <StarRating value={config.stars} />
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {config.hint}
                  </p>
                  {best && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Trophy className="h-3.5 w-3.5" />
                      สถิติสูงสุด {best.score} คะแนน ({best.correctCount}/
                      {best.totalQuestions})
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground group-hover:text-primary"
                  aria-label={`เริ่มเล่นระดับ ${level} ${config.title}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelectScreen;
