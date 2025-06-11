
import { Team } from "@/types/database";
import MatchPreviewSimplifiedTable from "./MatchPreviewSimplifiedTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, MapPin } from "lucide-react";

interface MatchPreviewOverviewProps {
  homeTeam: Team;
  awayTeam: Team;
  headToHead?: any[];
}

const MatchPreviewOverview = ({ homeTeam, awayTeam, headToHead }: MatchPreviewOverviewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Simplified League Position Table */}
      <MatchPreviewSimplifiedTable 
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />

      {/* Head-to-Head Section */}
      {headToHead && headToHead.length > 0 && (
        <Card className="card-shadow-lg animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Head-to-Head
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Recent encounters between these teams
            </p>
            <div className="grid gap-2">
              {headToHead.slice(0, 3).map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-medium text-sm">
                    {match.home_team_name} {match.home_score} - {match.away_score} {match.away_team_name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Context */}
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            Match Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Home Team</span>
              <span className="text-sm">{homeTeam.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Away Team</span>
              <span className="text-sm">{awayTeam.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Home Position</span>
              <span className="text-sm font-bold text-primary">{homeTeam.position}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Away Position</span>
              <span className="text-sm font-bold text-primary">{awayTeam.position}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchPreviewOverview;
