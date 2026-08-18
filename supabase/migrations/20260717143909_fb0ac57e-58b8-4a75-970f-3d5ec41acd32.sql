
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_verification_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_booking_availability() FROM PUBLIC, anon, authenticated;
