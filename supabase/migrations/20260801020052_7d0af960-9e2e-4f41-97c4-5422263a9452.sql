REVOKE ALL ON FUNCTION public.recalc_owner_trust(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalc_hostel_rating() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalc_safety_score() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalc_trust_from_activity() FROM PUBLIC, anon, authenticated;