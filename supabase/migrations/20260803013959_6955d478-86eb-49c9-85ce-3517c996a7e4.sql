-- Sequences for human-readable reference ids
CREATE SEQUENCE IF NOT EXISTS public.ref_seq_student;
CREATE SEQUENCE IF NOT EXISTS public.ref_seq_owner;
CREATE SEQUENCE IF NOT EXISTS public.ref_seq_hostel;
CREATE SEQUENCE IF NOT EXISTS public.ref_seq_booking;
CREATE SEQUENCE IF NOT EXISTS public.ref_seq_review;
CREATE SEQUENCE IF NOT EXISTS public.ref_seq_safety;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ref_id text;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS ref_id text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS ref_id text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS ref_id text;
ALTER TABLE public.hostel_safety_scores ADD COLUMN IF NOT EXISTS ref_id text;

CREATE OR REPLACE FUNCTION public.make_ref_id(_prefix text, _seq text)
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT _prefix || '-' || lpad(nextval(_seq::regclass)::text, 6, '0');
$$;

-- profiles: STU / OWN based on the user's role
CREATE OR REPLACE FUNCTION public.assign_profile_ref_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE is_owner boolean;
BEGIN
  IF NEW.ref_id IS NOT NULL THEN RETURN NEW; END IF;
  SELECT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = NEW.id AND ur.role = 'owner') INTO is_owner;
  IF is_owner THEN
    NEW.ref_id := public.make_ref_id('OWN', 'public.ref_seq_owner');
  ELSE
    NEW.ref_id := public.make_ref_id('STU', 'public.ref_seq_student');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_hostel_ref_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ref_id IS NULL THEN NEW.ref_id := public.make_ref_id('HST', 'public.ref_seq_hostel'); END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.assign_booking_ref_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ref_id IS NULL THEN NEW.ref_id := public.make_ref_id('BK', 'public.ref_seq_booking'); END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.assign_review_ref_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ref_id IS NULL THEN NEW.ref_id := public.make_ref_id('REV', 'public.ref_seq_review'); END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.assign_safety_ref_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ref_id IS NULL THEN NEW.ref_id := public.make_ref_id('SAFE', 'public.ref_seq_safety'); END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_profiles_ref_id ON public.profiles;
CREATE TRIGGER trg_profiles_ref_id BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.assign_profile_ref_id();

DROP TRIGGER IF EXISTS trg_hostels_ref_id ON public.hostels;
CREATE TRIGGER trg_hostels_ref_id BEFORE INSERT ON public.hostels FOR EACH ROW EXECUTE FUNCTION public.assign_hostel_ref_id();

DROP TRIGGER IF EXISTS trg_bookings_ref_id ON public.bookings;
CREATE TRIGGER trg_bookings_ref_id BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.assign_booking_ref_id();

DROP TRIGGER IF EXISTS trg_reviews_ref_id ON public.reviews;
CREATE TRIGGER trg_reviews_ref_id BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.assign_review_ref_id();

DROP TRIGGER IF EXISTS trg_safety_ref_id ON public.hostel_safety_scores;
CREATE TRIGGER trg_safety_ref_id BEFORE INSERT ON public.hostel_safety_scores FOR EACH ROW EXECUTE FUNCTION public.assign_safety_ref_id();

-- Backfill existing records in a stable order
UPDATE public.profiles p
SET ref_id = public.make_ref_id(
  CASE WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'owner') THEN 'OWN' ELSE 'STU' END,
  CASE WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'owner') THEN 'public.ref_seq_owner' ELSE 'public.ref_seq_student' END)
WHERE p.ref_id IS NULL;

UPDATE public.hostels SET ref_id = public.make_ref_id('HST','public.ref_seq_hostel') WHERE ref_id IS NULL;
UPDATE public.bookings SET ref_id = public.make_ref_id('BK','public.ref_seq_booking') WHERE ref_id IS NULL;
UPDATE public.reviews SET ref_id = public.make_ref_id('REV','public.ref_seq_review') WHERE ref_id IS NULL;
UPDATE public.hostel_safety_scores SET ref_id = public.make_ref_id('SAFE','public.ref_seq_safety') WHERE ref_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_ref_id_key ON public.profiles(ref_id);
CREATE UNIQUE INDEX IF NOT EXISTS hostels_ref_id_key ON public.hostels(ref_id);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_ref_id_key ON public.bookings(ref_id);
CREATE UNIQUE INDEX IF NOT EXISTS reviews_ref_id_key ON public.reviews(ref_id);
CREATE UNIQUE INDEX IF NOT EXISTS hostel_safety_scores_ref_id_key ON public.hostel_safety_scores(ref_id);

GRANT USAGE, SELECT ON SEQUENCE public.ref_seq_student, public.ref_seq_owner, public.ref_seq_hostel, public.ref_seq_booking, public.ref_seq_review, public.ref_seq_safety TO authenticated, anon, service_role;