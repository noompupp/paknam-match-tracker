
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getMonthKeyUTC } from "@/utils/dateUtils";

export interface MemberPayment {
  id: string;
  member_id: number;
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

/**
 * Fetch monthly payments for a specific month
 */
export function useMonthlyPayments(month: Date) {
  const monthStr = getMonthKeyUTC(month);
  
  return useQuery<MemberWithPayment[]>({
    queryKey: ["member_payments", monthStr],
    queryFn: async () => {
      // First get all members with __id__
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("id, __id__, name, real_name, nickname, is_fee_exempt, ProfileURL, line_id, line_name, team_id")
        .order("name");

      if (membersError) throw membersError;

      // Then get payments for this month
      const { data: payments, error: paymentsError } = await supabase
        .from("member_payments")
        .select("*")
        .eq("payment_month", monthStr);

      if (paymentsError) throw paymentsError;

      // Combine members with their payment status
      const paymentsMap = new Map(
        payments?.map(p => [p.member_id, p as MemberPayment]) || []
      );

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

  return useQuery<PaymentSummary>({
    queryKey: ["payment_summary", monthStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_monthly_payment_summary", {
          target_month: monthStr
        })
        .single();

      if (error) throw error;
      return data;
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
      queryClient.invalidateQueries({ queryKey: ["member_payments", monthStr] });
      queryClient.invalidateQueries({ queryKey: ["payment_summary", monthStr] });
      
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
      queryClient.invalidateQueries({ queryKey: ["member_payments", monthStr] });
      queryClient.invalidateQueries({ queryKey: ["payment_summary", monthStr] });
      
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
