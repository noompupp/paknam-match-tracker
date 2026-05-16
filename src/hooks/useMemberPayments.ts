
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getMonthKeyUTC } from "@/utils/dateUtils";
import { getCurrentSeasonId } from "@/lib/seasonStore";

export interface MemberPayment {
  id: string;
  member_id: number;
  season_id?: string | null;
  payment_month: string;
  payment_status: "paid" | "unpaid";
  payment_date?: string | null;
  amount?: number | null;
  payment_method?: string | null;
  notes?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberWithPayment {
  id: number;
  __id__?: string; // Text ID like "M001"
  name: string;
  real_name?: string; // Real name field
  nickname?: string;
  is_fee_exempt?: boolean; // Fee exemption flag
  ProfileURL?: string;
  line_id?: string;
  line_name?: string;
  team_id?: string;
  payment?: MemberPayment;
  paymentHistory?: any; // Payment history data
  membershipStatus?: 'active' | 'inactive'; // Membership status
}

export interface PaymentSummary {
  total_members: number;
  paid_count: number;
  unpaid_count: number;
  total_amount: number;
  payment_month: string;
}

type MemberIdentity = {
  id: number;
  __id__?: string | null;
  season_id?: string | null;
};

const canonicalMemberKey = (memberId?: string | null) =>
  (memberId || "").replace(/_s\d+$/i, "");

const selectBestPayment = (payments: MemberPayment[] = []) => {
  if (payments.length === 0) return undefined;
  return [...payments].sort((a, b) => {
    if (a.payment_status !== b.payment_status) {
      return a.payment_status === "paid" ? -1 : 1;
    }
    const aDate = a.payment_date ? new Date(a.payment_date).getTime() : 0;
    const bDate = b.payment_date ? new Date(b.payment_date).getTime() : 0;
    if (aDate !== bDate) return bDate - aDate;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  })[0];
};

const fetchMembersForCurrentSeason = async () => {
  const seasonId = getCurrentSeasonId();
  let mq = supabase
    .from("members")
    .select("id, __id__, name, real_name, nickname, is_fee_exempt, ProfileURL, line_id, line_name, team_id")
    .order("name");
  if (seasonId) mq = mq.eq("season_id", seasonId);

  const { data, error } = await mq;
  if (error) throw error;
  return data || [];
};

const fetchCanonicalPaymentsForMonth = async (
  members: MemberIdentity[],
  monthStr: string
) => {
  if (members.length === 0) return new Map<number, MemberPayment | undefined>();

  const canonicalKeys = new Set(members.map((member) => canonicalMemberKey(member.__id__)));
  const { data: identities, error: identitiesError } = await supabase
    .from("members")
    .select("id, __id__, season_id");

  if (identitiesError) throw identitiesError;

  const idsByCanonicalKey = new Map<string, number[]>();
  (identities as MemberIdentity[] | null)?.forEach((identity) => {
    const key = canonicalMemberKey(identity.__id__);
    if (!canonicalKeys.has(key)) return;
    const ids = idsByCanonicalKey.get(key) || [];
    ids.push(identity.id);
    idsByCanonicalKey.set(key, ids);
  });

  const allMemberIds = Array.from(new Set(Array.from(idsByCanonicalKey.values()).flat()));
  if (allMemberIds.length === 0) return new Map<number, MemberPayment | undefined>();

  const { data: payments, error: paymentsError } = await supabase
    .from("member_payments")
    .select("*")
    .eq("payment_month", monthStr)
    .in("member_id", allMemberIds);

  if (paymentsError) throw paymentsError;

  const paymentsByMemberId = new Map<number, MemberPayment[]>();
  (payments || []).forEach((payment) => {
    const memberPayments = paymentsByMemberId.get(payment.member_id) || [];
    memberPayments.push(payment as MemberPayment);
    paymentsByMemberId.set(payment.member_id, memberPayments);
  });

  return new Map(
    members.map((member) => {
      const relatedIds = idsByCanonicalKey.get(canonicalMemberKey(member.__id__)) || [member.id];
      const relatedPayments = relatedIds.flatMap((id) => paymentsByMemberId.get(id) || []);
      return [member.id, selectBestPayment(relatedPayments)];
    })
  );
};

/**
 * Fetch monthly payments for a specific month
 */
export function useMonthlyPayments(month: Date) {
  const monthStr = getMonthKeyUTC(month);
  const seasonId = getCurrentSeasonId();

  return useQuery<MemberWithPayment[]>({
    queryKey: ["member_payments", monthStr, seasonId],
    queryFn: async () => {
      const members = await fetchMembersForCurrentSeason();
      const paymentsMap = await fetchCanonicalPaymentsForMonth(members, monthStr);

      // Get payment history and status for each member
      const membersWithPayments = await Promise.all(
        (members || []).map(async (member) => {
          // Get payment history relative to selected month
          const { data: historyData } = await supabase
            .rpc('get_payment_history', {
              p_member_id: member.id,
              p_months_back: 6,
              p_reference_month: monthStr
            });

          // Get membership status
          const { data: statusData } = await supabase
            .rpc('get_member_status', {
              p_member_id: member.id,
              p_reference_month: monthStr
            });

          return {
            ...member,
            payment: paymentsMap.get(member.id),
            paymentHistory: historyData,
            membershipStatus: statusData as 'active' | 'inactive'
          };
        })
      );

      return membersWithPayments as MemberWithPayment[];
    },
  });
}

/**
 * Get payment summary for a specific month
 */
export function usePaymentSummary(month: Date) {
  const monthStr = getMonthKeyUTC(month);
  const seasonId = getCurrentSeasonId();

  return useQuery<PaymentSummary>({
    queryKey: ["payment_summary", monthStr, seasonId],
    queryFn: async () => {
      const members = await fetchMembersForCurrentSeason();
      const paymentsMap = await fetchCanonicalPaymentsForMonth(members, monthStr);
      const payments = members.map((member) => paymentsMap.get(member.id));
      const paidPayments = payments.filter((payment) => payment?.payment_status === "paid");

      return {
        total_members: members.length,
        paid_count: paidPayments.length,
        unpaid_count: members.length - paidPayments.length,
        total_amount: paidPayments.reduce((sum, payment) => sum + Number(payment?.amount || 0), 0),
        payment_month: monthStr,
      };
    },
  });
}

/**
 * Initialize payment records for all members for a given month
 */
export function useInitializeMonthlyPayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (month: Date) => {
      const monthStr = getMonthKeyUTC(month);
      const { data, error } = await supabase
        .rpc("initialize_monthly_payments", {
          target_month: monthStr
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, month) => {
      const monthStr = getMonthKeyUTC(month);
      queryClient.invalidateQueries({ queryKey: ["member_payments", monthStr], exact: false });
      queryClient.invalidateQueries({ queryKey: ["payment_summary", monthStr], exact: false });
      
      const result = data as any;
      toast({
        title: "Success",
        description: `Initialized ${result?.inserted_count || 0} payment records`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize month",
        variant: "destructive",
      });
    },
  });
}

/**
 * Update payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      paymentId,
      memberId,
      month,
      status,
      paymentDate,
      amount,
      paymentMethod,
      notes,
    }: {
      paymentId?: string;
      memberId: number;
      month: Date;
      status: "paid" | "unpaid";
      paymentDate?: string;
      amount?: number;
      paymentMethod?: string;
      notes?: string;
    }) => {
      const monthStr = getMonthKeyUTC(month);

      if (paymentId) {
        // Update existing payment
        const { data, error } = await supabase
          .from("member_payments")
          .update({
            payment_status: status,
            payment_date: paymentDate,
            amount: amount,
            payment_method: paymentMethod,
            notes: notes,
          })
          .eq("id", paymentId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new payment record
        const { data, error } = await supabase
          .from("member_payments")
          .insert({
            member_id: memberId,
            payment_month: monthStr,
            payment_status: status,
            payment_date: paymentDate,
            amount: amount,
            payment_method: paymentMethod,
            notes: notes,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      const monthStr = getMonthKeyUTC(variables.month);
      queryClient.invalidateQueries({ queryKey: ["member_payments", monthStr], exact: false });
      queryClient.invalidateQueries({ queryKey: ["payment_summary", monthStr], exact: false });
      
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    },
  });
}

/**
 * Fetch payment history for a member
 */
export function usePaymentHistory(memberId: number, monthsBack: number = 6) {
  return useQuery({
    queryKey: ['payment-history', memberId, monthsBack],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_payment_history', {
          p_member_id: memberId,
          p_months_back: monthsBack
        });
      
      if (error) throw error;
      return data;
    },
    enabled: !!memberId,
  });
}

/**
 * Fetch membership status for a member
 */
export function useMemberStatus(memberId: number, referenceMonth?: Date) {
  return useQuery({
    queryKey: ['member-status', memberId, referenceMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_member_status', {
          p_member_id: memberId,
          p_reference_month: referenceMonth ? getMonthKeyUTC(referenceMonth) : undefined
        });
      
      if (error) throw error;
      return data as 'active' | 'inactive';
    },
    enabled: !!memberId,
  });
}
