
import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Loader2 } from "lucide-react";
import { AssignmentData } from '@/services/referee/coordinationService';

interface TaskCompletionButtonProps {
  assignment: AssignmentData;
  onActivate: (assignmentId: string) => Promise<void>;
  onComplete: (assignmentId: string) => Promise<void>;
  isLoading: boolean;
}

const TaskCompletionButton = ({ 
  assignment, 
  onActivate, 
  onComplete, 
  isLoading 
}: TaskCompletionButtonProps) => {
  const handleActivate = () => {
    onActivate(assignment.assignment_id);
  };

  const handleComplete = () => {
    onComplete(assignment.assignment_id);
  };

  if (assignment.status === 'completed') {
    return (
      <Button variant="outline" disabled className="bg-green-50 border-green-200 text-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Button>
    );
  }

  if (assignment.status === 'active') {
    return (
      <Button 
        onClick={handleComplete}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3 mr-1" />
        )}
        Mark Complete
      </Button>
    );
  }

  // status === 'assigned'
  return (
    <Button 
      variant="outline" 
      onClick={handleActivate}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <Clock className="h-3 w-3 mr-1" />
      )}
      Start Task
    </Button>
  );
};

export default TaskCompletionButton;
