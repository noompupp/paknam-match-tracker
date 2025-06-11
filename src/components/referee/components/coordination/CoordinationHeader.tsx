
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle } from "lucide-react";
import { CoordinationData } from './types';

interface CoordinationHeaderProps {
  selectedFixtureData: any;
  coordinationData: CoordinationData | null;
  completedTasks: number;
  totalTasks: number;
}

const CoordinationHeader = ({ 
  selectedFixtureData, 
  coordinationData, 
  completedTasks, 
  totalTasks 
}: CoordinationHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Multi-Referee Coordination
        {coordinationData?.status === 'completed' && (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Finalized
          </Badge>
        )}
      </CardTitle>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedFixtureData.home_team?.name} vs {selectedFixtureData.away_team?.name}
        </p>
        {coordinationData && (
          <Badge variant="outline">
            {completedTasks}/{totalTasks} Tasks Complete
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};

export default CoordinationHeader;
