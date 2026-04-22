

# Plan: Multi-Season Support for "ปากน้ำฟุตบอลลีก ครั้งที่ 10"

Add season support so that the entire Season 9 dataset (teams, players, fixtures, events, stats, payments) is preserved as a frozen historical snapshot, while Season 10 starts as a clone that admins can edit independently. Users get a Season switcher in the UI to view either season's data.

## 1. Database — add a `seasons` system

New table `seasons`:
- `id` (uuid PK), `season_number` (int, unique, e.g. 9, 10), `name` (e.g. "ปากน้ำฟุตบอลลีก ครั้งที่ 10"), `is_active` (bool — only one active at a time), `is_current_default` (bool — controls default view), `started_at`, `ended_at`, `created_at`.

Add a nullable `season_id uuid` column to all season-scoped tables:
- `teams`, `members`, `fixtures`, `match_events`, `player_time_tracking`, `member_payments`, `league_table_operations`

Step-by-step migration:
1. Create `seasons` table; insert Season 9 row (active, default).
2. Add `season_id` column to all 7 tables above (nullable).
3. Backfill: set `season_id = <Season 9 id>` for every existing row in those tables.
4. Set `season_id NOT NULL` with default = current active season.
5. Add indexes on `season_id` for performance.
6. Insert Season 10 row (active=true, default=true); flip Season 9's default flag off.
7. Run a clone procedure (SQL function `clone_season(src_season_id, dst_season_id)`) that copies, for Season 10:
   - All 6 teams (new rows, reset stats: played/won/drawn/lost/goals/points/position = 0; keep name/logo/color/captain — admin will edit later).
   - All members (new rows, reset goals/assists/cards/matches_played/minutes = 0; preserve name/number/position/role/team_id mapping using a temp old→new ID map).
   - **Do NOT clone**: fixtures, match_events, player_time_tracking, member_payments. Season 10 starts with empty match data and empty payment ledger.
8. RLS: extend existing policies — public read on all seasons; writes still admin/referee only.

## 2. Backend services — make queries season-aware

Add `src/contexts/SeasonContext.tsx` providing `currentSeasonId`, `setCurrentSeasonId`, `seasons[]`. Persist selection in `localStorage`.

Update every service that reads season-scoped tables to filter by `season_id`:
- `leagueTableService.ts` — filter teams + fixtures
- `teamsApi.ts`, `membersApi.ts`, `fixtures/*`, `matchEventsApi.ts`, `playerStatsApi.ts`, `memberStatsService.ts`, `enhancedTeamStatsService.ts`, `dashboardDataService.ts`, `playerDropdownService.ts`, payment services
- All hooks (`useTeams`, `useFixtures`, `useMembers`, `useMemberPayments`, etc.) read `currentSeasonId` from context and include it in the React Query `queryKey` so switching seasons refetches cleanly.

Writes (referee score updates, match events, payments) always use the **active** season id (server-side default), never the viewing season id, to prevent cross-season writes when an admin is browsing history.

## 3. UI — Season switcher + admin tools

**Season switcher (visible to all users)**
- Add a `<SeasonSelector />` dropdown in `RoleBasedNavigation` header / top of `Dashboard`.
- Shows: "ครั้งที่ 10 (ปัจจุบัน)" / "ครั้งที่ 9 (ประวัติ)".
- When a non-current season is selected, show a yellow banner "กำลังดูข้อมูลฤดูกาลที่ผ่านมา (อ่านอย่างเดียว)" and disable referee/admin write actions in the UI.

**Admin: Season Management page** (admin only, in `MorePage` or new tab)
- List seasons with status (active/historical/default).
- "Clone from previous season" button → calls the `clone_season` RPC.
- "Set as current" toggle.
- Edit Season 10 metadata: tournament name, start date.

**Roster editing flow for Season 10** (admin)
- After clone, admin can:
  - Rename teams (Teams page edit dialog — already exists, scoped to current season).
  - Reassign captains.
  - Add new members / remove departed members (Members admin — scoped to Season 10 only; Season 9 rows untouched).
  - Reassign players to new teams.

## 4. Data isolation guarantees

- Editing a Season 10 team/member/fixture only updates the Season 10 row. Season 9 rows are immutable from the UI (read-only banner + disabled buttons + server still allows writes only to active season for non-admins; admins can override via Season Management if needed).
- Stats triggers (`calculate_cumulative_player_stats`, `enhanced_auto_sync_player_stats`) updated to scope aggregation by `season_id` so Season 10 events never affect Season 9 player totals.

## 5. Technical details

**Files created**
- `supabase/migrations/<timestamp>_add_seasons.sql` (schema + backfill + clone function)
- `src/contexts/SeasonContext.tsx`
- `src/hooks/useSeasons.ts`, `src/hooks/useCurrentSeason.ts`
- `src/services/seasonsService.ts`
- `src/components/shared/SeasonSelector.tsx`
- `src/components/shared/HistoricalSeasonBanner.tsx`
- `src/components/admin/SeasonManagement.tsx`

**Files modified (high-impact)**
- `src/App.tsx` — wrap with `SeasonProvider`
- `src/components/auth/RoleBasedNavigation.tsx` — mount `SeasonSelector`
- All hooks listed in section 2 — add `seasonId` to query keys + filters
- All services listed in section 2 — accept/apply `season_id` filter
- DB triggers `calculate_cumulative_player_stats`, `enhanced_auto_sync_player_stats`, `update_match_participation`, `sync_all_match_participation`, `get_enhanced_match_summary`, `get_monthly_payment_summary`, `get_payment_history`, `initialize_monthly_payments` — scope by `season_id`

**Clone function signature**
```sql
clone_season(p_source_season_id uuid, p_target_season_name text, p_target_season_number int)
returns jsonb -- { success, target_season_id, teams_copied, members_copied }
```

**Migration safety**
- All schema changes are additive (new column, new table). No destructive changes to Season 9 data.
- Backfill runs in a single transaction.
- A separate SQL preview will be shown before running the migration.

## 6. Out of scope (confirm if needed)

- Season-by-season comparison views / cross-season player history page.
- Archiving Season 9 fixtures into a separate read-only storage.
- Multi-tenant separation beyond seasons.

If you'd like any of the above included, say so before approval; otherwise I'll proceed exactly as planned above.

