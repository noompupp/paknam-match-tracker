
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStep } from "./types";

interface StepIndicatorProps {
  currentStep: WizardStep;
  isOwnGoal: boolean;
}

const StepIndicator = ({ currentStep, isOwnGoal }: StepIndicatorProps) => {
  const steps = ['team', 'player', 'goal-type', 'assist', 'confirm'];
  const currentIndex = steps.indexOf(currentStep);
  
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => {
        let isActive = index === currentIndex;
        let isCompleted = index < currentIndex;
        let isSkipped = step === 'assist' && isOwnGoal && index < currentIndex;
        
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              isCompleted || isSkipped ? 'status-success' :
              isActive ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground'
            )}>
              {isCompleted || isSkipped ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-0.5",
                isCompleted || isSkipped ? 'bg-green-500 dark:bg-green-400' : 'bg-muted dark:bg-muted'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
