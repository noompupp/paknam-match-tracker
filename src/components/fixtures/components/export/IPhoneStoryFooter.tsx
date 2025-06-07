
import { Trophy } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";

interface IPhoneStoryFooterProps {
  homeGoals: any[];
  awayGoals: any[];
  cards: any[];
  timelineEvents: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  fixture: any;
}

const IPhoneStoryFooter = ({ 
  homeGoals, 
  awayGoals, 
  cards, 
  timelineEvents, 
  homeTeamColor, 
  awayTeamColor,
  fixture 
}: IPhoneStoryFooterProps) => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t-2 border-gray-200 p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center">
          <TeamLogoDisplay 
            teamName={fixture.home_team?.name || 'Home'}
            teamLogo={fixture.home_team?.logoURL}
            teamColor={homeTeamColor}
            size="sm"
            showName={false}
          />
          <div className="text-xl font-bold mt-2 mb-1" style={{ color: homeTeamColor }}>
            {homeGoals.length}
          </div>
          <div className="text-xs text-slate-600 font-medium">Goals</div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mb-2">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div className="text-xl font-bold mb-1 text-amber-600">
            {cards.length}
          </div>
          <div className="text-xs text-slate-600 font-medium">Cards</div>
        </div>
        
        <div className="flex flex-col items-center">
          <TeamLogoDisplay 
            teamName={fixture.away_team?.name || 'Away'}
            teamLogo={fixture.away_team?.logoURL}
            teamColor={awayTeamColor}
            size="sm"
            showName={false}
          />
          <div className="text-xl font-bold mt-2 mb-1" style={{ color: awayTeamColor }}>
            {awayGoals.length}
          </div>
          <div className="text-xs text-slate-600 font-medium">Goals</div>
        </div>
      </div>
      
      <div className="text-center mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-slate-500">
          {timelineEvents.length} total events
        </div>
      </div>
    </div>
  );
};

export default IPhoneStoryFooter;
