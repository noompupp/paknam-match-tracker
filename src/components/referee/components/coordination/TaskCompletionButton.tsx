
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { AssignmentData } from '@/services/referee/coordinationService';

interface TaskCompletionButtonProps {
  assignment: AssignmentData;
  onActivate: (assignmentId: string) => Promise<void>;
  onComplete: (assignmentId: string, notes?: string) => Promise<void>;
  isLoading: boolean;
}

const TaskCompletionButton = ({ 
  assignment, 
  onActivate, 
  onComplete, 
  isLoading 
}: TaskCompletionButtonProps) => {
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const handleActivate = async () => {
    await onActivate(assignment.assignment_id);
  };

  const handleComplete = async () => {
    await onComplete(assignment.assignment_id, completionNotes);
    setShowCompletionForm(false);
    setCompletionNotes('');
  };

  const handleShowCompletionForm = () => {
    setShowCompletionForm(true);
  };

  if (assignment.status === 'completed') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Task Completed</span>
      </div>
    );
  }

  if (assignment.status === 'assigned') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleActivate}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Clock className="h-3 w-3" />
        Start Task
      </Button>
    );
  }

  if (assignment.status === 'active') {
    if (showCompletionForm) {
      return (
        <Card className="mt-3">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Complete Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Add any completion notes (optional)..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={isLoading}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCompletionForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Button
        size="sm"
        onClick={handleShowCompletionForm}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <CheckCircle className="h-3 w-3" />
        Complete Task
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <AlertCircle className="h-4 w-4" />
      <span>Unknown Status</span>
    </div>
  );
};

export default TaskCompletionButton;
