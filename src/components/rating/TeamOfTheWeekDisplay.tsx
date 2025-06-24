
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Crown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TeamOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { formatTeamOfTheWeekByPosition } from "@/utils/teamOfTheWeekSelection";

interface TeamOfTheWeekDisplayProps {
  teamOfTheWeek: TeamOfTheWeekPlayer[];
}

const PlayerCard = ({ player }: { player: TeamOfTheWeekPlayer }) => {
  const { t } = useTranslation();
  
  return (
    <Card className={`relative ${player.isCaptain ? 'border-yellow-400 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      {player.isCaptain && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
          <Crown className="h-4 w-4 text-white" />
        </div>
      )}
      <CardContent className="p-3">
        <div className="text-center space-y-2">
          <div className="font-bold text-sm">{player.player_name}</div>
          <div className="text-xs text-muted-foreground">{player.team_name}</div>
          <Badge variant="outline" className="text-xs">
            {player.position}
          </Badge>
          <div className="flex items-center justify-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-sm font-bold text-green-600">
              {player.rating_data.final_rating.toFixed(2)}
            </span>
          </div>
          {player.isCaptain && (
            <Badge className="bg-yellow-500 text-white text-xs">
              {t('rating.captain')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PositionSection = ({ 
  title, 
  players, 
  icon 
}: { 
  title: string; 
  players: TeamOfTheWeekPlayer[];
  icon: React.ReactNode;
}) => {
  if (players.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {icon}
        <h4 className="font-medium text-sm">{title}</h4>
        <Badge variant="secondary" className="text-xs">
          {players.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {players.map((player) => (
          <PlayerCard key={player.player_id} player={player} />
        ))}
      </div>
    </div>
  );
};

const TeamOfTheWeekDisplay: React.FC<TeamOfTheWeekDisplayProps> = ({ 
  teamOfTheWeek 
}) => {
  const { t } = useTranslation();
  
  if (!teamOfTheWeek || teamOfTheWeek.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">
            {t("rating.noApprovedRatings")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("rating.approveRatingsFirst")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formation = formatTeamOfTheWeekByPosition(teamOfTheWeek);
  const captain = teamOfTheWeek.find(p => p.isCaptain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader className="text-center pb-3">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>{t("rating.teamOfTheWeek")}</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            7-a-side Formation • 7 Players + 1 Captain
          </div>
        </CardHeader>
      </Card>

      {/* Captain Highlight */}
      {captain && (
        <Card className="border-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-center flex items-center justify-center space-x-2 text-lg">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span>{t('rating.captain')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="font-bold text-xl">{captain.player_name}</div>
            <div className="text-muted-foreground">{captain.team_name} • {captain.position}</div>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-bold text-green-600 text-lg">
                {captain.rating_data.final_rating.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formation Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">Squad Formation</CardTitle>
          <div className="text-center text-sm text-muted-foreground">
            {teamOfTheWeek.length}/7 Players Selected
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PositionSection 
            title="Goalkeeper" 
            players={formation.goalkeeper}
            icon={<div className="w-4 h-4 bg-green-500 rounded-full" />}
          />
          
          <PositionSection 
            title="Defenders" 
            players={formation.defenders}
            icon={<div className="w-4 h-4 bg-blue-500 rounded-full" />}
          />
          
          <PositionSection 
            title="Midfielders" 
            players={formation.midfielders}
            icon={<div className="w-4 h-4 bg-purple-500 rounded-full" />}
          />
          
          <PositionSection 
            title="Wingers" 
            players={formation.wingers}
            icon={<div className="w-4 h-4 bg-orange-500 rounded-full" />}
          />
          
          <PositionSection 
            title="Forwards" 
            players={formation.forwards}
            icon={<div className="w-4 h-4 bg-red-500 rounded-full" />}
          />
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {teamOfTheWeek.length}
              </div>
              <div className="text-sm text-muted-foreground">Players Selected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Combined Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamOfTheWeekDisplay;
