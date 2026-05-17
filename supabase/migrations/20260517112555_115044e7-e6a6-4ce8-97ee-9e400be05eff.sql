INSERT INTO fixtures (__id__, season_id, home_team_id, away_team_id, team1, team2, match_date, "matchNo", status)
SELECT 'M' || LPAD(ROW_NUMBER() OVER (ORDER BY f.id)::text, 2, '0') || '_s10',
       '3ad28fff-225c-465e-b318-12647e2a0497'::uuid,
       f.home_team_id || '_s10',
       f.away_team_id || '_s10',
       COALESCE(f.team1, f.home_team_id) || '_s10',
       COALESCE(f.team2, f.away_team_id) || '_s10',
       '2026-04-22'::date,
       f."matchNo",
       'scheduled'
FROM fixtures f
WHERE f.season_id = '948c8978-9d5e-4bcd-a8e4-ff977eb43a12'
ORDER BY f.id;