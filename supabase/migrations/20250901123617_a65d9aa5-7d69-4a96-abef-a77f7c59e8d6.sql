-- Schedule periodic sync job (runs every 2 hours)
SELECT cron.schedule(
  'periodic-player-stats-sync',
  '0 */2 * * *', -- Every 2 hours
  $$
  SELECT
    net.http_post(
        url:='https://tvtizejqfbeihsqkbxul.supabase.co/functions/v1/periodic-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dGl6ZWpxZmJlaWhzcWtieHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDkwMTgsImV4cCI6MjA2NDMyNTAxOH0.5Qmk3LrLjPZVazeeM4sZq283AVbSn_kdq2wuEvEEH5k"}'::jsonb,
        body:=concat('{"scheduled_run": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);