
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import TeamLogo from "./TeamLogo";
import { Team } from "@/types/database";
import React from "react";

// Utility: Detect if a string contains any Thai characters (for debug)
const containsThai = (text: string | undefined | null): boolean => {
  if (!text) return false;
  // Thai Unicode range: \u0E00-\u0E7F
  return /[\u0E00-\u0E7F]/.test(text);
};

interface TeamCardProps {
  team: Team;
  onViewSquad: (teamId: string) => void;
}

const TeamCard = ({ team, onViewSquad }: TeamCardProps) => {
  // Debug logging: log the full team object and captain whenever this renders
  React.useEffect(() => {
    console.log("[TeamCard Debug] Rendering for team:", team.name, {
      teamId: team.id,
      __id__: team.__id__,
      captain: team.captain,
      color: team.color,
    });
    if (team.captain) {
      if (containsThai(team.captain)) {
        console.log("[TeamCard Debug] Captain has Thai characters:", team.captain);
      } else {
        console.log("[TeamCard Debug] Captain (non-Thai):", team.captain);
      }
    } else {
      console.log("[TeamCard Debug] Captain is missing!");
    }
  }, [team]);

  // Fallback: show "TBD" if empty/undefined, otherwise display name
  // If captain has Thai, add a small badge for visual confirmation
  const captainDisplay = team.captain && team.captain.trim() !== ""
    ? (
      <span>
        <span
          className={containsThai(team.captain) ? "font-bold text-pink-600" : ""}
          style={{
            // Force a font that supports Thai for debugging (if fails, fallback to system-ui)
            fontFamily: containsThai(team.captain)
              ? `'Noto Sans Thai', 'Noto Sans', 'Tahoma', 'Arial', 'sans-serif'`
              : undefined,
          }}
        >
          {team.captain}
        </span>
        {containsThai(team.captain) && (
          <span className="ml-1 px-1 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[10px] align-middle border border-yellow-200">
            ไทย
          </span>
        )}
      </span>
    ) : (
      <span className="italic text-muted-foreground">TBD</span>
    );

  return (
    <Card className="card-shadow-lg hover:card-shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4 h-16">
          <TeamLogo team={team} size="large" />
        </div>
        <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">#{team.position}</Badge>
          <Badge className="bg-primary text-primary-foreground text-xs">{team.points} pts</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Team Color:</span>
          <div className="flex items-center gap-2">
            {team.color && (
              <div 
                className="w-4 h-4 rounded-full border border-gray-300" 
                style={{ backgroundColor: team.color }}
              />
            )}
            <span className="font-semibold">{team.color || 'Not specified'}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Captain:</span>
          <span className="font-semibold">
            {captainDisplay}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Record:</span>
          <span className="font-semibold">
            {team.won}W-{team.drawn}D-{team.lost}L
          </span>
        </div>
        <Button 
          className="w-full mt-4 bg-primary hover:bg-primary/90" 
          size="sm"
          onClick={() => onViewSquad(team.__id__)}
        >
          View Squad <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeamCard;

