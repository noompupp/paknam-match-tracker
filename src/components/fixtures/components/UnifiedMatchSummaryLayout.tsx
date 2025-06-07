
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import IPhoneStoryLayout from "./export/IPhoneStoryLayout";
import EnhancedMatchEventsTimeline from "../../referee/components/EnhancedMatchEventsTimeline";
import PremierLeagueMatchHeader from "./PremierLeagueMatchHeader";
import MatchEventsSection from "./MatchEventsSection";
import DisciplinarySection from "./DisciplinarySection";
import MatchStatisticsSummary from "./MatchStatisticsSummary";
import { useEffect, useState } from "react";

interface UnifiedMatchSummaryLayoutProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
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

const UnifiedMatchSummaryLayout = ({
  fixture,
  goals,
  cards,
  timelineEvents,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: UnifiedMatchSummaryLayoutProps) => {
  const isMobile = useIsMobile();
  const [isExportMode, setIsExportMode] = useState(false);
  
  // Extract team data using the existing utility with enhanced color handling
  const teamData = extractTeamData(fixture);
  
  // Enhanced color fallback system
  const getEnhancedTeamColor = (color: string, fallback: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white') {
      return fallback;
    }
    return color;
  };

  const enhancedTeamData = {
    ...teamData,
    homeTeamColor: getEnhancedTeamColor(teamData.homeTeamColor, '#1f2937'),
    awayTeamColor: getEnhancedTeamColor(teamData.awayTeamColor, '#7c3aed')
  };

  const processedEvents = processTeamEvents(goals, cards, enhancedTeamData, getCardTeamId);

  // Monitor export mode changes
  useEffect(() => {
    const checkExportMode = () => {
      const element = document.getElementById('match-summary-content');
      const hasExportMode = element?.classList.contains('export-mode-mobile') || 
                           element?.getAttribute('data-export-mode') === 'true';
      setIsExportMode(hasExportMode || false);
    };

    // Initial check
    checkExportMode();

    // Set up observer for class changes
    const element = document.getElementById('match-summary-content');
    if (element) {
      const observer = new MutationObserver(checkExportMode);
      observer.observe(element, { 
        attributes: true, 
        attributeFilter: ['class', 'data-export-mode'] 
      });
      
      return () => observer.disconnect();
    }
  }, []);

  // Use iPhone story layout for mobile export mode
  if (isMobile && isExportMode) {
    console.log('📱 Rendering iPhone story layout for export');
    return (
      <IPhoneStoryLayout
        fixture={fixture}
        goals={goals}
        cards={cards}
        homeGoals={processedEvents.homeGoals}
        awayGoals={processedEvents.awayGoals}
        homeTeamColor={enhancedTeamData.homeTeamColor}
        awayTeamColor={enhancedTeamData.awayTeamColor}
        timelineEvents={timelineEvents}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Premier League Style Header */}
      <PremierLeagueMatchHeader
        fixture={fixture}
        homeTeamColor={enhancedTeamData.homeTeamColor}
        awayTeamColor={enhancedTeamData.awayTeamColor}
      />

      {/* Match Events Section */}
      <MatchEventsSection
        goals={goals}
        fixture={fixture}
        processedEvents={processedEvents}
        teamData={enhancedTeamData}
        getGoalPlayerName={getGoalPlayerName}
        getGoalTime={getGoalTime}
      />

      {/* Collapsible Cards Section */}
      <DisciplinarySection
        cards={cards}
        fixture={fixture}
        teamData={enhancedTeamData}
        getCardTeamId={getCardTeamId}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />

      {/* Enhanced Match Timeline Section */}
      {timelineEvents.length > 0 && (
        <Card className="border-2 animate-fade-in">
          <CardContent className="pt-6">
            <h4 className="font-bold flex items-center gap-3 mb-6 text-xl text-slate-700">
              <div className="p-2 rounded-full bg-slate-100">
                <Clock className="h-6 w-6" />
              </div>
              Match Timeline ({timelineEvents.length})
            </h4>
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
              <EnhancedMatchEventsTimeline
                timelineEvents={timelineEvents}
                formatTime={formatTime}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Summary Statistics Box */}
      <MatchStatisticsSummary
        fixture={fixture}
        processedEvents={processedEvents}
        teamData={enhancedTeamData}
        cards={cards}
      />
    </div>
  );
};

export default UnifiedMatchSummaryLayout;
