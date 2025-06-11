
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck } from "lucide-react";
import { RefereeWorkflowMode } from './types';
import { WORKFLOW_MODES, WORKFLOW_MODE_LABELS, WORKFLOW_MODE_DESCRIPTIONS } from './constants';

interface WorkflowModeSelectorProps {
  selectedMode: RefereeWorkflowMode | null;
  onModeSelect: (mode: RefereeWorkflowMode) => void;
  disabled?: boolean;
}

const WorkflowModeSelector = ({ 
  selectedMode, 
  onModeSelect, 
  disabled = false 
}: WorkflowModeSelectorProps) => {
  const modes = [
    {
      id: WORKFLOW_MODES.TWO_REFEREES,
      icon: <Users className="h-5 w-5" />,
      label: WORKFLOW_MODE_LABELS[WORKFLOW_MODES.TWO_REFEREES],
      description: WORKFLOW_MODE_DESCRIPTIONS[WORKFLOW_MODES.TWO_REFEREES],
      features: ['Team-based assignments', 'Simplified coordination', 'Clear responsibilities']
    },
    {
      id: WORKFLOW_MODES.MULTI_REFEREE,
      icon: <UserCheck className="h-5 w-5" />,
      label: WORKFLOW_MODE_LABELS[WORKFLOW_MODES.MULTI_REFEREE],
      description: WORKFLOW_MODE_DESCRIPTIONS[WORKFLOW_MODES.MULTI_REFEREE],
      features: ['Role specialization', 'Comprehensive coverage', 'Advanced coordination']
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Select Referee Workflow Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {modes.map((mode) => (
          <Card 
            key={mode.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMode === mode.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onModeSelect(mode.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {mode.icon}
                  <div>
                    <h3 className="font-semibold">{mode.label}</h3>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>
                {selectedMode === mode.id && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
              
              <div className="space-y-1">
                {mode.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedMode && (
          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              disabled={disabled}
              onClick={() => {
                // This will be handled by parent component
                console.log('Configure mode:', selectedMode);
              }}
            >
              Configure {WORKFLOW_MODE_LABELS[selectedMode]}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowModeSelector;
