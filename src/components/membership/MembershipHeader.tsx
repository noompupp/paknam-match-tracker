
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { PaymentSummary } from "@/hooks/useMemberPayments";

interface MembershipHeaderProps {
  summary?: PaymentSummary;
}

const MembershipHeader: React.FC<MembershipHeaderProps> = ({ summary }) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          {t('membership.summary')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('membership.totalMembers')}</p>
            <p className="text-2xl font-bold">{summary?.total_members || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('membership.paidCount')}</p>
            <Badge variant="default" className="text-lg px-4 py-1 bg-green-600">
              {summary?.paid_count || 0}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('membership.unpaidCount')}</p>
            <Badge variant="destructive" className="text-lg px-4 py-1">
              {summary?.unpaid_count || 0}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('membership.totalAmount')}</p>
            <p className="text-2xl font-bold">฿{summary?.total_amount?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipHeader;
