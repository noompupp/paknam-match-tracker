
-- Drop the older version of approve_player_rating function (5 parameters)
-- This will resolve the "Could not choose the best candidate function" error
DROP FUNCTION IF EXISTS public.approve_player_rating(integer, integer, text, text, text);
