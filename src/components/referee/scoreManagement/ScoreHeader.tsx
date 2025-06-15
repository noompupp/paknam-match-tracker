
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";
import React from "react";

interface ScoreHeaderProps {
  fixtureStatus: string;
  homeScore: number;
  awayScore: number;
  dbHomeScore: number;
  dbAwayScore: number;
}

const ScoreHeader = ({
  fixtureStatus,
  homeScore,
  awayScore,
  dbHomeScore,
  dbAwayScore,
}: ScoreHeaderProps) => (
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Score Management</CardTitle>
      <div className="flex gap-2">
        {fixtureStatus === "completed" && (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Match Completed
          </Badge>
        )}
        {(homeScore !== (dbHomeScore || 0) || awayScore !== (dbAwayScore || 0)) && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unsaved Changes
          </Badge>
        )}
      </div>
    </div>
  </CardHeader>
);

export default ScoreHeader;
