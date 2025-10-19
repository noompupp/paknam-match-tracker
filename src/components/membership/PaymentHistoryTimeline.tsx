import React from "react";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PaymentHistoryMonth {
  month: string;
  status: 'paid' | 'unpaid';
  amount?: number;
  payment_date?: string;
}

interface PaymentHistoryTimelineProps {
  history: PaymentHistoryMonth[];
}

const PaymentHistoryTimeline: React.FC<PaymentHistoryTimelineProps> = ({ history }) => {
  if (!history?.length) return null;

  return (
    <TooltipProvider>
      <div className="flex gap-1 items-center">
      {history.map((month, index) => {
          const monthDate = new Date(Date.UTC(
            Number(month.month.slice(0, 4)),
            Number(month.month.slice(5, 7)) - 1,
            1
          ));
          const monthLabel = format(monthDate, 'MMM');
          const isPaid = month.status === 'paid';

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    isPaid
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}
                >
                  {isPaid ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <p className="font-semibold">{monthLabel} {format(monthDate, 'yyyy')}</p>
                  <p>Status: <span className={isPaid ? 'text-green-600' : 'text-red-600'}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </span></p>
                  {isPaid && month.amount && (
                    <p>Amount: ฿{month.amount.toFixed(2)}</p>
                  )}
                  {isPaid && month.payment_date && (
                    <p>Date: {format(new Date(month.payment_date), 'MMM d, yyyy')}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default PaymentHistoryTimeline;
