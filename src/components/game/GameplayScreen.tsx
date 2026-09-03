import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFaceRegions } from "@/hooks/useFaceRegions";
import { preloadPhotos } from "@/services/game/playerPhoto";
import { warmFaceRegions } from "@/services/game/faceDetection";
import type {
  GamePlayer,
  GameQuestion,
  LevelConfig,
} from "@/services/game/guessGameTypes";
import type { FacePart } from "@/services/game/guessGameTypes";
import ChoiceGrid from "./components/ChoiceGrid";
import FaceCropView from "./components/FaceCropView";
import NameAutocomplete from "./components/NameAutocomplete";
import { ArrowRight, Check, Lightbulb, Loader2, X } from "lucide-react";

interface GameplayScreenProps {
  config: LevelConfig;
  question: GameQuestion;
  /** Upcoming questions, so their photos can be fetched ahead of time. */
  upcoming: GameQuestion[];
  roster: GamePlayer[];
  questionNumber: number;
  totalQuestions: number;
  score: number;
  stage: number;
  visibleParts: FacePart[];
  revealsLeft: number;
  eliminatedIds: string[];
  isAnswered: boolean;
  lastAnswerCorrect: boolean | null;
  wrongGuessCount: number;
  onGuessChoice: (choice: GamePlayer) => void;
  onGuessTyped: (name: string) => void;
  onReveal: () => void;
  onNext: () => void;
}

/** A light blur on the first look, clearing as more of the face is revealed. */
const blurForStage = (stage: number): number => Math.max(0, 2 - stage * 1.5);

const GameplayScreen = ({
  config,
  question,
  upcoming,
  roster,
  questionNumber,
  totalQuestions,
  score,
  stage,
  visibleParts,
  revealsLeft,
  eliminatedIds,
  isAnswered,
  lastAnswerCorrect,
  wrongGuessCount,
  onGuessChoice,
  onGuessTyped,
  onReveal,
  onNext,
}: GameplayScreenProps) => {
  const photoUrl = question.player.photoUrl ?? "";
  const { regions, isResolving } = useFaceRegions(photoUrl);

  // Fetch and analyse the next few photos while the player is thinking, so the
  // following question can show its crops straight away.
  useEffect(() => {
    const next = upcoming.slice(0, 3).map((q) => q.player.photoUrl);
    preloadPhotos(next);
    warmFaceRegions(next);
  }, [upcoming]);

  return (
    <div className="space-y-4">
      {/* Progress and score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            ข้อที่ {questionNumber}/{totalQuestions}
          </span>
          <span className="font-bold text-primary">{score} คะแนน</span>
        </div>
        <Progress
          value={((questionNumber - 1) / totalQuestions) * 100}
          className="h-2"
        />
      </div>

      <Card className="border-border">
        <CardContent className="space-y-4 p-4">
          {isResolving ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : regions ? (
            <FaceCropView
              key={`${question.player.id}-${wrongGuessCount}`}
              photoUrl={photoUrl}
              regions={regions}
              visibleParts={visibleParts}
              blurPx={isAnswered ? 0 : blurForStage(stage)}
            />
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              ไม่มีรูปสำหรับข้อนี้
            </p>
          )}

          {/* Answer feedback */}
          {isAnswered && (
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-3 text-center font-semibold animate-fade-in",
                lastAnswerCorrect
                  ? "bg-green-500/15 text-green-700 dark:text-green-400"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {lastAnswerCorrect ? (
                <Check className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <span>
                {lastAnswerCorrect ? "ถูกต้อง! " : "เฉลย: "}
                {question.player.displayName}
              </span>
            </div>
          )}

          {/* Answer input */}
          {config.choiceCount ? (
            <ChoiceGrid
              choices={question.choices}
              eliminatedIds={eliminatedIds}
              answerId={isAnswered ? question.player.id : null}
              disabled={isAnswered}
              onSelect={onGuessChoice}
            />
          ) : (
            <div className="space-y-2">
              <NameAutocomplete
                roster={roster}
                disabled={isAnswered}
                onSubmit={onGuessTyped}
              />
              {!isAnswered && eliminatedIds.length === 0 && wrongGuessCount > 0 && (
                <p className="text-center text-xs text-destructive">
                  ยังไม่ใช่ ลองอีกครั้ง
                </p>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            {isAnswered ? (
              <Button onClick={onNext} className="w-full gap-2">
                {questionNumber >= totalQuestions ? "ดูผลลัพธ์" : "ข้อถัดไป"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Badge variant="outline" className="shrink-0">
                  เหลือใบ้ {Math.max(revealsLeft, 0)} ครั้ง
                </Badge>
                <Button
                  variant="secondary"
                  onClick={onReveal}
                  className="gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  {revealsLeft > 0 ? "ขอใบ้" : "ยอมแพ้ ดูเฉลย"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameplayScreen;
