
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { matchParticipationService } from "@/services/fixtures/matchParticipationService";
import { useToast } from "@/hooks/use-toast";

const MatchParticipationSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{
    success: boolean;
    message: string;
    playersUpdated?: number;
  } | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting match participation sync...');
      
      const result = await matchParticipationService.syncAllMatchParticipation();
      setLastSyncResult(result);
      
      if (result.success) {
        toast({
          title: "Sync Completed Successfully! 📊",
          description: result.message,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
      const errorResult = {
        success: false,
        message: 'Critical error during sync operation'
      };
      setLastSyncResult(errorResult);
      
      toast({
        title: "Sync Error",
        description: errorResult.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Match Participation Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This tool fixes the "Matches Played" count for all players based on their actual playtime. 
            It will reset all match counts to 0 and recalculate them based on player time tracking data.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h4 className="font-medium">What this sync does:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Resets all player match counts to 0</li>
            <li>• Counts matches where each player actually had playtime</li>
            <li>• Updates the "Matches Played" field accurately</li>
            <li>• Processes all historical match data</li>
          </ul>
        </div>

        <Button 
          onClick={handleSync}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing Match Participation...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All Match Participation
            </>
          )}
        </Button>

        {lastSyncResult && (
          <Alert variant={lastSyncResult.success ? "default" : "destructive"}>
            {lastSyncResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <strong>{lastSyncResult.success ? 'Success:' : 'Error:'}</strong> {lastSyncResult.message}
              {lastSyncResult.playersUpdated && (
                <>
                  <br />
                  <span className="text-sm">
                    Updated {lastSyncResult.playersUpdated} player entries.
                  </span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchParticipationSync;
