
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
    <Card className="mb-3 sm:mb-4">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Wallet className="h-4 w-4 sm:h-6 sm:w-6" />
          {t('membership.summary')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('membership.totalMembers')}</p>
            <p className="text-xl sm:text-2xl font-bold">{summary?.total_members || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('membership.paidCount')}</p>
            <Badge variant="default" className="text-sm sm:text-lg px-2 sm:px-4 py-0.5 sm:py-1 bg-green-600">
              {summary?.paid_count || 0}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('membership.unpaidCount')}</p>
            <Badge variant="destructive" className="text-sm sm:text-lg px-2 sm:px-4 py-0.5 sm:py-1">
              {summary?.unpaid_count || 0}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t('membership.totalAmount')}</p>
            <p className="text-xl sm:text-2xl font-bold">฿{summary?.total_amount?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipHeader;
