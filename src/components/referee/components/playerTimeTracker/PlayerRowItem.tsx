
import { Checkbox } from "@/components/ui/checkbox";
import PlayerRoleBadge from "@/components/ui/player-role-badge";
import React from "react";

interface PlayerRowItemProps {
  player: any;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: () => void;
}

const PlayerRowItem = ({
  player,
  isSelected,
  canSelect,
  onToggle,
}: PlayerRowItemProps) => {
  // Keyboard handler for accessibility
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggle();
    }
  };

  const baseClass =
    `p-3 border rounded-lg transition-colors outline-none
    flex items-center gap-3
    ${isSelected
      ? 'border-primary bg-primary/10'
      : canSelect
        ? 'border-border hover:border-primary/50 hover:bg-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/40'
        : 'border-border opacity-60'
    }
    cursor-pointer
    active:bg-primary/30
    focus-visible:ring-2
    focus-visible:ring-primary
    select-none
    `;

  return (
    <div
      className={baseClass}
      tabIndex={canSelect ? 0 : -1}
      role="checkbox"
      aria-checked={isSelected}
      aria-disabled={!canSelect}
      onClick={() => canSelect && onToggle()}
      onKeyDown={canSelect ? onKeyDown : undefined}
      data-selected={isSelected}
      data-disabled={!canSelect}
    >
      {/* Checkbox: visual only, not interactive */}
      <div className="pointer-events-none">
        <Checkbox
          checked={isSelected}
          tabIndex={-1}
        />
      </div>

      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
        {player.number || '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{player.name}</span>
          <PlayerRoleBadge role={player.role || 'Starter'} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default PlayerRowItem;
