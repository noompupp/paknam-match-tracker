import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, Users, Shield, Target } from "lucide-react"
import { ComponentPlayer } from "../hooks/useRefereeState"
import PlayerRoleBadge from "@/components/ui/player-role-badge"
import { useTranslation } from "@/hooks/useTranslation";
import { isSecondHalf } from "@/utils/timeUtils";

interface SevenASideValidationPanelProps {
  trackedPlayers: any[]
  allPlayers: ComponentPlayer[]
  matchTime: number
  formatTime: (seconds: number) => string
  playerHalfTimes?: Map<number, { firstHalf: number; secondHalf: number }>
}

const SevenASideValidationPanel = ({ 
  trackedPlayers, 
  allPlayers, 
  matchTime, 
  formatTime,
  playerHalfTimes = new Map()
}: SevenASideValidationPanelProps) => {
  const { t } = useTranslation();
  const SEVEN_PLAYER_LIMIT = 7
  const S_CLASS_HALF_LIMIT = 20 * 60 // 20 minutes in seconds
  const S_CLASS_WARNING_THRESHOLD = 16 * 60 // 16 minutes warning
  const STARTER_MIN_TOTAL = 10 * 60 // 10 minutes minimum
  const HALF_DURATION = 25 * 60 // 25 minutes per half

  const currentHalf = isSecondHalf(matchTime) ? 2 : 1

  console.log('🏟️ SevenASideValidationPanel (FIXED) - Match Analysis:', {
    matchTime: formatTime(matchTime),
    currentHalf,
    trackedPlayersCount: trackedPlayers.length,
    halfTimesMapSize: playerHalfTimes.size
  });

  // Active players validation
  const activePlayers = trackedPlayers.filter(p => p.isPlaying)
  const sevenPlayerViolation = activePlayers.length > SEVEN_PLAYER_LIMIT

  // S-Class time violations - FIXED to use actual player half times
  const sClassIssues = trackedPlayers
    .map(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id)
      const role = playerInfo?.position?.toLowerCase() || 'starter'
      
      if (role === 's-class' && player.isPlaying) {
        // Get actual half times from the tracking map
        const halfTimes = playerHalfTimes.get(player.id) || { firstHalf: 0, secondHalf: 0 };
        const currentHalfTime = currentHalf === 1 ? halfTimes.firstHalf : halfTimes.secondHalf;
        
        console.log(`🔍 S-Class check for ${player.name}:`, {
          currentHalf,
          currentHalfTime: formatTime(currentHalfTime),
          firstHalfTime: formatTime(halfTimes.firstHalf),
          secondHalfTime: formatTime(halfTimes.secondHalf),
          limit: formatTime(S_CLASS_HALF_LIMIT),
          warningThreshold: formatTime(S_CLASS_WARNING_THRESHOLD)
        });
        
        if (currentHalfTime >= S_CLASS_HALF_LIMIT) {
          console.log('🚨 S-Class VIOLATION detected:', player.name);
          return { player, type: 'exceeded', halfTime: currentHalfTime, role, severity: 'critical' }
        } else if (currentHalfTime >= S_CLASS_WARNING_THRESHOLD) {
          console.log('⚠️ S-Class WARNING detected:', player.name);
          return { player, type: 'warning', halfTime: currentHalfTime, role, severity: 'warning' }
        }
      }
      return null
    })
    .filter(Boolean)

  // Starter minimum time warnings - Keep existing logic
  const starterIssues = trackedPlayers
    .map(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id)
      const role = playerInfo?.position?.toLowerCase() || 'starter'
      
      if (role === 'starter') {
        const remainingTime = HALF_DURATION * 2 - matchTime
        const neededTime = STARTER_MIN_TOTAL - player.totalTime
        
        if (remainingTime < 300 && neededTime > 0) { // 5 minutes remaining
          return { player, type: 'insufficient', neededTime, role, severity: 'warning' }
        }
      }
      return null
    })
    .filter(Boolean)

  const hasViolations = sevenPlayerViolation || sClassIssues.length > 0 || starterIssues.length > 0
  const hasCriticalIssues = sevenPlayerViolation || sClassIssues.some(issue => issue.severity === 'critical')

  console.log('🎯 Validation Summary:', {
    hasViolations,
    hasCriticalIssues,
    sevenPlayerViolation,
    sClassIssuesCount: sClassIssues.length,
    starterIssuesCount: starterIssues.length,
    activePlayers: activePlayers.length
  });

  if (!hasViolations) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Shield className="h-4 w-4" />
            {t('referee.rulesClear', 'All Rules Compliant ✅')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm text-green-700 dark:text-green-300">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{activePlayers.length}/{SEVEN_PLAYER_LIMIT} players on field</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Half {currentHalf} - {formatTime(matchTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Critical Header Alert */}
      {hasCriticalIssues && (
        <Alert variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-bold">{t('referee.criticalViolations', 'CRITICAL RULE VIOLATIONS!')}</span>
              <Badge variant="destructive" className="animate-bounce">
                {t('referee.immediateAction', 'IMMEDIATE ACTION REQUIRED')}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 7-Player Limit Violation */}
      {sevenPlayerViolation && (
        <Alert variant="destructive" className="border-2 border-red-500">
          <Users className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">7-Player Limit Exceeded!</span>
                <p className="text-sm mt-1">Currently {activePlayers.length} players on field</p>
              </div>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {activePlayers.length}/{SEVEN_PLAYER_LIMIT}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* S-Class Time Violations */}
      {sClassIssues.map((issue, index) => (
        <Alert 
          key={index} 
          variant={issue.severity === 'critical' ? 'destructive' : 'default'}
          className={issue.severity === 'critical' ? 'border-2 border-red-500' : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50'}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlayerRoleBadge role="S-class" size="md" />
                <div>
                  <span className="font-bold">{issue.player.name}</span>
                  <p className="text-sm">
                    Half {currentHalf} time: {formatTime(issue.halfTime)} / {formatTime(S_CLASS_HALF_LIMIT)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {issue.type === 'exceeded'
                    ? t('referee.exceededLimit', 'LIMIT EXCEEDED')
                    : t('referee.approachingLimit', 'APPROACHING LIMIT')}
                </Badge>
              </div>
            </div>
            {issue.type === 'exceeded' && (
              <p className="text-sm mt-2 font-medium">
                ⚠️ {t('referee.mustSubstitute', 'Must substitute immediately - 20min/half limit exceeded')}
              </p>
            )}
          </AlertDescription>
        </Alert>
      ))}

      {/* Starter minimum time warnings */}
      {starterIssues.map((issue, index) => (
        <Alert key={index} className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
          <Target className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlayerRoleBadge role="Starter" size="md" />
                <div>
                  <span className="font-bold">{issue.player.name}</span>
                  <p className="text-sm">
                    {t('referee.needsMoreToReachMinimum', 'Needs {time} more to reach minimum')
                      .replace('{time}', formatTime(issue.neededTime))}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {t('referee.needsMoreTime')}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      ))}

      {/* Summary Stats */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{activePlayers.length}</div>
              <div className="text-xs text-muted-foreground">
                {t('referee.playersOnFieldLabel')}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {t('referee.currentHalf').replace('{half}', currentHalf.toString()).replace('{time}', formatTime(matchTime))}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{trackedPlayers.length}</div>
              <div className="text-xs text-muted-foreground">
                {t('referee.totalTrackedLabel')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SevenASideValidationPanel;
