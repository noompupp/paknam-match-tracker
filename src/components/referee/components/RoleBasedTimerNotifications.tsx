
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import PlayerRoleBadge from "@/components/ui/player-role-badge";

interface RoleBasedTimerNotificationsProps {
  notifications: Array<{
    playerId: number;
    playerName: string;
    role: string;
    type: 'warning' | 'limit_reached' | 'auto_stopped' | 'minimum_needed';
    message: string;
  }>;
  formatTime: (seconds: number) => string;
}

const RoleBasedTimerNotifications = ({ 
  notifications, 
  formatTime 
}: RoleBasedTimerNotificationsProps) => {
  if (notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'auto_stopped':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'minimum_needed':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'auto_stopped':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      case 'minimum_needed':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Role-Based Timer Notifications ({notifications.length})
      </h4>
      
      {notifications.map((notification, index) => (
        <Alert 
          key={`${notification.playerId}-${index}`} 
          variant={getNotificationVariant(notification.type)}
        >
          {getNotificationIcon(notification.type)}
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayerRoleBadge role={notification.role} size="sm" />
                <span className="font-medium">{notification.playerName}</span>
              </div>
              <Badge 
                variant={notification.type === 'auto_stopped' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {notification.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm mt-1">{notification.message}</p>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default RoleBasedTimerNotifications;
