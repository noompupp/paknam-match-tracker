
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, AlertCircle, Settings } from "lucide-react";

interface CoordinationFallbackProps {
  selectedFixtureData: any;
  onSetupWorkflow?: () => void;
}

const CoordinationFallback = ({ selectedFixtureData, onSetupWorkflow }: CoordinationFallbackProps) => {
  if (!selectedFixtureData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Fixture Selected</h3>
              <p className="text-sm text-muted-foreground">
                Please select a fixture to view coordination details
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Match Coordination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-800 mb-2">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Workflow Not Configured</span>
            </div>
            <p className="text-sm text-orange-700">
              This match doesn't have a coordination workflow set up yet. 
              You can still manage the match using the individual tabs.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Available Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <h5 className="font-medium mb-1">Score Management</h5>
                  <p className="text-xs text-muted-foreground">
                    Use the Score tab to manage match scores
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <h5 className="font-medium mb-1">Goals & Cards</h5>
                  <p className="text-xs text-muted-foreground">
                    Record player goals and disciplinary actions
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <h5 className="font-medium mb-1">Time Tracking</h5>
                  <p className="text-xs text-muted-foreground">
                    Track individual player playing time
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <h5 className="font-medium mb-1">Match Summary</h5>
                  <p className="text-xs text-muted-foreground">
                    View complete match statistics
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {onSetupWorkflow && (
            <Button onClick={onSetupWorkflow} className="mt-4">
              <Settings className="h-4 w-4 mr-2" />
              Setup Coordination Workflow
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoordinationFallback;
