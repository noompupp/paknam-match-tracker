
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

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <button 
          onClick={() => setCardsExpanded(!cardsExpanded)}
          className="w-full flex items-center justify-between mb-6 text-xl font-bold text-yellow-700 hover:text-yellow-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6" />
            Disciplinary ({cards.length})
          </div>
          {cardsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {cardsExpanded && (
          <div className="space-y-4">
            {cards.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-dashed border-yellow-200">
                <AlertTriangle className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-yellow-600">No cards issued in this match</p>
                <p className="text-sm text-yellow-500">Disciplinary actions will appear here</p>
              </div>
            ) : (
              cards.map((card, index) => {
                const isHomeCard = getCardTeamId(card) === fixture?.home_team_id;
                const teamLogo = isHomeCard ? fixture.home_team?.logoURL : fixture.away_team?.logoURL;
                const teamName = isHomeCard ? fixture.home_team?.name : fixture.away_team?.name;
                const teamColor = isHomeCard ? teamData.homeTeamColor : teamData.awayTeamColor;
                const cardType = getCardType(card);
                const isRed = isCardRed(card);
                
                return (
                  <div 
                    key={`card-${card.id}-${index}`} 
                    className={`flex items-center gap-6 p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow ${
                      isRed 
                        ? 'bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border-red-200' 
                        : 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-yellow-200'
                    }`}
                  >
                    <TeamLogoDisplay 
                      teamName={teamName}
                      teamLogo={teamLogo}
                      teamColor={teamColor}
                      size="md"
                      showName={false}
                    />
                    
                    <div className="flex-1 flex items-center gap-4">
                      <span className="text-2xl">{isRed ? '🟥' : '🟨'}</span>
                      <div className="font-bold text-xl">
                        {getCardPlayerName(card)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={isRed ? 'destructive' : 'outline'} 
                        className={`font-bold text-lg px-4 py-2 ${
                          !isRed ? 'bg-yellow-500 text-white border-yellow-500' : ''
                        }`}
                      >
                        {cardType.toUpperCase()}
                      </Badge>
                      <span className="text-base text-muted-foreground font-mono font-bold">
                        {formatMinutes(getCardTime(card))}'
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisciplinarySection;
