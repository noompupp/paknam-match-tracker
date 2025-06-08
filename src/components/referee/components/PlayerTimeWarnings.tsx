
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Users } from "lucide-react"
import { ComponentPlayer } from "../hooks/useRefereeState"
import PlayerRoleBadge from "@/components/ui/player-role-badge"

interface PlayerTimeWarningsProps {
  trackedPlayers: any[]
  allPlayers: ComponentPlayer[]
  matchTime: number
  formatTime: (seconds: number) => string
}

const PlayerTimeWarnings = ({ 
  trackedPlayers, 
  allPlayers, 
  matchTime, 
  formatTime 
}: PlayerTimeWarningsProps) => {
  const SEVEN_PLAYER_LIMIT = 7
  const S_CLASS_HALF_LIMIT = 20 * 60 // 20 minutes in seconds
  const S_CLASS_WARNING_THRESHOLD = 16 * 60 // 16 minutes warning
  const HALF_DURATION = 25 * 60 // 25 minutes per half

  const currentHalf = matchTime <= HALF_DURATION ? 1 : 2
  const currentHalfTime = currentHalf === 1 ? matchTime : matchTime - HALF_DURATION

  // Check for 7-player limit violation
  const activePlayers = trackedPlayers.filter(p => p.isPlaying)
  const sevenPlayerViolation = activePlayers.length > SEVEN_PLAYER_LIMIT

  // Check S-Class time violations
  const sClassWarnings = trackedPlayers
    .map(player => {
      const playerInfo = allPlayers.find(p => p.id === player.id)
      const role = playerInfo?.position?.toLowerCase() || 'starter'
      
      if (role === 's-class' && player.isPlaying) {
        const halfTime = currentHalf === 1 ? currentHalfTime : 
          (player.totalTime - Math.min(HALF_DURATION, player.totalTime))
        
        if (halfTime >= S_CLASS_HALF_LIMIT) {
          return { player, type: 'exceeded', halfTime, role }
        } else if (halfTime >= S_CLASS_WARNING_THRESHOLD) {
          return { player, type: 'warning', halfTime, role }
        }
      }
      return null
    })
    .filter(Boolean)

  const hasWarnings = sevenPlayerViolation || sClassWarnings.length > 0

  if (!hasWarnings) {
    return null
  }

  return (
    <div className="space-y-3">
      {sevenPlayerViolation && (
        <Alert variant="destructive">
          <Users className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>7-Player Limit Exceeded!</strong> Currently {activePlayers.length} players on field.
              </span>
              <Badge variant="destructive">
                {activePlayers.length}/{SEVEN_PLAYER_LIMIT}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {sClassWarnings.map((warning, index) => (
        <Alert key={index} variant={warning.type === 'exceeded' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayerRoleBadge role={warning.role} />
                <span>
                  <strong>{warning.player.name}</strong> - Half {currentHalf} time: {formatTime(warning.halfTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <Badge variant={warning.type === 'exceeded' ? 'destructive' : 'secondary'}>
                  {warning.type === 'exceeded' ? 'LIMIT EXCEEDED' : 'APPROACHING LIMIT'}
                </Badge>
              </div>
            </div>
            {warning.type === 'exceeded' && (
              <p className="text-sm mt-1 text-destructive">
                S-Class players are limited to 20 minutes per half
              </p>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

export default PlayerTimeWarnings
