
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserRole } from "@/hooks/useUserRole";
import { MemberWithPayment, useUpdatePaymentStatus } from "@/hooks/useMemberPayments";
import EditPaymentDialog from "./EditPaymentDialog";

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

  const handleQuickToggle = () => {
    if (!isAdmin) return;

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
      <Card className={`transition-all ${isPaid ? 'border-green-500/30 bg-green-50/5' : 'border-red-500/30 bg-red-50/5'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.ProfileURL} alt={member.name} />
              <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{member.nickname || member.name}</h3>
              <div className="text-sm text-muted-foreground space-y-0.5">
                {member.line_name && (
                  <p className="truncate">{t('membership.lineName')}: {member.line_name}</p>
                )}
                {member.line_id && (
                  <p className="truncate">{t('membership.lineId')}: {member.line_id}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
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

              {isAdmin && (
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

          {member.payment?.amount && (
            <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
              <span>฿{member.payment.amount.toFixed(2)}</span>
              {member.payment.payment_date && (
                <span className="ml-2">• {new Date(member.payment.payment_date).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
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
