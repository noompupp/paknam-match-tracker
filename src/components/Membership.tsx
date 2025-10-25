import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Star, AlertCircle } from "lucide-react";
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
import BulkPaymentImport from "@/components/membership/BulkPaymentImport";

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

  // Helper function to sort members by ID
  const sortByMemberId = (memberList: typeof members) => {
    if (!memberList) return [];
    return [...memberList].sort((a, b) => {
      const idA = a.__id__?.replace('M', '') || '0';
      const idB = b.__id__?.replace('M', '') || '0';
      return idA.localeCompare(idB, undefined, { numeric: true });
    });
  };

  // Categorize and sort members for 4 tabs
  const nonExemptMembers = members?.filter(m => !m.is_fee_exempt) || [];
  
  // Tab 1: Unpaid - Non-exempt members unpaid for current month
  const unpaidMembers = sortByMemberId(
    nonExemptMembers.filter(m => 
      (m.payment?.payment_status === 'unpaid' || !m.payment) && 
      m.membershipStatus === 'active'
    ) || []
  );
  
  // Tab 2: Paid - Non-exempt members paid for current month
  const paidMembers = sortByMemberId(
    nonExemptMembers.filter(m => m.payment?.payment_status === 'paid') || []
  );
  
  // Tab 3: Fee Exempt - Members permanently exempt from payment
  const exemptMembers = sortByMemberId(
    members?.filter(m => m.is_fee_exempt) || []
  );
  
  // Tab 4: Inactive - Non-exempt members with inactive status (didn't pay M-1)
  const inactiveMembers = sortByMemberId(
    nonExemptMembers.filter(m => m.membershipStatus === 'inactive') || []
  );

  const handleInitializeMonth = () => {
    initializeMonthMutation.mutate(selectedMonth);
  };

  const hasNoData = !membersLoading && members && members.length > 0 && !members.some(m => m.payment);

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedPageHeader title={t('membership.title')} />

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6">
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

        {/* Bulk Import Tool - Admin Only */}
        {isAdmin && (
          <div className="mb-6">
            <BulkPaymentImport />
          </div>
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
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="unpaid" className="relative flex-col sm:flex-row gap-1 py-2 sm:py-3 text-xs sm:text-sm">
                <span className="truncate">{t('membership.unpaid')}</span>
                <Badge className="text-[10px] sm:text-xs px-1 sm:px-2 bg-destructive text-destructive-foreground">
                  {unpaidMembers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="paid" className="relative flex-col sm:flex-row gap-1 py-2 sm:py-3 text-xs sm:text-sm">
                <span className="truncate">{t('membership.paid')}</span>
                <Badge className="text-[10px] sm:text-xs px-1 sm:px-2 bg-green-600 text-white">
                  {paidMembers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="exempt" className="relative flex-col sm:flex-row gap-1 py-2 sm:py-3 text-xs sm:text-sm">
                <span className="truncate">{t('membership.exemptMembers')}</span>
                <Badge className="text-[10px] sm:text-xs px-1 sm:px-2 bg-amber-600 text-white">
                  {exemptMembers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive" className="relative flex-col sm:flex-row gap-1 py-2 sm:py-3 text-xs sm:text-sm">
                <span className="truncate">{t('membership.inactiveMembers')}</span>
                <Badge className="text-[10px] sm:text-xs px-1 sm:px-2 bg-muted text-muted-foreground">
                  {inactiveMembers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unpaid" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
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

            <TabsContent value="paid" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
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

            <TabsContent value="exempt" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
              {exemptMembers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No fee exempt members.
                  </CardContent>
                </Card>
              ) : (
                exemptMembers.map((member) => (
                  <MemberPaymentCard
                    key={member.id}
                    member={member}
                    month={selectedMonth}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="inactive" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
              {inactiveMembers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No inactive members.
                  </CardContent>
                </Card>
              ) : (
                inactiveMembers.map((member) => (
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
