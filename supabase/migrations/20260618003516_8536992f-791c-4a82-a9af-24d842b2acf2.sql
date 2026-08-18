-- Enums
CREATE TYPE public.complaint_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE public.complaint_category AS ENUM ('maintenance','cleanliness','safety','billing','other');
CREATE TYPE public.agreement_status AS ENUM ('draft','sent','signed','cancelled');

-- Complaints
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  category public.complaint_category NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'open',
  owner_response text,
  responded_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own complaints" ON public.complaints
  FOR SELECT TO authenticated USING (auth.uid() = student_id OR auth.uid() = owner_id);
CREATE POLICY "Students create complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students update own complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Owners respond to complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Students delete own complaints" ON public.complaints
  FOR DELETE TO authenticated USING (auth.uid() = student_id);

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Rental Agreements
CREATE TABLE public.rental_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  student_id uuid NOT NULL,
  student_name text NOT NULL,
  student_email text,
  student_phone text,
  monthly_rent numeric NOT NULL,
  security_deposit numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  terms text NOT NULL,
  status public.agreement_status NOT NULL DEFAULT 'draft',
  student_signature text,
  student_signed_at timestamptz,
  student_signed_ip text,
  owner_signature text,
  owner_signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_agreements TO authenticated;
GRANT ALL ON public.rental_agreements TO service_role;
ALTER TABLE public.rental_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties view agreement" ON public.rental_agreements
  FOR SELECT TO authenticated USING (auth.uid() = owner_id OR auth.uid() = student_id);
CREATE POLICY "Owner creates agreement" ON public.rental_agreements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner updates agreement" ON public.rental_agreements
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Student signs agreement" ON public.rental_agreements
  FOR UPDATE TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Owner deletes agreement" ON public.rental_agreements
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER update_rental_agreements_updated_at
  BEFORE UPDATE ON public.rental_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_agreements;