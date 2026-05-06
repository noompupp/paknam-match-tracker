## Problem

After splitting data by season, the Membership tab now shows **Total members: 280** (it should be 140). Root cause is in three SQL functions that were never updated to scope by `season_id`:

1. `initialize_monthly_payments(target_month)` — inserts a payment row for every member in the `members` table, ignoring season. With 140 members per season × 2 seasons, April 2026 ended up with 280 rows.
2. `get_monthly_payment_summary(target_month)` — counts all rows for the month with no season filter, so the header card shows 280.
3. `get_payment_history(...)` and `get_member_status(...)` — also not season-aware. They look up by `member_id`, but since cloned members got NEW ids in Season 10, they happen to return correct rows by accident; still risky and inconsistent. We will add an optional `p_season_id` filter for correctness.

DB confirmation:
- `member_payments` April 2026: 280 rows under Season 10's `season_id`. All other months (historical) are under Season 9 with 140 each.

## Fix

### 1) Database migration

- Update `public.initialize_monthly_payments(target_month)` to:
  - Resolve target season via `public.get_current_season_id()`.
  - Insert payment rows only for members where `members.season_id = <current season>`.
  - Stamp `member_payments.season_id` explicitly with the current season (already defaulted, but make it explicit).
- Update `public.get_monthly_payment_summary(target_month)` to:
  - Filter `member_payments` by `season_id = public.get_current_season_id()`.
- Update `public.get_payment_history(p_member_id, p_months_back, p_reference_month)` to:
  - Add optional `p_season_id uuid DEFAULT public.get_current_season_id()` and filter `mp.season_id = p_season_id`.
- Update `public.get_member_status(p_member_id, p_reference_month)` to:
  - Filter member_payments lookups by `season_id = public.get_current_season_id()`.

### 2) Data cleanup (one-time)

Delete the 140 stray April 2026 rows in Season 10 that belong to Season 9 member ids, then let the UI re-initialize cleanly. Specifically:
```
DELETE FROM member_payments mp
USING members m
WHERE mp.payment_month = '2026-04-01'
  AND mp.season_id = '<season10 id>'
  AND mp.member_id = m.id
  AND m.season_id <> '<season10 id>';
```
(Done via the data tool, not migration.)

### 3) Frontend

- `useMonthlyPayments` / `usePaymentSummary`: include `seasonId` in the React Query key so switching season refetches and caches per-season correctly.
- `usePaymentHistory` / `useMemberStatus`: include `seasonId` in the query key. (RPCs themselves will resolve current season server-side; no extra args needed unless we want explicit override.)
- `useInitializeMonthlyPayments` invalidations: also include `seasonId` in the invalidated keys.
- No UI/copy changes — the header card will then correctly show 140.

## Out of scope

- Cross-season member history (will only show payments for the currently selected season).
- Editing historical Season 9 payments while viewing Season 10 (already prevented by season filtering).