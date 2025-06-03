
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebugData, useDebugNormalization } from "@/hooks/useDebug";
import { useTeams } from "@/hooks/useTeams";
import { useMembers } from "@/hooks/useMembers";
import { useFixtures } from "@/hooks/useFixtures";
import { useDebugContext } from "@/contexts/DebugContext";
import { X, RefreshCw, Bug } from "lucide-react";
import { useEffect } from "react";

const DebugPanel = () => {
  const { showDebug, setShowDebug } = useDebugContext();
  const { data: debugData, isLoading: debugLoading, refetch: refetchDebug } = useDebugData();
  const { data: normalizationTest } = useDebugNormalization();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDebug(prev => !prev);
      }
      if (event.key === 'Escape' && showDebug) {
        setShowDebug(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebug, setShowDebug]);

  if (!showDebug) {
    return (
      <>
        {/* Backdrop protection for mobile */}
        <div className="fixed inset-0 pointer-events-none z-[60]" />
        
        {/* Debug trigger button */}
        <div className="fixed bottom-20 right-4 z-[70] md:bottom-4">
          <Button 
            onClick={() => setShowDebug(true)}
            variant="outline"
            size="sm"
            className="bg-yellow-100 hover:bg-yellow-200 border-yellow-400 shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Open Debug Panel (Ctrl+Shift+D)"
            title="Open Debug Panel (Ctrl+Shift+D)"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug Panel
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[80]" 
        onClick={() => setShowDebug(false)}
        aria-hidden="true"
      />
      
      {/* Debug Panel */}
      <div 
        className="fixed inset-4 z-[90] bg-white rounded-lg shadow-2xl border-2 border-yellow-400 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]"
        role="dialog"
        aria-label="Debug Panel"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-yellow-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug Panel
          </h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => refetchDebug()} 
              size="sm" 
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Refresh debug data"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowDebug(false)} 
              size="sm" 
              variant="outline"
              aria-label="Close debug panel (Escape)"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-6 overflow-auto flex-1">
          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle>API Status</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Raw Data Summary */}
          {debugData && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Database Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Teams ({debugData.teams.count})</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugData.teams.idTypes, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold">Members Team Mappings ({debugData.members.count})</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugData.members.teamIdMappings, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold">Fixtures Team Mappings ({debugData.fixtures.count})</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugData.fixtures.teamMappings, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ID Normalization Test */}
          {normalizationTest && (
            <Card>
              <CardHeader>
                <CardTitle>ID Normalization Test</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(normalizationTest, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Transformed Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Transformed Data Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Teams</h4>
                <p className="text-sm">Count: {teams?.length || 0}</p>
                {teams?.length && (
                  <p className="text-xs text-gray-600">
                    Sample: {teams[0]?.name} (ID: {teams[0]?.id})
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold">Members</h4>
                <p className="text-sm">
                  Total: {members?.length || 0}, With Teams: {members?.filter(m => m.team).length || 0}
                </p>
                {members?.length && (
                  <p className="text-xs text-gray-600">
                    Sample: {members[0]?.name} (Team: {members[0]?.team?.name || 'None'})
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold">Fixtures</h4>
                <p className="text-sm">
                  Total: {fixtures?.length || 0}, With Both Teams: {fixtures?.filter(f => f.home_team && f.away_team).length || 0}
                </p>
                {fixtures?.length && (
                  <p className="text-xs text-gray-600">
                    Sample: {fixtures[0]?.home_team?.name || 'No Home'} vs {fixtures[0]?.away_team?.name || 'No Away'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Development Info */}
          <Card>
            <CardHeader>
              <CardTitle>Development Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
                <p><strong>Keyboard Shortcut:</strong> Ctrl+Shift+D to toggle</p>
                <p><strong>ESC:</strong> Close panel</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DebugPanel;
