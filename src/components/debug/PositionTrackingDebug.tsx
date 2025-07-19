
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { positionTrackingService } from '@/services/fixtures/positionTrackingService';
import { Loader2, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const PositionTrackingDebug = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTriggeringUpdate, setIsTriggeringUpdate] = useState(false);
  const [initResult, setInitResult] = useState<{ updated: number; errors: string[] } | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const result = await positionTrackingService.initializePreviousPositions();
      setInitResult(result);
      console.log('🔧 Position initialization result:', result);
    } catch (error) {
      console.error('❌ Position initialization failed:', error);
      setInitResult({ updated: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const result = await positionTrackingService.verifyPositionTracking();
      setVerifyResult(result);
      console.log('🔍 Position verification result:', result);
    } catch (error) {
      console.error('❌ Position verification failed:', error);
      setVerifyResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTriggerUpdate = async () => {
    setIsTriggeringUpdate(true);
    try {
      const result = await positionTrackingService.triggerPositionUpdate();
      setUpdateResult(result);
      console.log('🚀 Position update result:', result);
      
      // Refresh verification after update
      if (result.success) {
        setTimeout(() => handleVerify(), 1000);
      }
    } catch (error) {
      console.error('❌ Position update failed:', error);
      setUpdateResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsTriggeringUpdate(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Position Tracking Debug Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Initialize Previous Positions */}
            <div className="space-y-2">
              <Button 
                onClick={handleInitialize} 
                disabled={isInitializing}
                className="w-full"
                variant="outline"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Initializing...
                  </>
                ) : (
                  'Initialize Previous Positions'
                )}
              </Button>
              
              {initResult && (
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Updated: {initResult.updated} teams</span>
                  </div>
                  {initResult.errors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Errors: {initResult.errors.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Verify Position Tracking */}
            <div className="space-y-2">
              <Button 
                onClick={handleVerify} 
                disabled={isVerifying}
                className="w-full"
                variant="outline"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Position Tracking'
                )}
              </Button>
              
              {verifyResult && (
                <div className="text-sm space-y-1">
                  <Badge variant="outline">
                    Teams: {verifyResult.teamsWithPositions}
                  </Badge>
                  <Badge variant="outline">
                    With Previous: {verifyResult.teamsWithPrevious}
                  </Badge>
                  <Badge variant="outline">
                    With Changes: {verifyResult.teamsWithChanges}
                  </Badge>
                </div>
              )}
            </div>

            {/* Trigger Position Update */}
            <div className="space-y-2">
              <Button 
                onClick={handleTriggerUpdate} 
                disabled={isTriggeringUpdate}
                className="w-full"
                variant="outline"
              >
                {isTriggeringUpdate ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Trigger Position Update'
                )}
              </Button>
              
              {updateResult && (
                <div className="flex items-center gap-2 text-sm">
                  {updateResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="truncate">{updateResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Position Changes Display */}
          {verifyResult?.sampleChanges && verifyResult.sampleChanges.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recent Position Changes:</h4>
              <div className="space-y-2">
                {verifyResult.sampleChanges.map((change: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{change.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {change.previous} → {change.current}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {change.change > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 text-sm">+{change.change}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="text-red-600 text-sm">{change.change}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PositionTrackingDebug;
