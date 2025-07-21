import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trophy, Star, Crown, Award, ChevronDown, AlertTriangle, Info, Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { TeamOfTheWeekPlayer, CaptainOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { formatTeamOfTheWeekByPosition } from "@/utils/teamOfTheWeekSelection";
import { validateFormation, suggestPositionCorrections } from "@/utils/positionValidation";
import TeamOfTheWeekPitchDisplay from "./TeamOfTheWeekPitchDisplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MiniPlayerAvatar from "@/components/dashboard/MiniPlayerAvatar";

interface TeamOfTheWeekDisplayProps {
  teamOfTheWeek: TeamOfTheWeekPlayer[];
  captainOfTheWeek: CaptainOfTheWeekPlayer | null;
}

const PlayerCard = ({ player, membersMap, isLarge = false }: { 
  player: TeamOfTheWeekPlayer;
  membersMap: Map<number, any>;
  isLarge?: boolean;
}) => {
  const { t } = useTranslation();
  
  const avatarSize = isLarge ? 85 : 65; // Increased by 30% from original 55px to 72px, with large variant
  
  return (
    <div className={`relative group transition-all duration-300 hover:scale-105 ${isLarge ? 'mx-auto max-w-[200px]' : 'max-w-[160px] mx-auto'}`}>
      {/* Captain Banner */}
      {player.isCaptain && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-totw-captain-gold text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-totw-captain-gold-light">
            <Crown className="inline h-3 w-3 mr-1" />
            CAPTAIN
          </div>
        </div>
      )}
      
      {/* Main Card */}
      <div className={`relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl ${
        player.isCaptain 
          ? 'bg-gradient-to-br from-totw-captain-gold-light via-totw-captain-gold to-totw-captain-gold shadow-xl ring-2 ring-totw-captain-gold' 
          : 'bg-gradient-to-br from-totw-red-light via-white to-totw-red-light shadow-lg border-2 border-totw-red-primary'
      } ${isLarge ? 'rounded-2xl p-6' : 'rounded-xl p-4'}`}>
        
        {/* Hexagonal Avatar Container */}
        <div className="relative mb-4">
          <div className={`relative mx-auto ${isLarge ? 'w-24 h-24' : 'w-20 h-20'}`}>
            {/* Hexagonal Background */}
            <div className={`absolute inset-0 ${
              player.isCaptain 
                ? 'bg-gradient-to-br from-totw-captain-gold to-totw-captain-gold-light' 
                : 'bg-gradient-to-br from-totw-red-primary to-totw-red-secondary'
            } clip-path-hexagon shadow-lg`} />
            
            {/* Avatar with circular clip inside hexagon */}
            <div className={`absolute inset-1 overflow-hidden rounded-full ${
              player.isCaptain ? 'ring-4 ring-totw-captain-gold' : 'ring-3 ring-totw-red-primary'
            }`}>
              <MiniPlayerAvatar
                name={player.player_name}
                imageUrl={membersMap.get(player.player_id)?.ProfileURL || membersMap.get(player.player_id)?.optimized_avatar_url}
                size={avatarSize}
                className="object-cover"
              />
            </div>
            
            {/* Captain Crown Icon */}
            {player.isCaptain && (
              <div className="absolute -top-2 -right-2 bg-totw-captain-gold rounded-full p-1.5 shadow-lg border-2 border-white">
                <Crown className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="text-center space-y-2">
          {/* Player Name */}
          <h3 className={`font-bold text-gray-900 leading-tight ${isLarge ? 'text-lg' : 'text-base'}`}>
            {player.player_name}
          </h3>
          
          {/* Team Badge and Name */}
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4 text-totw-red-secondary" />
            <span className={`font-medium text-gray-700 ${isLarge ? 'text-sm' : 'text-xs'}`}>
              {player.team_name}
            </span>
          </div>
          
          {/* Position Badge */}
          <Badge 
            variant="outline" 
            className={`font-semibold border-totw-red-primary text-totw-red-dark bg-white/90 ${
              isLarge ? 'text-sm py-1 px-3' : 'text-xs py-0.5 px-2'
            }`}
          >
            {player.position}
          </Badge>
          
          {/* Rating */}
          <div className="flex items-center justify-center space-x-1">
            <Star className={`text-totw-captain-gold fill-current ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
            <span className={`font-bold text-totw-red-dark ${isLarge ? 'text-xl' : 'text-lg'}`}>
              {player.rating_data.final_rating.toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-2 right-2 opacity-20">
          <Trophy className="h-6 w-6 text-totw-red-primary" />
        </div>
      </div>
    </div>
  );
};

const CaptainOfTheWeekCard = ({ captain, membersMap }: { 
  captain: CaptainOfTheWeekPlayer;
  membersMap: Map<number, any>;
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-totw-captain-gold-light via-totw-captain-gold to-totw-captain-gold border-2 border-totw-captain-gold shadow-2xl">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4">
          <Trophy className="h-20 w-20 text-white" />
        </div>
        <div className="absolute bottom-4 left-4">
          <Crown className="h-16 w-16 text-white" />
        </div>
      </div>
      
      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-center flex items-center justify-center space-x-2 text-white">
          <Award className="h-6 w-6 drop-shadow-lg" />
          <span className="font-bold text-xl drop-shadow-lg">🏆 Captain of the Week</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 relative">
              {/* Hexagonal Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-totw-captain-gold-light clip-path-hexagon shadow-lg" />
              
              {/* Avatar */}
              <div className="absolute inset-1 overflow-hidden rounded-full ring-4 ring-white">
                <MiniPlayerAvatar
                  name={captain.player_name}
                  imageUrl={membersMap.get(captain.player_id)?.ProfileURL || membersMap.get(captain.player_id)?.optimized_avatar_url}
                  size={90}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="font-bold text-2xl text-white drop-shadow-lg">{captain.player_name}</div>
            <div className="text-white/90 font-medium text-lg drop-shadow-md">
              {captain.team_name} • {captain.position}
            </div>
            
            <Badge className="bg-white text-totw-captain-gold font-bold mt-2 px-3 py-1">
              Team Captain
            </Badge>
            
            <div className="flex items-center space-x-2 mt-3">
              <Star className="h-5 w-5 text-white fill-current drop-shadow-sm" />
              <span className="font-bold text-white text-2xl drop-shadow-lg">
                {captain.rating_data.final_rating.toFixed(1)}
              </span>
            </div>
            
            <div className="text-white/80 text-sm mt-1 drop-shadow-sm">
              Performance Score: {captain.teamPerformanceScore.toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TeamOfTheWeekDisplay: React.FC<TeamOfTheWeekDisplayProps> = ({ 
  teamOfTheWeek,
  captainOfTheWeek 
}) => {
  const { t } = useTranslation();
  
  // Fetch player data for avatars
  const { data: members } = useQuery({
    queryKey: ['members-for-totw-display'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, ProfileURL, optimized_avatar_url, team_id');
      if (error) throw error;
      return data || [];
    }
  });

  const membersMap = new Map(
    (members || []).map(member => [member.id, member])
  );
  
  if (!teamOfTheWeek || teamOfTheWeek.length === 0) {
    return (
      <Card className="border-totw-red-light bg-totw-field-green-light">
        <CardContent className="py-12 text-center">
          <Trophy className="h-16 w-16 text-totw-red-primary mx-auto mb-6" />
          <h3 className="text-xl font-bold text-totw-red-dark mb-2">
            {t("rating.noApprovedRatings")}
          </h3>
          <p className="text-totw-red-secondary">
            {t("rating.approveRatingsFirst")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totwCaptain = teamOfTheWeek.find(p => p.isCaptain);
  
  // Formation validation
  const formationValidation = validateFormation(teamOfTheWeek);
  const positionCorrections = suggestPositionCorrections(teamOfTheWeek);

  return (
    <div className="space-y-8">
      {/* UEFA-Style Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-totw-red-primary via-totw-red-secondary to-totw-red-primary text-white rounded-2xl shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8">
            <Trophy className="h-32 w-32" />
          </div>
          <div className="absolute bottom-4 left-8">
            <Award className="h-24 w-24" />
          </div>
        </div>
        
        <div className="relative z-10 text-center py-8 px-6">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">TEAM OF THE WEEK</h1>
          <p className="text-xl text-white/90 drop-shadow-md">
            7-a-side Formation • {teamOfTheWeek.length} Players Selected
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 fill-current" />
              <span>Top Performers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Captain's Choice</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main TOTW Display - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* TOTW Captain Spotlight */}
          {totwCaptain && (
            <div className="bg-gradient-to-br from-totw-field-green-light to-totw-field-green/20 rounded-2xl p-6 border-2 border-totw-captain-gold shadow-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-totw-red-dark mb-2 flex items-center justify-center space-x-2">
                  <Crown className="h-6 w-6 text-totw-captain-gold" />
                  <span>TEAM CAPTAIN</span>
                </h2>
                <p className="text-totw-red-secondary">Most Valuable Player of the Week</p>
              </div>
              
              <PlayerCard player={totwCaptain} membersMap={membersMap} isLarge={true} />
            </div>
          )}

          {/* 2D Pitch Formation Display */}
          <div className="bg-gradient-to-br from-totw-field-green-light to-totw-field-green/30 rounded-2xl p-6 border-2 border-totw-field-green shadow-lg">
            <h3 className="text-xl font-bold text-totw-red-dark mb-4 text-center">Formation Display</h3>
            <TeamOfTheWeekPitchDisplay teamOfTheWeek={teamOfTheWeek} membersMap={membersMap} />
          </div>

          {/* Player Cards Grid */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-totw-red-light">
            <h3 className="text-xl font-bold text-totw-red-dark mb-6 text-center">Selected Players</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teamOfTheWeek.map((player) => (
                <PlayerCard 
                  key={`${player.player_id}-${player.position}`} 
                  player={player} 
                  membersMap={membersMap} 
                />
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <Card className="border-totw-red-light bg-gradient-to-r from-white to-totw-red-light/20">
            <CardContent className="py-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-totw-red-primary">
                    {teamOfTheWeek.length}
                  </div>
                  <div className="text-sm font-medium text-totw-red-secondary">Players</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-totw-captain-gold">
                    {teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0).toFixed(1)}
                  </div>
                  <div className="text-sm font-medium text-totw-red-secondary">Total Rating</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-totw-red-primary">
                    {(teamOfTheWeek.reduce((acc, p) => acc + p.rating_data.final_rating, 0) / teamOfTheWeek.length).toFixed(1)}
                  </div>
                  <div className="text-sm font-medium text-totw-red-secondary">Avg Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formation Validation Panel */}
          {(!formationValidation.isBalanced || positionCorrections.length > 0) && (
            <Collapsible>
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-3 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors">
                    <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-200">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Formation Analysis</span>
                        {!formationValidation.isBalanced && (
                          <Badge variant="destructive" className="text-xs">
                            Issues Found
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Formation Overview */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Current Formation</div>
                          <div className="text-lg font-bold">{formationValidation.formation}</div>
                          <div className="text-sm text-muted-foreground">
                            GK: {formationValidation.distribution.goalkeepers} • 
                            DF: {formationValidation.distribution.defenders} • 
                            MF: {formationValidation.distribution.midfielders} • 
                            FW: {formationValidation.distribution.forwards}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Balance Status</div>
                          <Badge variant={formationValidation.isBalanced ? "default" : "destructive"}>
                            {formationValidation.isBalanced ? "Balanced" : "Needs Attention"}
                          </Badge>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {formationValidation.recommendations.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center space-x-1">
                            <Info className="h-4 w-4" />
                            <span>Recommendations</span>
                          </div>
                          <ul className="text-sm space-y-1">
                            {formationValidation.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Position Corrections */}
                      {positionCorrections.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Position Corrections Suggested</div>
                          <div className="space-y-2">
                            {positionCorrections.slice(0, 3).map((correction, idx) => (
                              <div key={idx} className="text-xs bg-orange-100 dark:bg-orange-900 p-2 rounded">
                                <div className="font-medium">{correction.playerName}</div>
                                <div className="text-muted-foreground">
                                  {correction.currentPosition} → {correction.suggestedPosition}
                                </div>
                                <div className="text-orange-700 dark:text-orange-300">{correction.reason}</div>
                              </div>
                            ))}
                            {positionCorrections.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{positionCorrections.length - 3} more suggestions
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>

        {/* Captain of the Week Sidebar - Takes 1/3 width */}
        <div className="space-y-6">
          {captainOfTheWeek ? (
            <CaptainOfTheWeekCard captain={captainOfTheWeek} membersMap={membersMap} />
          ) : (
            <Card className="border-totw-red-light bg-totw-field-green-light">
              <CardContent className="py-8 text-center">
                <Award className="h-12 w-12 text-totw-red-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-totw-red-dark mb-2">
                  No Captain of the Week
                </h3>
                <p className="text-sm text-totw-red-secondary">
                  No eligible team captains available
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Additional Stats Card */}
          <Card className="border-totw-red-light bg-gradient-to-br from-white to-totw-red-light/10">
            <CardHeader>
              <CardTitle className="text-totw-red-dark flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Team Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-totw-red-secondary">Highest Rating</span>
                <span className="font-bold text-totw-red-dark">
                  {Math.max(...teamOfTheWeek.map(p => p.rating_data.final_rating)).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-totw-red-secondary">Formation</span>
                <span className="font-bold text-totw-red-dark">{formationValidation.formation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-totw-red-secondary">Teams Represented</span>
                <span className="font-bold text-totw-red-dark">
                  {new Set(teamOfTheWeek.map(p => p.team_name)).size}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamOfTheWeekDisplay;