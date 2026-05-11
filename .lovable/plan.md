## Goal

Restore the display of historical monthly payment data (months before May 2026 / พ.ค. 2569) inside the Membership tab.

## Why data is missing

When Season 10 was created, members were cloned with new IDs (e.g. `M023` → `M023_s10`) and new internal numeric ids. The `member_payments` rows for previous months are still attached to the **Season 9** member ids, so the current `get_payment_history` and `get_member_status` RPCs — which look up by the Season 10 member id — return no historical rows.

## Fix

Apply the already-prepared migration `supabase/migrations/20260506090000_payment_canonical_member_lookup.sql`, which:

1. Adds a helper `public.canonical_member_key(text)` that strips the `_sN` season suffix from `members.__id__` (e.g. `M023_s10` → `M023`).
2. Rewrites `public.get_payment_history(...)` to:
   - Resolve the canonical key for the requested member.
   - Collect every `members.id` that shares that canonical key (across seasons).
   - Query `member_payments` with `member_id = ANY(<all matching ids>)`, so Season 10 members inherit the timeline of their Season 9 counterpart.
3. Rewrites `public.get_member_status(...)` with the same cross-season lookup, so Active/Inactive status correctly considers prior-season payments.

No frontend changes are needed — the UI already calls these RPCs through `usePaymentHistory` / `useMemberStatus` in `src/hooks/useMemberPayments.ts`.

## Out of scope

- Editing or merging historical Season 9 `member_payments` rows.
- Changing the current-month summary card (already fixed in the previous migration).
- Any UI/copy changes.

## Verification after migration

- Open Membership tab → a Season 10 member who paid in earlier months should show the paid dots in the 6-month timeline.
- The "Total members" header should still read 140 (unchanged).
- Membership status badges (Active/Inactive) should reflect last month's payment again.
