CREATE TABLE public.assistant_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX assistant_messages_user_created_idx ON public.assistant_messages(user_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.assistant_messages TO authenticated;
GRANT ALL ON public.assistant_messages TO service_role;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own" ON public.assistant_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own" ON public.assistant_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own" ON public.assistant_messages FOR DELETE USING (auth.uid() = user_id);