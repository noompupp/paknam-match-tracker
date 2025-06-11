
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Trophy, AlertCircle, Clock } from "lucide-react";
import { TwoRefereesConfig } from './types';
import { TWO_REFEREES_RESPONSIBILITIES } from './constants';
import { ROLE_LABELS } from '../components/coordination/constants';

interface TwoRefereesConfigurationProps {
  initialConfig?: TwoRefereesConfig;
  onSave: (config: TwoRefereesConfig) => void;
  onCancel: () => void;
  homeTeamName: string;
  awayTeamName: string;
}

const TwoRefereesConfiguration = ({
  initialConfig,
  onSave,
  onCancel,
  homeTeamName,
  awayTeamName
}: TwoRefereesConfigurationProps) => {
  const [config, setConfig] = useState<TwoRefereesConfig>(
    initialConfig || {
      homeReferee: {
        id: '',
        name: '',
        responsibilities: [...TWO_REFEREES_RESPONSIBILITIES.PRIMARY]
      },
      awayReferee: {
        id: '',
        name: '',
        responsibilities: [...TWO_REFEREES_RESPONSIBILITIES.SECONDARY]
      }
    }
  );

  const allResponsibilities = ['score_goals', 'cards_discipline', 'time_tracking'] as const;

  const handleRefereeChange = (
    referee: 'homeReferee' | 'awayReferee',
    field: 'name',
    value: string
  ) => {
    setConfig(prev => ({
      ...prev,
      [referee]: {
        ...prev[referee],
        [field]: value,
        id: field === 'name' ? value.toLowerCase().replace(/\s+/g, '_') : prev[referee].id
      }
    }));
  };

  const handleResponsibilityToggle = (
    referee: 'homeReferee' | 'awayReferee',
    responsibility: typeof allResponsibilities[number],
    checked: boolean
  ) => {
    setConfig(prev => ({
      ...prev,
      [referee]: {
        ...prev[referee],
        responsibilities: checked
          ? [...prev[referee].responsibilities, responsibility]
          : prev[referee].responsibilities.filter(r => r !== responsibility)
      }
    }));
  };

  const getResponsibilityIcon = (responsibility: string) => {
    switch (responsibility) {
      case 'score_goals': return <Trophy className="h-4 w-4" />;
      case 'cards_discipline': return <AlertCircle className="h-4 w-4" />;
      case 'time_tracking': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const isValidConfig = () => {
    return (
      config.homeReferee.name.trim() !== '' &&
      config.awayReferee.name.trim() !== '' &&
      config.homeReferee.responsibilities.length > 0 &&
      config.awayReferee.responsibilities.length > 0
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Configure Two Referees Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Home Team Referee */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {homeTeamName} Referee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="home-referee-name">Referee Name</Label>
              <Input
                id="home-referee-name"
                value={config.homeReferee.name}
                onChange={(e) => handleRefereeChange('homeReferee', 'name', e.target.value)}
                placeholder="Enter referee name..."
              />
            </div>

            <div className="space-y-3">
              <Label>Responsibilities</Label>
              {allResponsibilities.map((responsibility) => (
                <div key={responsibility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`home-${responsibility}`}
                    checked={config.homeReferee.responsibilities.includes(responsibility)}
                    onCheckedChange={(checked) => 
                      handleResponsibilityToggle('homeReferee', responsibility, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`home-${responsibility}`}
                    className="flex items-center gap-2 font-normal"
                  >
                    {getResponsibilityIcon(responsibility)}
                    {ROLE_LABELS[responsibility as keyof typeof ROLE_LABELS]}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Away Team Referee */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {awayTeamName} Referee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="away-referee-name">Referee Name</Label>
              <Input
                id="away-referee-name"
                value={config.awayReferee.name}
                onChange={(e) => handleRefereeChange('awayReferee', 'name', e.target.value)}
                placeholder="Enter referee name..."
              />
            </div>

            <div className="space-y-3">
              <Label>Responsibilities</Label>
              {allResponsibilities.map((responsibility) => (
                <div key={responsibility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`away-${responsibility}`}
                    checked={config.awayReferee.responsibilities.includes(responsibility)}
                    onCheckedChange={(checked) => 
                      handleResponsibilityToggle('awayReferee', responsibility, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`away-${responsibility}`}
                    className="flex items-center gap-2 font-normal"
                  >
                    {getResponsibilityIcon(responsibility)}
                    {ROLE_LABELS[responsibility as keyof typeof ROLE_LABELS]}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => onSave(config)}
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

export default TwoRefereesConfiguration;
