
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserRole } from "@/hooks/useUserRole";
import {
  useMonthlyPayments,
  usePaymentSummary,
  useInitializeMonthlyPayments,
} from "@/hooks/useMemberPayments";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import MembershipHeader from "@/components/membership/MembershipHeader";
import MonthSelector from "@/components/membership/MonthSelector";
import MemberPaymentCard from "@/components/membership/MemberPaymentCard";

const Membership: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useUserRole();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { data: members, isLoading: membersLoading } = useMonthlyPayments(selectedMonth);
  const { data: summary, isLoading: summaryLoading } = usePaymentSummary(selectedMonth);
  const initializeMonthMutation = useInitializeMonthlyPayments();

  const paidMembers = members?.filter(m => m.payment?.payment_status === 'paid') || [];
  const unpaidMembers = members?.filter(m => m.payment?.payment_status === 'unpaid' || !m.payment) || [];

  const handleInitializeMonth = () => {
    initializeMonthMutation.mutate(selectedMonth);
  };

  const hasNoData = !membersLoading && members && members.length > 0 && !members.some(m => m.payment);

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedPageHeader title={t('membership.title')} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        {summaryLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <MembershipHeader summary={summary} />
        )}

        {hasNoData && isAdmin && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">{t('membership.noData')}</p>
              <Button
                onClick={handleInitializeMonth}
                disabled={initializeMonthMutation.isPending}
              >
                {initializeMonthMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('membership.initializeMonth')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {membersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="unpaid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unpaid" className="relative">
                {t('membership.unpaid')}
                {unpaidMembers.length > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {unpaidMembers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="paid" className="relative">
                {t('membership.paid')}
                {paidMembers.length > 0 && (
                  <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {paidMembers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unpaid" className="space-y-3 mt-4">
              {unpaidMembers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    All members have paid for this month! 🎉
                  </CardContent>
                </Card>
              ) : (
                unpaidMembers.map((member) => (
                  <MemberPaymentCard
                    key={member.id}
                    member={member}
                    month={selectedMonth}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-3 mt-4">
              {paidMembers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No members have paid yet for this month.
                  </CardContent>
                </Card>
              ) : (
                paidMembers.map((member) => (
                  <MemberPaymentCard
                    key={member.id}
                    member={member}
                    month={selectedMonth}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Membership;
