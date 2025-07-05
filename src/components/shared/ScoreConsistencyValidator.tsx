import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { realTimeScoreService } from '@/services/fixtures/realTimeScoreService';
import { useToast } from '@/hooks/use-toast';

interface ScoreConsistencyValidatorProps {
  fixtureId: number;
  onScoreFixed?: () => void;
}

const ScoreConsistencyValidator = ({ fixtureId, onScoreFixed }: ScoreConsistencyValidatorProps) => {
  const [verification, setVerification] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const checkConsistency = async () => {
    if (!fixtureId) return;
    
    setIsChecking(true);
    try {
      console.log('🔍 ScoreConsistencyValidator: Checking score consistency for fixture:', fixtureId);
      const result = await realTimeScoreService.verifyScoreSync(fixtureId);
      setVerification(result);
      
      if (result.isInSync) {
        console.log('✅ ScoreConsistencyValidator: Scores are in sync');
      } else {
        console.log('⚠️ ScoreConsistencyValidator: Score discrepancy detected:', result.discrepancy);
      }
    } catch (error) {
      console.error('❌ ScoreConsistencyValidator: Error checking consistency:', error);
      toast({
        title: "Verification Error",
        description: "Failed to check score consistency",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const fixScoreDiscrepancy = async () => {
    if (!fixtureId || !verification || verification.isInSync) return;
    
    setIsFixing(true);
    try {
      console.log('🔧 ScoreConsistencyValidator: Fixing score discrepancy for fixture:', fixtureId);
      const result = await realTimeScoreService.updateFixtureScoreRealTime(fixtureId);
      
      if (result.success) {
        console.log('✅ ScoreConsistencyValidator: Score fixed successfully');
        toast({
          title: "Score Fixed",
          description: `Score updated to ${result.homeScore}-${result.awayScore}`,
        });
        
        // Recheck consistency
        await checkConsistency();
        onScoreFixed?.();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ ScoreConsistencyValidator: Error fixing score:', error);
      toast({
        title: "Fix Failed",
        description: "Failed to fix score discrepancy",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  // Check consistency on mount and when fixtureId changes
  useEffect(() => {
    checkConsistency();
  }, [fixtureId]);

  if (!verification) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            Score Consistency Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Checking score consistency...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {verification.isInSync ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          Score Consistency Check
          <Badge variant={verification.isInSync ? "default" : "destructive"}>
            {verification.isInSync ? "In Sync" : "Out of Sync"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Fixture Score</p>
            <p className="text-lg font-bold">
              {verification.fixtureScores.home}-{verification.fixtureScores.away}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Calculated from Events</p>
            <p className="text-lg font-bold">
              {verification.calculatedScores.home}-{verification.calculatedScores.away}
            </p>
          </div>
        </div>

        {!verification.isInSync && verification.discrepancy && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {verification.discrepancy}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={checkConsistency}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Recheck
          </Button>
          
          {!verification.isInSync && (
            <Button
              onClick={fixScoreDiscrepancy}
              disabled={isFixing}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
              Fix Score
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreConsistencyValidator;