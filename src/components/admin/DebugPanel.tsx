import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { operationLoggingService } from "@/services/operationLoggingService";
import { enhancedMemberStatsService } from "@/services/enhancedMemberStatsService";
import { playerDropdownService } from "@/services/playerDropdownService";

interface OperationLog {
  id: string;
  operation_type: string;
  table_name?: string;
  record_id?: string;
  payload?: any;
  result?: any;
  error_message?: string;
  success: boolean;
  created_at: string;
}

const DebugPanel = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [failedLogs, setFailedLogs] = useState<OperationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [playerValidation, setPlayerValidation] = useState<any>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 DebugPanel: Fetching operation logs...');
      const [allLogs, errorLogs] = await Promise.all([
        operationLoggingService.getOperationLogs(100),
        operationLoggingService.getFailedOperations(50)
      ]);
      
      setLogs(allLogs);
      setFailedLogs(errorLogs);
      setLastRefresh(new Date());
      console.log('✅ DebugPanel: Logs fetched successfully:', { total: allLogs.length, errors: errorLogs.length });
    } catch (error) {
      console.error('❌ DebugPanel: Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getOperationIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getOperationBadge = (operationType: string) => {
    const colors: Record<string, string> = {
      'referee_match_save_start': 'bg-blue-100 text-blue-800',
      'referee_match_save_complete': 'bg-green-100 text-green-800',
      'fixture_score_update': 'bg-yellow-100 text-yellow-800',
      'update_member_stats': 'bg-purple-100 text-purple-800',
      'referee_match_save_critical_error': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[operationType] || 'bg-gray-100 text-gray-800'}>
        {operationType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const testMemberStatsUpdate = async () => {
    console.log('🧪 DebugPanel: Testing member stats update...');
    
    // Test with a known member ID (you might want to adjust this)
    const result = await enhancedMemberStatsService.updateMemberStats({
      memberId: 1, // Adjust this ID based on your data
      goals: 1
    });
    
    console.log('🧪 DebugPanel: Test result:', result);
    
    // Refresh logs to see the test operation
    await fetchLogs();
  };

  const testPlayerDropdownService = async () => {
    console.log('🧪 DebugPanel: Testing player dropdown service...');
    
    try {
      // Test the validation function
      const validation = await playerDropdownService.validatePlayerDropdownData();
      setPlayerValidation(validation);
      
      console.log('🧪 DebugPanel: Player validation result:', validation);
      
      // Test getting players for dropdown
      const players = await playerDropdownService.getPlayersForDropdown();
      console.log('🧪 DebugPanel: Player dropdown fetch result:', players.length);
      
      // Refresh logs to see the test operations
      await fetchLogs();
      
    } catch (error) {
      console.error('🧪 DebugPanel: Player dropdown test failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Debug Panel</h1>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last refresh: {formatDate(lastRefresh.toISOString())}
            </span>
          )}
          <Button onClick={fetchLogs} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedLogs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.length > 0 ? Math.round(((logs.length - failedLogs.length) / logs.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Operations</TabsTrigger>
          <TabsTrigger value="failed">Failed Operations</TabsTrigger>
          <TabsTrigger value="test">Test Panel</TabsTrigger>
          <TabsTrigger value="validation">Player Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(log.success)}
                          {getOperationBadge(log.operation_type)}
                          {log.table_name && (
                            <Badge variant="outline">{log.table_name}</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      
                      {log.error_message && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {log.error_message}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {log.payload && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">Payload</summary>
                          <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Failed Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {failedLogs.map((log) => (
                    <div key={log.id} className="border border-red-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          {getOperationBadge(log.operation_type)}
                          {log.table_name && (
                            <Badge variant="outline">{log.table_name}</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {log.error_message}
                        </AlertDescription>
                      </Alert>
                      
                      {log.payload && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">Payload</summary>
                          <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Use these test functions to validate services and operation logging.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={testMemberStatsUpdate} className="w-full">
                  Test Member Stats Update
                </Button>
                <Button onClick={testPlayerDropdownService} className="w-full">
                  Test Player Dropdown Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Dropdown Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testPlayerDropdownService} className="w-full mb-4">
                Run Player Validation
              </Button>
              
              {playerValidation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-center">
                          {playerValidation.summary.totalPlayers}
                        </div>
                        <div className="text-sm text-center text-muted-foreground">
                          Total Players
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-center">
                          {playerValidation.summary.teamsFound}
                        </div>
                        <div className="text-sm text-center text-muted-foreground">
                          Teams Found
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-center text-red-600">
                          {playerValidation.summary.playersWithoutNames}
                        </div>
                        <div className="text-sm text-center text-muted-foreground">
                          Without Names
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-center text-red-600">
                          {playerValidation.summary.playersWithoutTeams}
                        </div>
                        <div className="text-sm text-center text-muted-foreground">
                          Without Teams
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Alert>
                    {playerValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        Validation Status: {playerValidation.isValid ? 'PASSED' : 'FAILED'}
                      </div>
                      {playerValidation.issues.length > 0 && (
                        <ul className="list-disc list-inside space-y-1">
                          {playerValidation.issues.map((issue: string, index: number) => (
                            <li key={index} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugPanel;
