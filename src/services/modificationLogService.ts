
import { supabase } from "@/integrations/supabase/client";

/**
 * Logs a modification action to the modification_logs table.
 * @param params Parameters describing the action.
 */
export async function logMatchEventModification({
  fixtureId,
  userId,
  eventType,
  action,
  prevData,
  newData,
  notes,
}: {
  fixtureId: number;
  userId: string;
  eventType: string; // e.g. "goal_edit"
  action: string; // "edit" | "delete" | "create"
  prevData: any;
  newData?: any;
  notes?: string;
}) {
  const { error } = await supabase
    .from("modification_logs")
    .insert({
      fixture_id: fixtureId,
      user_id: userId,
      event_type: eventType,
      action,
      prev_data: prevData ? JSON.stringify(prevData) : "null",
      new_data: newData ? JSON.stringify(newData) : null,
      notes,
    });
  if (error) {
    console.error("❌ Failed to log event modification:", error);
    return false;
  }
  console.log("✅ Event modification logged");
  return true;
}
