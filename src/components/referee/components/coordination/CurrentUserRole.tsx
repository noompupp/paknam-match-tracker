
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from './constants';

interface CurrentUserRoleProps {
  currentUserRole: string;
}

const CurrentUserRole = ({ currentUserRole }: CurrentUserRoleProps) => {
  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">Your Assignment</Badge>
        </div>
        <p className="text-sm font-medium">
          {ROLE_LABELS[currentUserRole as keyof typeof ROLE_LABELS]}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          You are responsible for this aspect of the match
        </p>
      </CardContent>
    </Card>
  );
};

export default CurrentUserRole;
