import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GamePlayer } from "@/services/game/guessGameTypes";
import { Send } from "lucide-react";

interface NameAutocompleteProps {
  /** The full roster, used as the suggestion list. */
  roster: GamePlayer[];
  disabled: boolean;
  onSubmit: (name: string) => void;
}

const MAX_SUGGESTIONS = 6;

/** Free-text answer box with roster name suggestions, used on the hardest level. */
const NameAutocomplete = ({
  roster,
  disabled,
  onSubmit,
}: NameAutocompleteProps) => {
  const [value, setValue] = useState("");

  const suggestions = useMemo(() => {
    const needle = value.trim().toLocaleLowerCase();
    if (!needle) return [];

    return roster
      .filter((player) =>
        [player.displayName, player.nickname, player.fullName].some((name) =>
          name?.toLocaleLowerCase().includes(needle)
        )
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [roster, value]);

  const submit = (name: string) => {
    if (disabled || !name.trim()) return;
    onSubmit(name);
    setValue("");
  };

  return (
    <div className="space-y-2">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="พิมพ์ชื่อสมาชิก…"
          disabled={disabled}
          autoComplete="off"
          aria-label="พิมพ์ชื่อสมาชิก"
          className="flex-1"
        />
        <Button type="submit" disabled={disabled || !value.trim()} size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">ส่งคำตอบ</span>
        </Button>
      </form>

      {suggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => submit(player.displayName)}
              className={cn(
                "rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium",
                "transition-colors hover:border-primary hover:bg-primary/10"
              )}
            >
              {player.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NameAutocomplete;
