
-- Extend profiles with owner-trust columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS response_rate integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_response_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS owner_rating numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS owner_review_count integer NOT NULL DEFAULT 0;

-- Backfill email from auth.users for existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Update handle_new_user to capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));

  RETURN NEW;
END;
$function$;

-- Add image attachment to chat messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS image_url text;

-- Inquiry status enum
DO $$ BEGIN
  CREATE TYPE public.inquiry_status AS ENUM ('pending', 'replied', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Inquiries table (student -> owner pre-booking questions)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  reply text,
  status public.inquiry_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students create own inquiries"
  ON public.inquiries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Participants view inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = owner_id);

CREATE POLICY "Owners update inquiries"
  ON public.inquiries FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = student_id)
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = student_id);

CREATE POLICY "Students delete own inquiries"
  ON public.inquiries FOR DELETE TO authenticated
  USING (auth.uid() = student_id);

CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
