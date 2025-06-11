
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamLogo from "../../teams/TeamLogo";
import { Fixture } from "@/types/database";
import { sortFixturesChronologically } from "@/utils/fixtureDataProcessor";

interface MobileOptimizedFixtureSelectProps {
  fixtures: Fixture[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MobileOptimizedFixtureSelect = ({
  fixtures,
  selectedFixture,
  onFixtureChange,
  placeholder = "Select a match",
  disabled = false,
  className
}: MobileOptimizedFixtureSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Use the improved sorting utility
  const sortedFixtures = sortFixturesChronologically(fixtures);

  const selectedFixtureData = sortedFixtures.find(f => f.id.toString() === selectedFixture);

  const truncateTeamName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (fixtureId: string) => {
    onFixtureChange(fixtureId);
    setOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "dark:bg-background dark:border-border dark:text-foreground dark:hover:bg-accent",
          "mobile-fixture-select-trigger",
          open && "ring-2 ring-ring ring-offset-2",
          className
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedFixtureData ? (
            <>
              <TeamLogo team={selectedFixtureData.home_team} size="small" className="flex-shrink-0" />
              <span className="font-medium truncate">
                {truncateTeamName(selectedFixtureData.home_team?.name || 'TBD', 6)}
              </span>
              <span className="text-muted-foreground text-xs flex-shrink-0">vs</span>
              <span className="font-medium truncate">
                {truncateTeamName(selectedFixtureData.away_team?.name || 'TBD', 6)}
              </span>
              <TeamLogo team={selectedFixtureData.away_team} size="small" className="flex-shrink-0" />
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform flex-shrink-0 ml-2", open && "rotate-180")} />
      </button>
      
      {open && (
        <div className="mobile-fixture-dropdown-container">
          <div className="mobile-fixture-dropdown-content">
            {sortedFixtures.map((fixture) => (
              <div
                key={fixture.id}
                className="mobile-fixture-item"
                onClick={() => handleSelect(fixture.id.toString())}
              >
                <div className="flex items-center gap-2 py-3 px-3 w-full min-w-0">
                  <TeamLogo team={fixture.home_team} size="small" className="flex-shrink-0" />
                  <span className="font-medium truncate text-sm">
                    {truncateTeamName(fixture.home_team?.name || 'TBD', 8)}
                  </span>
                  <span className="text-muted-foreground text-xs flex-shrink-0">vs</span>
                  <span className="font-medium truncate text-sm">
                    {truncateTeamName(fixture.away_team?.name || 'TBD', 8)}
                  </span>
                  <TeamLogo team={fixture.away_team} size="small" className="flex-shrink-0" />
                  <div className="flex flex-col items-end gap-1 ml-auto flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {new Date(fixture.match_date).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                      fixture.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      fixture.status === 'live' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {fixture.status}
                    </span>
                  </div>
                  {selectedFixture === fixture.id.toString() && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedFixtureSelect;
