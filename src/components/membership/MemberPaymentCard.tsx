import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, CheckCircle, XCircle, Hash } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserRole } from "@/hooks/useUserRole";
import { MemberWithPayment, useUpdatePaymentStatus } from "@/hooks/useMemberPayments";
import EditPaymentDialog from "./EditPaymentDialog";
import PaymentHistoryTimeline from "./PaymentHistoryTimeline";
import MembershipStatusBadge from "./MembershipStatusBadge";
import FeeExemptBadge from "./FeeExemptBadge";

interface MemberPaymentCardProps {
  member: MemberWithPayment;
  month: Date;
}

const MemberPaymentCard: React.FC<MemberPaymentCardProps> = ({ member, month }) => {
  const { t } = useTranslation();
  const { isAdmin } = useUserRole();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const updatePaymentMutation = useUpdatePaymentStatus();

  const isPaid = member.payment?.payment_status === 'paid';
  const isInactive = member.membershipStatus === 'inactive';
  const isExempt = member.is_fee_exempt || false;
  const memberId = member.__id__?.replace('M', '') || '—';

  const handleQuickToggle = () => {
    if (!isAdmin || isExempt) return;

    updatePaymentMutation.mutate({
      paymentId: member.payment?.id,
      memberId: member.id,
      month: month,
      status: isPaid ? 'unpaid' : 'paid',
      paymentDate: isPaid ? undefined : new Date().toISOString().split('T')[0],
    });
  };

  return (
    <>
      <Card className={`transition-all ${isInactive ? 'opacity-60 grayscale' : ''} ${isExempt ? 'border-amber-600/50' : isPaid ? 'border-green-500/30 bg-green-50/5' : 'border-red-500/30 bg-red-50/5'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className={`h-12 w-12 ${isInactive ? 'opacity-70' : ''}`}>
              <AvatarImage src={member.ProfileURL} alt={member.real_name || member.name} />
              <AvatarFallback>{(member.real_name || member.name).substring(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {/* Real Name as PRIMARY */}
                  <h3 className="font-semibold truncate">{member.real_name || member.name}</h3>
                  {/* Status Badges */}
                  {isExempt ? (
                    <FeeExemptBadge size="sm" />
                  ) : (
                    member.membershipStatus && (
                      <MembershipStatusBadge status={member.membershipStatus} size="sm" />
                    )
                  )}
                </div>
                
                {/* Nickname as SECONDARY */}
                {member.nickname && (
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    ({member.nickname})
                  </p>
                )}
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Hash className="w-3 h-3" />
                  <span>{t('membership.memberId')}: {memberId}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  {member.line_name && (
                    <p className="truncate">{t('membership.lineName')}: {member.line_name}</p>
                  )}
                  {member.line_id && (
                    <p className="truncate">{t('membership.lineId')}: {member.line_id}</p>
                  )}
                </div>
              </div>

              {/* Only show payment history for non-exempt members */}
              {!isExempt && member.paymentHistory?.months && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('membership.paymentHistory')}</p>
                  <PaymentHistoryTimeline history={member.paymentHistory.months} />
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {!isExempt && (
                <>
                  <Badge
                    variant={isPaid ? "default" : "destructive"}
                    className={isPaid ? "bg-green-600" : ""}
                  >
                    {isPaid ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {t(isPaid ? 'membership.statusPaid' : 'membership.statusUnpaid')}
                  </Badge>

                  {member.payment?.amount && (
                    <p className="text-sm text-muted-foreground">
                      ฿{member.payment.amount.toFixed(2)}
                    </p>
                  )}

                  {member.payment?.payment_date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(member.payment.payment_date).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}

              {isAdmin && !isExempt && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && !isExempt && (
        <EditPaymentDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          member={member}
          month={month}
          onQuickToggle={handleQuickToggle}
        />
      )}
    </>
  );
};

export default MemberPaymentCard;
