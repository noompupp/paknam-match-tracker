
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, User, Shield, Database } from "lucide-react";
import { userRoleService } from '@/services/referee/userRoleService';
import { coordinationService } from '@/services/referee/coordinationService';
import { refereeAssignmentService } from '@/services/referee/assignmentService';

interface DebugAccessPanelProps {
  fixtureId: number | null;
  onClose: () => void;
}

const DebugAccessPanel = ({ fixtureId, onClose }: DebugAccessPanelProps) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    if (!fixtureId) return;

    setIsLoading(true);
    try {
      console.log('🔧 Running access diagnostics for fixture:', fixtureId);

      // Check user role
      const roleInfo = await userRoleService.getCurrentUserRole();
      
      // Check assignment service access
      const assignmentAccess = await refereeAssignmentService.checkUserRole();
      
      // Check coordination service access
      const coordinationAccess = await coordinationService.checkUserAccess();
      
      // Try to get assignments
      let assignmentsError = null;
      let assignments = [];
      try {
        assignments = await refereeAssignmentService.getAllFixtureAssignments(fixtureId);
      } catch (error) {
        assignmentsError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Try to get coordination data
      let coordinationError = null;
      let coordinationData = null;
      try {
        coordinationData = await coordinationService.getCoordinationData(fixtureId);
      } catch (error) {
        coordinationError = error instanceof Error ? error.message : 'Unknown error';
      }

      setDebugInfo({
        fixtureId,
        timestamp: new Date().toISOString(),
        roleInfo,
        assignmentAccess,
        coordinationAccess,
        assignments,
        assignmentsError,
        coordinationData,
        coordinationError
      });

    } catch (error) {
      console.error('❌ Error running diagnostics:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fixtureId) {
      runDiagnostics();
    }
  }, [fixtureId]);

  const createRefereeRole = async () => {
    if (!debugInfo?.roleInfo?.userId) return;

    try {
      setIsLoading(true);
      await userRoleService.ensureUserHasRole(debugInfo.roleInfo.userId, 'referee');
      await runDiagnostics();
    } catch (error) {
      console.error('❌ Error creating referee role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fixtureId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p>No fixture selected for diagnostics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Diagnostics
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Diagnostics
          </Button>
          
          {debugInfo?.roleInfo?.isAuthenticated && debugInfo?.roleInfo?.role === 'viewer' && (
            <Button 
              onClick={createRefereeRole} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <User className="h-4 w-4 mr-2" />
              Create Referee Role
            </Button>
          )}
        </div>

        {debugInfo && (
          <div className="space-y-4">
            {debugInfo.error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Diagnostics Error</p>
                <p className="text-sm text-red-600">{debugInfo.error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* User Info */}
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">User Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Authenticated: <Badge variant={debugInfo.roleInfo?.isAuthenticated ? "default" : "destructive"}>
                      {debugInfo.roleInfo?.isAuthenticated ? "Yes" : "No"}
                    </Badge></div>
                    <div>Role: <Badge variant="outline">{debugInfo.roleInfo?.role || "None"}</Badge></div>
                    <div>Can Access Referee Tools: <Badge variant={debugInfo.roleInfo?.canAccessRefereeTools ? "default" : "secondary"}>
                      {debugInfo.roleInfo?.canAccessRefereeTools ? "Yes" : "No"}
                    </Badge></div>
                    <div>Can Access Coordination: <Badge variant={debugInfo.roleInfo?.canAccessCoordination ? "default" : "secondary"}>
                      {debugInfo.roleInfo?.canAccessCoordination ? "Yes" : "No"}
                    </Badge></div>
                  </div>
                </div>

                {/* Service Access */}
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Service Access</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Assignment Service: <Badge variant={debugInfo.assignmentAccess?.canAccess ? "default" : "destructive"}>
                      {debugInfo.assignmentAccess?.canAccess ? "Access Granted" : "Access Denied"}
                    </Badge></div>
                    <div>Coordination Service: <Badge variant={debugInfo.coordinationAccess?.canAccess ? "default" : "destructive"}>
                      {debugInfo.coordinationAccess?.canAccess ? "Access Granted" : "Access Denied"}
                    </Badge></div>
                  </div>
                </div>

                {/* Data Status */}
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">Data Status</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Assignments:</span>
                      {debugInfo.assignmentsError ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <Badge variant="default">{debugInfo.assignments?.length || 0} found</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Coordination Data:</span>
                      {debugInfo.coordinationError ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <Badge variant="default">{debugInfo.coordinationData ? "Available" : "Not Available"}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {(debugInfo.assignmentsError || debugInfo.coordinationError) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-2">Errors Found</p>
                    {debugInfo.assignmentsError && (
                      <p className="text-xs text-red-600 mb-1">Assignments: {debugInfo.assignmentsError}</p>
                    )}
                    {debugInfo.coordinationError && (
                      <p className="text-xs text-red-600">Coordination: {debugInfo.coordinationError}</p>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(debugInfo.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugAccessPanel;
