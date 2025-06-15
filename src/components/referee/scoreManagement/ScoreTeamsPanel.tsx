
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import React from "react";

interface ScoreTeamsPanelProps {
  homeTeam: any;
  awayTeam: any;
  homeScore: number;
  awayScore: number;
  onAddGoal: (team: 'home' | 'away') => void;
  onRemoveGoal: (team: 'home' | 'away') => void;
}

const getTeamLogo = (team: any) => {
  if (team?.logoURL) {
    return (
      <img
        src={team.logoURL}
        alt={`${team.name} logo`}
        className="w-6 h-6 object-contain rounded border border-gray-200"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }
  return <span className="text-xl">{team?.logo || '⚽'}</span>;
};

const ScoreTeamsPanel: React.FC<ScoreTeamsPanelProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  onAddGoal,
  onRemoveGoal,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {getTeamLogo(homeTeam)}
          <span className="text-xl hidden">{homeTeam?.logo || '⚽'}</span>
        </div>
        <span className="font-medium">{homeTeam?.name}</span>
        <Badge variant="outline" className="text-xs">Home</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onRemoveGoal('home')} disabled={homeScore <= 0}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-3xl font-bold w-12 text-center bg-background rounded px-2 py-1">
          {homeScore}
        </span>
        <Button size="sm" onClick={() => onAddGoal('home')}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {getTeamLogo(awayTeam)}
          <span className="text-xl hidden">{awayTeam?.logo || '⚽'}</span>
        </div>
        <span className="font-medium">{awayTeam?.name}</span>
        <Badge variant="outline" className="text-xs">Away</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onRemoveGoal('away')} disabled={awayScore <= 0}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-3xl font-bold w-12 text-center bg-background rounded px-2 py-1">
          {awayScore}
        </span>
        <Button size="sm" onClick={() => onAddGoal('away')}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

export default ScoreTeamsPanel;
