
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Play, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TaskCompletionButtonProps {
  assignment: {
    assignment_id: string;
    assigned_role: string;
    status: 'assigned' | 'active' | 'completed';
  };
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
  const [completionNotes, setCompletionNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleActivate = async () => {
    await onActivate(assignment.assignment_id);
  };

  const handleComplete = async () => {
    await onComplete(assignment.assignment_id, completionNotes);
    setCompletionNotes('');
    setIsDialogOpen(false);
  };

  if (assignment.status === 'completed') {
    return (
      <Button size="sm" variant="outline" disabled>
        <CheckCircle className="h-3 w-3 mr-1" />
        Completed
      </Button>
    );
  }

  if (assignment.status === 'assigned') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleActivate}
        disabled={isLoading}
      >
        <Play className="h-3 w-3 mr-1" />
        Start Task
      </Button>
    );
  }

  if (assignment.status === 'active') {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={isLoading}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Mark Complete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Mark your {assignment.assigned_role.replace('_', ' ')} assignment as completed.
              You can optionally add notes about the task completion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Optional completion notes..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default TaskCompletionButton;
