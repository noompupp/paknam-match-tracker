
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { MemberWithPayment, useUpdatePaymentStatus } from "@/hooks/useMemberPayments";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberWithPayment;
  month: Date;
  onQuickToggle: () => void;
}

const EditPaymentDialog: React.FC<EditPaymentDialogProps> = ({
  open,
  onOpenChange,
  member,
  month,
  onQuickToggle,
}) => {
  const { t } = useTranslation();
  const updatePaymentMutation = useUpdatePaymentStatus();

  const [status, setStatus] = useState<"paid" | "unpaid">(
    member.payment?.payment_status || "unpaid"
  );
  const [paymentDate, setPaymentDate] = useState(
    member.payment?.payment_date || new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState(
    member.payment?.payment_method || ""
  );
  const [notes, setNotes] = useState(member.payment?.notes || "");

  useEffect(() => {
    if (open) {
      setStatus(member.payment?.payment_status || "unpaid");
      setPaymentDate(member.payment?.payment_date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(member.payment?.payment_method || "");
      setNotes(member.payment?.notes || "");
    }
  }, [open, member]);

  const handleSave = () => {
    updatePaymentMutation.mutate(
      {
        paymentId: member.payment?.id,
        memberId: member.id,
        month: month,
        status: status,
        paymentDate: paymentDate,
        amount: 500, // Fixed amount
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-lg">{t('membership.editPayment')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Member</Label>
            <p className="text-sm font-medium">{member.nickname || member.name}</p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">{t('membership.status')}</Label>
            <div className="flex gap-2">
              <Button
                variant={status === "paid" ? "default" : "outline"}
                className={`flex-1 h-10 sm:h-11 text-sm ${status === "paid" ? "bg-green-600" : ""}`}
                onClick={() => setStatus("paid")}
              >
                {t('membership.markPaid')}
              </Button>
              <Button
                variant={status === "unpaid" ? "destructive" : "outline"}
                className="flex-1 h-10 sm:h-11 text-sm"
                onClick={() => setStatus("unpaid")}
              >
                {t('membership.markUnpaid')}
              </Button>
            </div>
          </div>

          {status === "paid" && (
            <>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{t('membership.fixedAmount')}</Label>
                <div className="p-2.5 sm:p-3 bg-muted rounded-md">
                  <p className="text-base sm:text-lg font-semibold">{t('membership.fixedAmountValue')}</p>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="paymentDate" className="text-xs sm:text-sm">{t('membership.paymentDate')}</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="h-10 sm:h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="paymentMethod" className="text-xs sm:text-sm">{t('membership.paymentMethod')}</Label>
                <Input
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Cash, Bank Transfer, etc."
                  className="h-10 sm:h-11 text-sm"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="notes" className="text-xs sm:text-sm">{t('membership.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
              className="text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none h-10 sm:h-11"
          >
            {t('membership.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updatePaymentMutation.isPending}
            className="flex-1 sm:flex-none h-10 sm:h-11"
          >
            {t('membership.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;
