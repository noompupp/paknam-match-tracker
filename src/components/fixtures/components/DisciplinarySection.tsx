
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";

interface DisciplinarySectionProps {
  cards: any[];
  fixture: any;
  teamData: {
    homeTeamColor: string;
    awayTeamColor: string;
  };
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const DisciplinarySection = ({
  cards,
  fixture,
  teamData,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: DisciplinarySectionProps) => {
  const [cardsExpanded, setCardsExpanded] = useState(false);

  const formatMinutes = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

  // Enhanced color fallback system
  const getEnhancedTeamColor = (color: string, fallback: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white') {
      return fallback;
    }
    return color;
  };

  const enhancedHomeColor = getEnhancedTeamColor(teamData.homeTeamColor, '#1f2937');
  const enhancedAwayColor = getEnhancedTeamColor(teamData.awayTeamColor, '#7c3aed');

  return (
    <Card className="border-2 animate-fade-in">
      <CardContent className="pt-6">
        <button 
          onClick={() => setCardsExpanded(!cardsExpanded)}
          className="w-full flex items-center justify-between mb-6 text-xl font-bold text-yellow-700 hover:text-yellow-600 transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-100 group-hover:bg-yellow-200 transition-colors duration-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            Disciplinary ({cards.length})
          </div>
          <div className="transition-transform duration-300 group-hover:scale-110">
            {cardsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </button>
        
        {/* Smooth accordion animation */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          cardsExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-4 pt-2">
            {cards.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-dashed border-yellow-200 animate-fade-in">
                <div className="animate-bounce mb-4">
                  <AlertTriangle className="h-12 w-12 text-yellow-300 mx-auto" />
                </div>
                <p className="text-lg font-medium text-yellow-600 mb-2">No cards issued in this match</p>
                <p className="text-sm text-yellow-500">Disciplinary actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map((card, index) => {
                  const isHomeCard = getCardTeamId(card) === fixture?.home_team_id;
                  const teamLogo = isHomeCard ? fixture.home_team?.logoURL : fixture.away_team?.logoURL;
                  const teamName = isHomeCard ? fixture.home_team?.name : fixture.away_team?.name;
                  const teamColor = isHomeCard ? enhancedHomeColor : enhancedAwayColor;
                  const cardType = getCardType(card);
                  const isRed = isCardRed(card);
                  
                  return (
                    <div 
                      key={`card-${card.id}-${index}`} 
                      className={`flex items-center gap-6 p-6 rounded-xl border-2 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in ${
                        isRed 
                          ? 'bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border-red-200 hover:border-red-300' 
                          : 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-yellow-200 hover:border-yellow-300'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className="transition-transform duration-300 hover:scale-110">
                        <TeamLogoDisplay 
                          teamName={teamName}
                          teamLogo={teamLogo}
                          teamColor={teamColor}
                          size="md"
                          showName={false}
                        />
                      </div>
                      
                      <div className="flex-1 flex items-center gap-4">
                        <span className="text-2xl animate-pulse">{isRed ? '🟥' : '🟨'}</span>
                        <div className="font-bold text-xl text-gray-800 leading-tight">
                          {getCardPlayerName(card)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={isRed ? 'destructive' : 'outline'} 
                          className={`font-bold text-lg px-4 py-2 transition-all duration-300 hover:scale-105 ${
                            !isRed ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600' : 'hover:bg-red-600'
                          }`}
                        >
                          {cardType.toUpperCase()}
                        </Badge>
                        <span className="text-base text-muted-foreground font-mono font-bold tabular-nums">
                          {formatMinutes(getCardTime(card))}'
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisciplinarySection;
