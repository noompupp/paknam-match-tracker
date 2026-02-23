import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

interface PaymentExportRow {
  "Member Name": string;
  "Payment Month": string;
  "Payment Year": string;
  "Amount": number | string;
  "Payment Status": string;
  "Payment Date": string;
}

export async function exportPaymentHistoryToExcel() {
  // Fetch all members
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, name, real_name, nickname")
    .order("name");

  if (membersError) throw membersError;

  // Fetch all payment records with pagination to avoid 1000-row limit
  let allPayments: any[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data: page, error } = await supabase
      .from("member_payments")
      .select("*")
      .order("payment_month", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!page || page.length === 0) break;
    allPayments = allPayments.concat(page);
    if (page.length < pageSize) break;
    from += pageSize;
  }

  const payments = allPayments;

  const membersMap = new Map(
    (members || []).map((m) => [m.id, m.real_name || m.name || m.nickname || `Member #${m.id}`])
  );

  const rows: PaymentExportRow[] = (payments || []).map((p) => {
    const monthDate = new Date(p.payment_month);
    return {
      "Member Name": membersMap.get(p.member_id) || `Unknown (${p.member_id})`,
      "Payment Month": monthDate.toLocaleString("default", { month: "long" }),
      "Payment Year": String(monthDate.getFullYear()),
      "Amount": p.amount ?? "",
      "Payment Status": p.payment_status,
      "Payment Date": p.payment_date || "",
    };
  });

  if (rows.length === 0) {
    throw new Error("No payment data to export");
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  
  // Auto-size columns
  const colWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof PaymentExportRow]).length)) + 2,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payment History");
  XLSX.writeFile(wb, `payment_history_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
