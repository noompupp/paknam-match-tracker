
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStep } from "./types";
import { useTranslation } from "@/hooks/useTranslation";

interface StepIndicatorProps {
  currentStep: WizardStep;
  isOwnGoal: boolean;
}

const StepIndicator = ({ currentStep, isOwnGoal }: StepIndicatorProps) => {
  const { t } = useTranslation();
  const steps = ['team', 'player', 'goal-type', 'assist', 'confirm'];
  const currentIndex = steps.indexOf(currentStep);
  
  const getStepLabel = (step: string) => {
    switch (step) {
      case 'team': return t('wizard.step.team', 'Team');
      case 'player': return t('wizard.step.player', 'Player');
      case 'goal-type': return t('wizard.step.goalType', 'Type');
      case 'assist': return t('wizard.step.assist', 'Assist');
      case 'confirm': return t('wizard.step.confirm', 'Confirm');
      default: return step;
    }
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 min-w-max px-2">
        {steps.map((step, index) => {
          let isActive = index === currentIndex;
          let isCompleted = index < currentIndex;
          let isSkipped = step === 'assist' && isOwnGoal && index < currentIndex;
          
          return (
            <div key={step} className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  isCompleted || isSkipped ? 'bg-green-500 text-white dark:bg-green-600' :
                  isActive ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground'
                )}>
                  {isCompleted || isSkipped ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : index + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium text-center min-w-0 max-w-12 sm:max-w-16 truncate",
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {getStepLabel(step)}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-4 sm:w-8 h-0.5 mt-[-12px] sm:mt-[-16px]",
                  isCompleted || isSkipped ? 'bg-green-500 dark:bg-green-400' : 'bg-muted dark:bg-muted'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
