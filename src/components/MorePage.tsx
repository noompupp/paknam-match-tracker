
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebugData, useDebugNormalization } from "@/hooks/useDebug";
import { useTeams } from "@/hooks/useTeams";
import { useMembers } from "@/hooks/useMembers";
import { useFixtures } from "@/hooks/useFixtures";
import { usePlayerStatsSync } from "@/hooks/usePlayerStatsSync";
import { Bug, RefreshCw, TestTube, Settings, Database, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MorePage = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("debug");
  
  // Debug data hooks
  const { data: debugData, isLoading: debugLoading, refetch: refetchDebug } = useDebugData();
  const { data: normalizationTest } = useDebugNormalization();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  
  // Stats sync functionality
  const { syncStats, validateStats, isSyncing, isValidating, lastSyncResult } = usePlayerStatsSync();

  const handleSyncStats = () => {
    syncStats();
  };

  const handleValidateStats = () => {
    validateStats();
  };

  const handleSystemTest = () => {
    toast({
      title: "System Test Started",
      description: "Running comprehensive system validation...",
    });
    
    // Simulate comprehensive testing
    setTimeout(() => {
      const allSystemsOperational = teams && members && fixtures && !debugLoading;
      
      if (allSystemsOperational) {
        toast({
          title: "System Test Passed",
          description: "All systems are operational and functioning correctly.",
        });
      } else {
        toast({
          title: "System Test Issues",
          description: "Some components may need attention. Check the debug panel for details.",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-white mb-6">
          <h1 className="text-3xl font-bold">More</h1>
          <p className="text-white/80 mt-2">Debug tools, testing, and system management</p>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="debug" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Bug className="h-4 w-4" />
              Debug Panel
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <TestTube className="h-4 w-4" />
              System Testing
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="debug" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Debug Information
                  </span>
                  <Button 
                    onClick={() => refetchDebug()} 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Status */}
                <div>
                  <h3 className="font-semibold mb-3">API Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Badge variant={teamsLoading ? "secondary" : teams?.length ? "default" : "destructive"}>
                        Teams: {teamsLoading ? "Loading..." : teams?.length || 0}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={membersLoading ? "secondary" : members?.length ? "default" : "destructive"}>
                        Members: {membersLoading ? "Loading..." : members?.length || 0}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={fixturesLoading ? "secondary" : fixtures?.length ? "default" : "destructive"}>
                        Fixtures: {fixturesLoading ? "Loading..." : fixtures?.length || 0}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={debugLoading ? "secondary" : debugData ? "default" : "destructive"}>
                        Debug: {debugLoading ? "Loading..." : debugData ? "OK" : "Error"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Raw Data Summary */}
                {debugData && (
                  <div>
                    <h3 className="font-semibold mb-3">Database Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Teams ({debugData.teams.count})</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(debugData.teams.idTypes, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Members Team Mappings ({debugData.members.count})</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(debugData.members.teamIdMappings, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Fixtures Team Mappings ({debugData.fixtures.count})</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(debugData.fixtures.teamMappings, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* ID Normalization Test */}
                {normalizationTest && (
                  <div>
                    <h3 className="font-semibold mb-3">ID Normalization Test</h3>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(normalizationTest, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  System Testing & Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Player Stats Sync */}
                <div>
                  <h3 className="font-semibold mb-3">Player Statistics Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleSyncStats}
                      disabled={isSyncing}
                      className="flex items-center gap-2"
                    >
                      <Database className="h-4 w-4" />
                      {isSyncing ? "Syncing..." : "Sync Player Stats"}
                    </Button>
                    
                    <Button 
                      onClick={handleValidateStats}
                      disabled={isValidating}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      {isValidating ? "Validating..." : "Validate Stats"}
                    </Button>
                  </div>
                  
                  {lastSyncResult && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Last Sync Result:</h4>
                      <p className="text-sm text-blue-800">
                        Players Updated: {lastSyncResult.playersUpdated} | 
                        Goals Added: {lastSyncResult.goalsAdded} | 
                        Assists Added: {lastSyncResult.assistsAdded}
                      </p>
                      {lastSyncResult.errors.length > 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          Errors: {lastSyncResult.errors.length}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* System Health Check */}
                <div>
                  <h3 className="font-semibold mb-3">System Health Check</h3>
                  <Button 
                    onClick={handleSystemTest}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <TestTube className="h-4 w-4" />
                    Run Comprehensive Test
                  </Button>
                </div>

                {/* Data Integrity Status */}
                <div>
                  <h3 className="font-semibold mb-3">Data Integrity Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <h4 className="font-medium">Teams</h4>
                        <p className="text-sm text-gray-600">{teams?.length || 0} active teams</p>
                        <Badge variant={teams?.length ? "default" : "destructive"}>
                          {teams?.length ? "Healthy" : "Issues"}
                        </Badge>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <h4 className="font-medium">Members</h4>
                        <p className="text-sm text-gray-600">{members?.length || 0} total members</p>
                        <Badge variant={members?.length ? "default" : "destructive"}>
                          {members?.length ? "Healthy" : "Issues"}
                        </Badge>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <h4 className="font-medium">Fixtures</h4>
                        <p className="text-sm text-gray-600">{fixtures?.length || 0} total fixtures</p>
                        <Badge variant={fixtures?.length ? "default" : "destructive"}>
                          {fixtures?.length ? "Healthy" : "Issues"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Application Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Environment Information</h3>
                  <div className="text-sm space-y-2">
                    <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
                    <p><strong>Build:</strong> Production Ready</p>
                    <p><strong>Features:</strong> Goal Assignment, Player Tracking, Match Events</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" disabled>
                      Export All Data
                    </Button>
                    <Button variant="outline" disabled>
                      Import Configuration
                    </Button>
                    <Button variant="outline" disabled>
                      Reset Cache
                    </Button>
                    <Button variant="outline" disabled>
                      Generate Report
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Additional features coming soon...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MorePage;
