INSERT INTO public.member_payments (member_id, payment_month, payment_status, amount, season_id)
SELECT m.id, months.payment_month, 'unpaid', 500.00, '948c8978-9d5e-4bcd-a8e4-ff977eb43a12'::uuid
FROM public.members m
CROSS JOIN (
  VALUES ('2025-11-01'::date), ('2025-12-01'::date),
         ('2026-01-01'::date), ('2026-02-01'::date), ('2026-03-01'::date)
) AS months(payment_month)
WHERE m.season_id = '948c8978-9d5e-4bcd-a8e4-ff977eb43a12'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM public.member_payments mp
    WHERE mp.member_id = m.id AND mp.payment_month = months.payment_month
  );