
import { Badge } from "@/components/ui/badge";
import TeamLogo from "../../teams/TeamLogo";
import OwnGoalDisplay from "./OwnGoalDisplay";
import { separateOwnGoalsFromRegular } from "../utils/ownGoalDataProcessor";

interface MatchSummaryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  isExportMode: boolean;
  formatTime: (seconds: number) => string;
  getGoalTeamId: (goal: any) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const MatchSummaryContent = ({
  fixture,
  goals,
  cards,
  timelineEvents,
  enhancedSuccess,
  enhancedData,
  isExportMode,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: MatchSummaryContentProps) => {
  const homeTeam = fixture.home_team?.name || 'Home Team';
  const awayTeam = fixture.away_team?.name || 'Away Team';
  const homeTeamId = fixture.home_team?.__id__ || fixture.home_team_id;
  const awayTeamId = fixture.away_team?.__id__ || fixture.away_team_id;

  // Separate regular goals from own goals
  const { regularGoals, ownGoals, regularGoalCount, ownGoalCount } = separateOwnGoalsFromRegular(goals);

  // Calculate scores based on regular goals only
  const homeRegularGoals = regularGoals.filter(goal => getGoalTeamId(goal) === homeTeamId);
  const awayRegularGoals = regularGoals.filter(goal => getGoalTeamId(goal) === awayTeamId);

  const homeCards = cards.filter(card => getCardTeamId(card) === homeTeamId);
  const awayCards = cards.filter(card => getCardTeamId(card) === awayTeamId);

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <TeamLogo team={fixture.home_team} size="large" />
            <span className="text-xl font-bold">{homeTeam}</span>
          </div>
          
          <div className="text-3xl font-bold">
            {fixture.home_score ?? homeRegularGoals.length} - {fixture.away_score ?? awayRegularGoals.length}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{awayTeam}</span>
            <TeamLogo team={fixture.away_team} size="large" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {new Date(fixture.match_date).toLocaleDateString()} • {fixture.venue}
        </div>

        {/* Enhanced Data Source Indicator */}
        {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
          <Badge variant="default" className="text-xs">
            Enhanced Timeline Data
          </Badge>
        )}

        {/* Goals Summary with Own Goals Breakdown */}
        {(regularGoalCount > 0 || ownGoalCount > 0) && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Total Goals: {regularGoalCount} regular + {ownGoalCount} own goals</div>
            {ownGoalCount > 0 && (
              <div className="text-red-600 dark:text-red-400">
                ⚠️ {ownGoalCount} own goal{ownGoalCount > 1 ? 's' : ''} recorded
              </div>
            )}
          </div>
        )}
      </div>

      {/* Regular Goals Section */}
      {regularGoalCount > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            ⚽ Regular Goals ({regularGoalCount})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Team Regular Goals */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">{homeTeam}</div>
              {homeRegularGoals.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">No regular goals</div>
              ) : (
                <div className="space-y-1">
                  {homeRegularGoals.map((goal, index) => (
                    <div key={goal.id || index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 p-2 rounded">
                      <span className="text-sm font-medium">{getGoalPlayerName(goal)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(getGoalTime(goal))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Away Team Regular Goals */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">{awayTeam}</div>
              {awayRegularGoals.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">No regular goals</div>
              ) : (
                <div className="space-y-1">
                  {awayRegularGoals.map((goal, index) => (
                    <div key={goal.id || index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 p-2 rounded">
                      <span className="text-sm font-medium">{getGoalPlayerName(goal)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(getGoalTime(goal))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Own Goals Section */}
      <OwnGoalDisplay
        goals={goals}
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        formatTime={formatTime}
      />

      {/* Cards Section */}
      {cards.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            🟨🟥 Cards ({cards.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Team Cards */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">{homeTeam}</div>
              {homeCards.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">No cards</div>
              ) : (
                <div className="space-y-1">
                  {homeCards.map((card, index) => (
                    <div key={card.id || index} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded">
                      <span className="text-sm font-medium">{getCardPlayerName(card)}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={isCardRed(card) ? 'destructive' : 'secondary'} className="text-xs">
                          {getCardType(card)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(getCardTime(card))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Away Team Cards */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">{awayTeam}</div>
              {awayCards.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">No cards</div>
              ) : (
                <div className="space-y-1">
                  {awayCards.map((card, index) => (
                    <div key={card.id || index} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded">
                      <span className="text-sm font-medium">{getCardPlayerName(card)}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={isCardRed(card) ? 'destructive' : 'secondary'} className="text-xs">
                          {getCardType(card)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(getCardTime(card))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchSummaryContent;
