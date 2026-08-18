-- 1. Hostel location fields
ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS nearby_college text;

-- 2. Student preferred location / college
ALTER TABLE public.student_preferences
  ADD COLUMN IF NOT EXISTS preferred_location text,
  ADD COLUMN IF NOT EXISTS preferred_lat double precision,
  ADD COLUMN IF NOT EXISTS preferred_lng double precision,
  ADD COLUMN IF NOT EXISTS preferred_radius_km numeric NOT NULL DEFAULT 10;

-- 3. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  is_anonymous boolean NOT NULL DEFAULT false,
  owner_reply text,
  owner_replied_at timestamptz,
  is_reported boolean NOT NULL DEFAULT false,
  report_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Verified guests can create one review per booking"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.student_id = auth.uid()
        AND b.hostel_id = reviews.hostel_id
        AND b.status = 'confirmed'
        AND b.move_in_date <= CURRENT_DATE
    )
  );

CREATE POLICY "Students can edit their review within 24 hours"
  ON public.reviews FOR UPDATE TO authenticated
  USING (student_id = auth.uid() AND created_at > now() - interval '24 hours')
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Owners can reply to reviews on their hostels"
  ON public.reviews FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Students can delete their review within 24 hours"
  ON public.reviews FOR DELETE TO authenticated
  USING (student_id = auth.uid() AND created_at > now() - interval '24 hours');

CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Recalculate hostel rating + owner trust from reviews
CREATE OR REPLACE FUNCTION public.recalc_owner_trust(_owner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_verified boolean := false;
  v_avg numeric := 0;
  v_reviews integer := 0;
  v_complaints integer := 0;
  v_bookings integer := 0;
  v_response numeric := 0;
  v_months integer := 0;
  v_score numeric := 0;
BEGIN
  IF _owner_id IS NULL THEN RETURN; END IF;

  SELECT COALESCE(p.is_verified,false),
         COALESCE(p.avg_response_minutes,0),
         GREATEST(0, (EXTRACT(EPOCH FROM (now() - p.created_at)) / 2592000)::int)
    INTO v_verified, v_response, v_months
  FROM public.profiles p WHERE p.id = _owner_id;

  SELECT COALESCE(AVG(r.rating),0), COUNT(*)
    INTO v_avg, v_reviews
  FROM public.reviews r WHERE r.owner_id = _owner_id;

  SELECT COUNT(*) INTO v_complaints
  FROM public.complaints c WHERE c.owner_id = _owner_id AND c.status <> 'resolved';

  SELECT COUNT(*) INTO v_bookings
  FROM public.bookings b WHERE b.owner_id = _owner_id AND b.status = 'confirmed';

  v_score :=
      LEAST(1, v_avg / 5.0) * 30
    + (CASE WHEN v_verified THEN 20 ELSE 0 END)
    + LEAST(1, v_bookings / 50.0) * 15
    + (CASE WHEN v_response > 0 THEN LEAST(1, 30.0 / v_response) * 15 ELSE 7.5 END)
    + GREATEST(0, 10 - LEAST(10, v_complaints))
    + LEAST(1, v_months / 24.0) * 10;

  INSERT INTO public.owner_trust_scores AS o
    (owner_id, verified, avg_rating, complaints_count, bookings_completed,
     response_minutes, months_on_platform, score)
  VALUES (_owner_id, v_verified, ROUND(v_avg,2), v_complaints, v_bookings,
          v_response, v_months, ROUND(v_score))
  ON CONFLICT (owner_id) DO UPDATE SET
    verified = EXCLUDED.verified,
    avg_rating = EXCLUDED.avg_rating,
    complaints_count = EXCLUDED.complaints_count,
    bookings_completed = EXCLUDED.bookings_completed,
    response_minutes = EXCLUDED.response_minutes,
    months_on_platform = EXCLUDED.months_on_platform,
    score = EXCLUDED.score,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.recalc_hostel_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_hostel uuid := COALESCE(NEW.hostel_id, OLD.hostel_id);
  v_owner uuid := COALESCE(NEW.owner_id, OLD.owner_id);
BEGIN
  UPDATE public.hostels h
  SET rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.reviews r WHERE r.hostel_id = v_hostel), 0),
      review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.hostel_id = v_hostel)
  WHERE h.id = v_hostel;

  PERFORM public.recalc_owner_trust(v_owner);
  RETURN NULL;
END;
$$;

CREATE TRIGGER reviews_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalc_hostel_rating();

-- 5. Safety score recalculation from amenity flags
CREATE OR REPLACE FUNCTION public.recalc_safety_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v numeric := 0;
BEGIN
  v := (CASE WHEN NEW.has_cctv THEN 22 ELSE 0 END)
     + (CASE WHEN NEW.has_security_guard THEN 22 ELSE 0 END)
     + (CASE WHEN NEW.has_fire_safety THEN 18 ELSE 0 END)
     + (CASE WHEN NEW.nearby_hospital THEN 19 ELSE 0 END)
     + (CASE WHEN NEW.nearby_police THEN 19 ELSE 0 END);

  -- unresolved safety complaints reduce the score
  v := GREATEST(0, v - LEAST(20, 4 * (
    SELECT COUNT(*) FROM public.complaints c
    WHERE c.hostel_id = NEW.hostel_id AND c.category = 'safety' AND c.status <> 'resolved'
  )));

  NEW.score := v;
  NEW.level := CASE WHEN v >= 85 THEN 'excellent' WHEN v >= 65 THEN 'good' WHEN v >= 40 THEN 'average' ELSE 'poor' END;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER safety_scores_recalc
  BEFORE INSERT OR UPDATE ON public.hostel_safety_scores
  FOR EACH ROW EXECUTE FUNCTION public.recalc_safety_score();

-- 6. Recalculate owner trust when bookings or complaints change
CREATE OR REPLACE FUNCTION public.recalc_trust_from_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.recalc_owner_trust(COALESCE(NEW.owner_id, OLD.owner_id));
  RETURN NULL;
END;
$$;

CREATE TRIGGER bookings_recalc_trust
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.recalc_trust_from_activity();

CREATE TRIGGER complaints_recalc_trust
  AFTER INSERT OR UPDATE OR DELETE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.recalc_trust_from_activity();

REVOKE EXECUTE ON FUNCTION public.recalc_owner_trust(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_hostel_rating() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_safety_score() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_trust_from_activity() FROM anon, authenticated;