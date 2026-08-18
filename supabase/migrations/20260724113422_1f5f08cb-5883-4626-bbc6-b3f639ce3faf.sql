
-- APHR Smart Recommendations schema

-- 1. student_preferences
CREATE TABLE public.student_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_min numeric NOT NULL DEFAULT 0,
  budget_max numeric NOT NULL DEFAULT 20000,
  preferred_distance_km numeric NOT NULL DEFAULT 5,
  room_type text NOT NULL DEFAULT 'any',
  food_preference text NOT NULL DEFAULT 'any',
  wifi_required boolean NOT NULL DEFAULT false,
  laundry_required boolean NOT NULL DEFAULT false,
  parking_required boolean NOT NULL DEFAULT false,
  study_environment text NOT NULL DEFAULT 'any',
  gender_preference text NOT NULL DEFAULT 'any',
  sharing_preference text NOT NULL DEFAULT 'any',
  importance_safety int NOT NULL DEFAULT 3 CHECK (importance_safety BETWEEN 1 AND 5),
  importance_budget int NOT NULL DEFAULT 3 CHECK (importance_budget BETWEEN 1 AND 5),
  importance_distance int NOT NULL DEFAULT 3 CHECK (importance_distance BETWEEN 1 AND 5),
  importance_facility int NOT NULL DEFAULT 3 CHECK (importance_facility BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_preferences TO authenticated;
GRANT ALL ON public.student_preferences TO service_role;
ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students manage own prefs" ON public.student_preferences FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE TRIGGER trg_student_preferences_updated BEFORE UPDATE ON public.student_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. hostel_safety_scores
CREATE TABLE public.hostel_safety_scores (
  hostel_id uuid PRIMARY KEY REFERENCES public.hostels(id) ON DELETE CASCADE,
  has_cctv boolean NOT NULL DEFAULT false,
  has_security_guard boolean NOT NULL DEFAULT false,
  has_fire_safety boolean NOT NULL DEFAULT false,
  nearby_hospital boolean NOT NULL DEFAULT false,
  nearby_police boolean NOT NULL DEFAULT false,
  score numeric NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'average',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hostel_safety_scores TO authenticated, anon;
GRANT ALL ON public.hostel_safety_scores TO service_role;
ALTER TABLE public.hostel_safety_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safety readable" ON public.hostel_safety_scores FOR SELECT USING (true);
CREATE POLICY "owner manages own hostel safety" ON public.hostel_safety_scores FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()));
CREATE TRIGGER trg_hostel_safety_scores_updated BEFORE UPDATE ON public.hostel_safety_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. owner_trust_scores
CREATE TABLE public.owner_trust_scores (
  owner_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  verified boolean NOT NULL DEFAULT false,
  avg_rating numeric NOT NULL DEFAULT 0,
  complaints_count int NOT NULL DEFAULT 0,
  bookings_completed int NOT NULL DEFAULT 0,
  response_minutes numeric NOT NULL DEFAULT 0,
  months_on_platform int NOT NULL DEFAULT 0,
  score numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.owner_trust_scores TO authenticated, anon;
GRANT ALL ON public.owner_trust_scores TO service_role;
ALTER TABLE public.owner_trust_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trust readable" ON public.owner_trust_scores FOR SELECT USING (true);
CREATE TRIGGER trg_owner_trust_scores_updated BEFORE UPDATE ON public.owner_trust_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. recommendation_scores (cache)
CREATE TABLE public.recommendation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  overall numeric NOT NULL,
  sub_scores jsonb NOT NULL DEFAULT '{}',
  weights jsonb NOT NULL DEFAULT '{}',
  confidence numeric NOT NULL DEFAULT 0,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, hostel_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_scores TO authenticated;
GRANT ALL ON public.recommendation_scores TO service_role;
ALTER TABLE public.recommendation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student rw own scores" ON public.recommendation_scores FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- 5. recommendation_history
CREATE TABLE public.recommendation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_snapshot jsonb NOT NULL DEFAULT '{}',
  recommended_hostels jsonb NOT NULL DEFAULT '[]',
  selected_hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  booked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.recommendation_history TO authenticated;
GRANT ALL ON public.recommendation_history TO service_role;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student rw own history" ON public.recommendation_history FOR ALL TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- 6. recommendation_feedback
CREATE TABLE public.recommendation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('viewed','saved','compared','booked','dismissed','clicked')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.recommendation_feedback TO authenticated;
GRANT ALL ON public.recommendation_feedback TO service_role;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student inserts own feedback" ON public.recommendation_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "student reads own feedback" ON public.recommendation_feedback FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE INDEX idx_rec_scores_student ON public.recommendation_scores(student_id);
CREATE INDEX idx_rec_history_student ON public.recommendation_history(student_id);
CREATE INDEX idx_rec_feedback_student ON public.recommendation_feedback(student_id);
