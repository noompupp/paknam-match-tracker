import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LEVELS } from "@/services/game/guessGameEngine";
import type { RoundSummary } from "@/services/game/guessGameTypes";
import StarRating from "./components/StarRating";
import { Home, RotateCcw, Sparkles } from "lucide-react";

interface ResultScreenProps {
  summary: RoundSummary;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onBackToLevels: () => void;
}

const praiseFor = (stars: number): string => {
  if (stars >= 3) return "เก่งมาก! จำหน้าเพื่อนได้แม่นสุด ๆ";
  if (stars === 2) return "ดีมาก! อีกนิดเดียวก็เต็มแล้ว";
  if (stars === 1) return "ไม่เลว ลองอีกรอบน่าจะดีขึ้น";
  return "ยังไหว! ลองใหม่อีกครั้ง";
};

const ResultScreen = ({
  summary,
  isNewHighScore,
  onPlayAgain,
  onBackToLevels,
}: ResultScreenProps) => {
  const config = LEVELS[summary.level];

  return (
    <div className="space-y-4">
      <Card className="border-primary/30">
        <CardContent className="space-y-4 p-6 text-center">
          <Badge variant="secondary" className="mx-auto">
            ระดับ {summary.level} · {config.title}
          </Badge>

          <StarRating
            value={summary.stars}
            total={3}
            size="lg"
            className="justify-center"
          />

          <div>
            <p className="text-4xl font-bold text-primary">{summary.score}</p>
            <p className="text-sm text-muted-foreground">
              จากเต็ม {summary.maxScore} คะแนน
            </p>
          </div>

          {isNewHighScore && (
            <p className="flex items-center justify-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              ทำลายสถิติเดิม!
            </p>
          )}

          <p className="text-muted-foreground">
            ตอบถูก {summary.correctCount} จาก {summary.totalQuestions} ข้อ
          </p>

          <p className="font-medium">{praiseFor(summary.stars)}</p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBackToLevels} className="flex-1 gap-2">
          <Home className="h-4 w-4" />
          เลือกระดับ
        </Button>
        <Button onClick={onPlayAgain} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          เล่นอีกครั้ง
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;
