import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuessGame } from "@/hooks/useGuessGame";
import { useGuessGameRoster } from "@/hooks/useGuessGameRoster";
import type { GameLevel } from "@/services/game/guessGameTypes";
import { warmFaceRegions } from "@/services/game/faceDetection";
import { preloadPhotos } from "@/services/game/playerPhoto";
import GameplayScreen from "./GameplayScreen";
import LevelSelectScreen from "./LevelSelectScreen";
import ResultScreen from "./ResultScreen";
import { AlertCircle, ArrowLeft, Gamepad2 } from "lucide-react";

/** Fewest photographed members needed before a round is worth playing. */
const MIN_PLAYABLE = 4;

/**
 * "Guess the member" — identify a club member from cropped parts of their
 * profile photo, over five difficulty levels.
 */
const GuessMemberGame = () => {
  const { data, isLoading, error, refetch } = useGuessGameRoster();
  const game = useGuessGame();
  const [screen, setScreen] = useState<"levels" | "playing">("levels");

  const roster = data?.roster ?? [];
  const playable = data?.playable ?? [];

  // Load the detection models and analyse a few photos while the player is
  // still choosing a level: the first detection has to fetch the models, which
  // takes long enough to miss the first question otherwise.
  useEffect(() => {
    const first = (data?.playable ?? []).slice(0, 4).map((p) => p.photoUrl);
    if (!first.length) return;
    preloadPhotos(first);
    warmFaceRegions(first);
  }, [data]);

  const startLevel = (level: GameLevel) => {
    game.start(level, playable, roster);
    setScreen("playing");
  };

  const header = (
    <div className="mb-4 flex items-center gap-3">
      {screen === "playing" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setScreen("levels")}
          aria-label="กลับไปหน้าเลือกระดับ"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5">
          <Gamepad2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">ทายชื่อสมาชิก</h1>
          <p className="text-xs text-muted-foreground">
            เดาว่าใครจากตา จมูก และปาก
          </p>
        </div>
      </div>
    </div>
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="border-destructive/40">
          <CardContent className="space-y-3 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="font-medium">โหลดรายชื่อสมาชิกไม่สำเร็จ</p>
            <Button onClick={() => refetch()} variant="outline">
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (playable.length < MIN_PLAYABLE) {
      return (
        <Card className="border-amber-500/40">
          <CardContent className="space-y-2 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
            <p className="font-medium">ยังเล่นไม่ได้</p>
            <p className="text-sm text-muted-foreground">
              ฤดูกาลนี้มีสมาชิกที่มีรูปโปรไฟล์เพียง {playable.length} คน
              ต้องมีอย่างน้อย {MIN_PLAYABLE} คนจึงจะเริ่มเกมได้
            </p>
          </CardContent>
        </Card>
      );
    }

    if (screen === "levels") {
      return (
        <LevelSelectScreen
          playableCount={playable.length}
          onSelectLevel={startLevel}
        />
      );
    }

    if (game.phase === "finished" && game.summary) {
      return (
        <ResultScreen
          summary={game.summary}
          isNewHighScore={game.isNewHighScore}
          onPlayAgain={() => startLevel(game.level)}
          onBackToLevels={() => setScreen("levels")}
        />
      );
    }

    if (!game.question) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            เตรียมคำถาม…
          </CardContent>
        </Card>
      );
    }

    return (
      <GameplayScreen
        config={game.config}
        question={game.question}
        upcoming={game.questions.slice(game.questionIndex + 1)}
        roster={roster}
        questionNumber={game.questionIndex + 1}
        totalQuestions={game.questions.length}
        score={game.score}
        stage={game.stage}
        visibleParts={game.visibleParts}
        revealsLeft={game.revealsLeft}
        eliminatedIds={game.eliminatedIds}
        isAnswered={game.phase === "answered"}
        lastAnswerCorrect={game.lastAnswerCorrect}
        wrongGuessCount={game.wrongGuessCount}
        onGuessChoice={game.guessChoice}
        onGuessTyped={game.guessTyped}
        onReveal={game.reveal}
        onNext={game.next}
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-4">
      {header}
      {renderBody()}
    </div>
  );
};

export default GuessMemberGame;
