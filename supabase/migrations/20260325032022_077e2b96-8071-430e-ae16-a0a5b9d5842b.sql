
-- Hostels table
CREATE TABLE public.hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  price integer NOT NULL,
  rating numeric(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  distance_from_college text DEFAULT 'N/A',
  images text[] DEFAULT '{}',
  facilities text[] DEFAULT '{}',
  type text NOT NULL DEFAULT 'co-ed',
  occupancy text DEFAULT 'Double',
  description text DEFAULT '',
  owner_name text DEFAULT '',
  rules text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  views integer DEFAULT 0,
  bookings integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view hostels" ON public.hostels
  FOR SELECT USING (true);

-- Owners can insert their own
CREATE POLICY "Owners can insert own hostels" ON public.hostels
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own
CREATE POLICY "Owners can update own hostels" ON public.hostels
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

-- Owners can delete their own
CREATE POLICY "Owners can delete own hostels" ON public.hostels
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.hostels;

-- Seed mock hostels (system listings, no owner_id)
INSERT INTO public.hostels (name, location, city, price, rating, review_count, distance_from_college, images, facilities, type, occupancy, description, owner_name, rules, is_featured) VALUES
('Sunrise Student Haven', 'Koramangala, Near Christ University', 'Bangalore', 8500, 4.7, 124, '0.3 km',
 ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
 ARRAY['WiFi','AC','Laundry','Mess','Gym','Power Backup'], 'co-ed', 'Single / Double',
 'A premium student accommodation with modern amenities, located just steps from Christ University.', 'Rajesh Mehta',
 ARRAY['No smoking','Gate closes at 10 PM','Visitors allowed till 8 PM'], true),

('Campus Edge PG', 'Hinjewadi, Near Symbiosis', 'Pune', 7200, 4.4, 89, '0.8 km',
 ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
 ARRAY['WiFi','Mess','Laundry','Study Room','CCTV'], 'boys', 'Double / Triple',
 'Affordable and comfortable PG for male students near Symbiosis University.', 'Anita Sharma',
 ARRAY['No alcohol','Quiet hours after 10 PM','ID required for entry'], false),

('Greenfield Residency', 'Powai, Near IIT Bombay', 'Mumbai', 12000, 4.8, 203, '1.2 km',
 ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
 ARRAY['WiFi','AC','Gym','Swimming Pool','Mess','Parking'], 'co-ed', 'Single',
 'Premium living near IIT Bombay with world-class amenities.', 'Vikram Patel',
 ARRAY['No pets','Maintenance fee applies','Monthly rent due by 5th'], true),

('Scholar''s Nest', 'Anna Nagar, Near Anna University', 'Chennai', 6800, 4.3, 67, '0.5 km',
 ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
 ARRAY['WiFi','Mess','Power Backup','Water Purifier'], 'girls', 'Double / Triple',
 'Safe and secure accommodation for female students near Anna University.', 'Lakshmi Sundaram',
 ARRAY['Vegetarian only','No late entry after 9 PM','Parents can visit anytime'], false),

('Urban Loft Hostel', 'Sector 62, Near Amity University', 'Noida', 9500, 4.6, 156, '0.2 km',
 ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
 ARRAY['WiFi','AC','Laundry','Mess','Gaming Zone','Terrace'], 'co-ed', 'Single / Double',
 'Modern hostel with a startup vibe. Co-working spaces and gaming zone.', 'Arjun Kapoor',
 ARRAY['No damage to property','Guests must register','Quiet hours 11 PM–6 AM'], true),

('Maple House PG', 'Jayanagar, Near PES University', 'Bangalore', 7800, 4.5, 92, '0.6 km',
 ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'],
 ARRAY['WiFi','Mess','Laundry','Study Room','Power Backup','CCTV'], 'boys', 'Double',
 'Well-maintained PG with a focus on academics.', 'Suresh Kumar',
 ARRAY['No smoking','Study hours 7–9 PM','Keep rooms clean'], false),

('Horizon Student Living', 'Baner, Near MIT Pune', 'Pune', 10500, 4.9, 278, '0.4 km',
 ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
 ARRAY['WiFi','AC','Gym','Mess','Laundry','Study Room','Parking'], 'co-ed', 'Single / Double',
 'Top-rated student residence near MIT Pune.', 'Priya Deshmukh',
 ARRAY['Respect common areas','No loud music after 10 PM','Rent due by 1st'], true),

('Nest Inn PG', 'Salt Lake, Near Jadavpur University', 'Kolkata', 5500, 4.1, 45, '1.5 km',
 ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800','https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
 ARRAY['WiFi','Mess','Water Purifier','Power Backup'], 'girls', 'Triple',
 'Budget-friendly accommodation for female students in Kolkata.', 'Debjani Roy',
 ARRAY['Strictly vegetarian on Tuesdays','Gate closes at 9:30 PM','No overnight guests'], false);
