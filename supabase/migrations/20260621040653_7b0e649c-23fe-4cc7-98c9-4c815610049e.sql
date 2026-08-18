
-- Add room availability to hostels
ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS total_rooms integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS available_rooms integer NOT NULL DEFAULT 10;

-- Bookings status enum
DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  student_name text NOT NULL,
  student_email text,
  student_phone text,
  room_type text NOT NULL DEFAULT 'Single',
  move_in_date date NOT NULL,
  monthly_rent numeric NOT NULL,
  notes text,
  status public.booking_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Owners can view bookings for their hostels"
  ON public.bookings FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Students can create their bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can cancel own pending bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Owners can update bookings for their hostels"
  ON public.bookings FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- updated_at trigger
DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Room availability adjustment
CREATE OR REPLACE FUNCTION public.apply_booking_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
      UPDATE public.hostels
        SET available_rooms = GREATEST(available_rooms - 1, 0),
            bookings = COALESCE(bookings, 0) + 1
        WHERE id = NEW.hostel_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status IS DISTINCT FROM 'confirmed' THEN
      UPDATE public.hostels
        SET available_rooms = LEAST(available_rooms + 1, total_rooms)
        WHERE id = NEW.hostel_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_availability ON public.bookings;
CREATE TRIGGER bookings_availability AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.apply_booking_availability();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
