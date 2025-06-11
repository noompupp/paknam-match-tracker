
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Trophy, AlertCircle, Clock, Users } from "lucide-react";
import { MultiRefereeConfig } from './types';
import { MULTI_REFEREE_ROLES } from './constants';
import { ROLE_LABELS, ROLE_ICONS } from '../components/coordination/constants';

interface MultiRefereeConfigurationProps {
  initialConfig?: MultiRefereeConfig;
  onSave: (config: MultiRefereeConfig) => void;
  onCancel: () => void;
}

const MultiRefereeConfiguration = ({
  initialConfig,
  onSave,
  onCancel
}: MultiRefereeConfigurationProps) => {
  const [refereeNames, setRefereeNames] = useState<Record<string, string>>({
    score_goals: '',
    cards_discipline: '',
    time_tracking: '',
    coordination: ''
  });

  const [assignments, setAssignments] = useState<MultiRefereeConfig['assignments']>(
    initialConfig?.assignments || {
      score_goals: null,
      cards_discipline: null,
      time_tracking: null,
      coordination: null
    }
  );

  const roles = [
    {
      key: MULTI_REFEREE_ROLES.SCORE_GOALS,
      label: ROLE_LABELS.score_goals,
      icon: ROLE_ICONS.score_goals,
      description: 'Manages goal scoring, assists, and score tracking'
    },
    {
      key: MULTI_REFEREE_ROLES.CARDS_DISCIPLINE,
      label: ROLE_LABELS.cards_discipline,
      icon: ROLE_ICONS.cards_discipline,
      description: 'Handles disciplinary actions and card management'
    },
    {
      key: MULTI_REFEREE_ROLES.TIME_TRACKING,
      label: ROLE_LABELS.time_tracking,
      icon: ROLE_ICONS.time_tracking,
      description: 'Tracks player time and substitutions'
    },
    {
      key: MULTI_REFEREE_ROLES.COORDINATION,
      label: ROLE_LABELS.coordination,
      icon: ROLE_ICONS.coordination,
      description: 'Coordinates overall match management and communication'
    }
  ];

  const handleRefereeAssignment = (role: string, refereeName: string) => {
    const refereeId = refereeName.toLowerCase().replace(/\s+/g, '_');
    
    setRefereeNames(prev => ({
      ...prev,
      [role]: refereeName
    }));

    setAssignments(prev => ({
      ...prev,
      [role]: refereeId
    }));
  };

  const isValidConfig = () => {
    return Object.values(refereeNames).every(name => name.trim() !== '');
  };

  const handleSave = () => {
    const config: MultiRefereeConfig = {
      assignments
    };
    onSave(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Configure Multi-Referee Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {roles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Card key={role.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {role.label}
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`referee-${role.key}`}>
                    Assigned Referee
                  </Label>
                  <Input
                    id={`referee-${role.key}`}
                    value={refereeNames[role.key]}
                    onChange={(e) => handleRefereeAssignment(role.key, e.target.value)}
                    placeholder="Enter referee name..."
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Configuration Summary */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <role.icon className="h-3 w-3" />
                    {role.label}
                  </span>
                  <span className="font-medium">
                    {refereeNames[role.key] || 'Not assigned'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!isValidConfig()}
            className="flex-1"
          >
            Save Configuration
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiRefereeConfiguration;
