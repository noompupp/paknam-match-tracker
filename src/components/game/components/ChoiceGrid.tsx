import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GamePlayer } from "@/services/game/guessGameTypes";
import { Check, X } from "lucide-react";

interface ChoiceGridProps {
  choices: GamePlayer[];
  /** Ids already guessed and wrong on this question. */
  eliminatedIds: string[];
  /** Set once the question is over, so the right answer can be highlighted. */
  answerId: string | null;
  disabled: boolean;
  onSelect: (choice: GamePlayer) => void;
}

const ChoiceGrid = ({
  choices,
  eliminatedIds,
  answerId,
  disabled,
  onSelect,
}: ChoiceGridProps) => (
  <div
    className={cn(
      "grid gap-2",
      choices.length > 4 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
    )}
  >
    {choices.map((choice) => {
      const isEliminated = eliminatedIds.includes(choice.id);
      const isAnswer = answerId === choice.id;

      return (
        <Button
          key={choice.id}
          variant="outline"
          onClick={() => onSelect(choice)}
          disabled={disabled || isEliminated}
          className={cn(
            "h-auto min-h-[3rem] whitespace-normal px-3 py-2 text-sm font-medium transition-all",
            isAnswer &&
              "border-green-500 bg-green-500/15 text-green-700 dark:text-green-400",
            isEliminated &&
              !isAnswer &&
              "border-destructive/40 bg-destructive/10 text-muted-foreground line-through opacity-70",
            !isEliminated &&
              !isAnswer &&
              "hover:border-primary hover:bg-primary/10"
          )}
        >
          <span className="flex items-center gap-1.5">
            {isAnswer && <Check className="h-4 w-4 shrink-0" />}
            {isEliminated && !isAnswer && <X className="h-4 w-4 shrink-0" />}
            <span className="break-words">{choice.displayName}</span>
          </span>
        </Button>
      );
    })}
  </div>
);

export default ChoiceGrid;
