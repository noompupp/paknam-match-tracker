
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import TeamLogo from "../../teams/TeamLogo"
import { getNeutralScoreStyle } from "@/utils/scoreColorUtils"
import { useIsMobile } from "@/hooks/use-mobile"

interface MatchHeaderWithScoreProps {
  selectedFixtureData: any
  homeScore: number
  awayScore: number
  matchTime: number
  formatTime: (seconds: number) => string
}

const MatchHeaderWithScore = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  matchTime,
  formatTime
}: MatchHeaderWithScoreProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="premier-card-shadow-lg match-border-gradient">
      <CardContent className="p-6 match-gradient-header">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <TeamLogo team={selectedFixtureData.home_team} size="medium" />
              <h3 className="text-lg font-semibold">{selectedFixtureData.home_team?.name}</h3>
            </div>
            <div 
              className="text-5xl font-bold"
              style={getNeutralScoreStyle(isMobile)}
            >
              {homeScore}
            </div>
          </div>

          {/* Match Info */}
          <div className="mx-8 text-center min-w-[120px]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-mono font-semibold">{formatTime(matchTime)}</span>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs font-medium bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20"
            >
              {new Date(selectedFixtureData.match_date).toLocaleDateString()}
            </Badge>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{selectedFixtureData.away_team?.name}</h3>
              <TeamLogo team={selectedFixtureData.away_team} size="medium" />
            </div>
            <div 
              className="text-5xl font-bold"
              style={getNeutralScoreStyle(isMobile)}
            >
              {awayScore}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MatchHeaderWithScore
