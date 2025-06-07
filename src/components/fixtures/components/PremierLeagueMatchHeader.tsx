
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";

interface PremierLeagueMatchHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const PremierLeagueMatchHeader = ({ fixture, homeTeamColor, awayTeamColor }: PremierLeagueMatchHeaderProps) => {
  const getResult = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'Home Win';
    if (awayScore > homeScore) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'text-green-600';
    if (awayScore > homeScore) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <Card className="overflow-hidden">
      {/* Team Color Bar */}
      <div 
        className="h-2"
        style={{
          background: `linear-gradient(to right, ${homeTeamColor} 0%, ${homeTeamColor} 50%, ${awayTeamColor} 50%, ${awayTeamColor} 100%)`
        }}
      />
      
      <CardContent className="p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Match Info Bar */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{fixture.match_date}</span>
          </div>
          {fixture.venue && (
            <>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{fixture.venue}</span>
              </div>
            </>
          )}
          <span className="text-slate-300">•</span>
          <Badge variant="outline" className="bg-white border-2 font-bold text-sm px-4 py-1.5">
            {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
          </Badge>
        </div>

        {/* Teams and Score - Premier League Style */}
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center gap-6 flex-1">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={homeTeamColor}
              size="lg"
              showName={false}
            />
            <div className="text-center">
              <div className="text-lg font-bold text-muted-foreground mb-2">
                {fixture.home_team?.name || 'Home'}
              </div>
              <div 
                className="text-7xl font-black leading-none"
                style={{ color: homeTeamColor }}
              >
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* Center Score Separator */}
          <div className="text-center px-12">
            <div className="text-4xl font-extralight text-slate-300 mb-4">—</div>
            <Badge 
              variant="outline" 
              className={`${getResultColor()} border-2 font-bold text-lg px-6 py-2 bg-white shadow-sm`}
            >
              {getResult()}
            </Badge>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-6 flex-1 justify-end">
            <div className="text-center">
              <div className="text-lg font-bold text-muted-foreground mb-2">
                {fixture.away_team?.name || 'Away'}
              </div>
              <div 
                className="text-7xl font-black leading-none"
                style={{ color: awayTeamColor }}
              >
                {fixture.away_score || 0}
              </div>
            </div>
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={awayTeamColor}
              size="lg"
              showName={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremierLeagueMatchHeader;
