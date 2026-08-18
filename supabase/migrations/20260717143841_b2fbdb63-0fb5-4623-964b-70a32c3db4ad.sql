
-- 1) Move has_role() into a private schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins update requests" ON public.verification_requests;
CREATE POLICY "Admins update requests" ON public.verification_requests
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Owners view own requests" ON public.verification_requests;
CREATE POLICY "Owners view own requests" ON public.verification_requests
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Owners read own verification docs" ON storage.objects;
CREATE POLICY "Owners read own verification docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'verification-docs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR private.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 2) user_roles hardening
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert own student role"
  ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'student'::public.app_role);

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role public.app_role;
  safe_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  BEGIN
    requested_role := (NEW.raw_user_meta_data->>'role')::public.app_role;
  EXCEPTION WHEN others THEN
    requested_role := 'student'::public.app_role;
  END;

  safe_role := CASE
    WHEN requested_role = 'owner'::public.app_role THEN 'owner'::public.app_role
    ELSE 'student'::public.app_role
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, safe_role);

  RETURN NEW;
END;
$$;

-- 3) profiles: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Authenticated can view profiles"
  ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4) hostels.upi_id: move to a separate authenticated-only table
CREATE TABLE IF NOT EXISTS public.hostel_upi (
  hostel_id uuid PRIMARY KEY REFERENCES public.hostels(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  upi_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hostel_upi TO authenticated;
GRANT ALL ON public.hostel_upi TO service_role;

ALTER TABLE public.hostel_upi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read hostel upi"
  ON public.hostel_upi FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner insert hostel upi"
  ON public.hostel_upi FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid())
  );

CREATE POLICY "Owner update hostel upi"
  ON public.hostel_upi FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner delete hostel upi"
  ON public.hostel_upi FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE TRIGGER trg_hostel_upi_updated_at
  BEFORE UPDATE ON public.hostel_upi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hostel_upi (hostel_id, owner_id, upi_id)
SELECT h.id, h.owner_id, h.upi_id
FROM public.hostels h
WHERE h.upi_id IS NOT NULL AND h.owner_id IS NOT NULL
ON CONFLICT (hostel_id) DO NOTHING;

ALTER TABLE public.hostels DROP COLUMN IF EXISTS upi_id;

-- 5) Storage bucket hardening
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view hostel images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload hostel images" ON storage.objects;
CREATE POLICY "Owners upload hostel images into own folder"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'hostel-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated view chat images" ON storage.objects;
CREATE POLICY "Chat participants view chat images"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.messages m
        WHERE m.image_url LIKE '%' || storage.objects.name
          AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
      )
    )
  );
