-- Dedicated student <-> owner chat conversations.
-- This is intentionally separate from inquiries.
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chat_conversations_student_owner_hostel_key UNIQUE (student_id, owner_id, hostel_id),
  CONSTRAINT chat_conversations_not_self CHECK (student_id <> owner_id)
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chat_conversations_student ON public.chat_conversations(student_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_owner ON public.chat_conversations(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_hostel ON public.chat_conversations(hostel_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat participants can read conversations" ON public.chat_conversations;
CREATE POLICY "chat participants can read conversations"
ON public.chat_conversations FOR SELECT TO authenticated
USING (
  auth.uid() = student_id
  OR auth.uid() = owner_id
);

DROP POLICY IF EXISTS "students can create owner conversations" ON public.chat_conversations;
CREATE POLICY "students can create owner conversations"
ON public.chat_conversations FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'student')
  AND owner_id = (SELECT h.owner_id FROM public.hostels h WHERE h.id = hostel_id)
  AND owner_id IS NOT NULL
);

DROP POLICY IF EXISTS "participants can update conversations" ON public.chat_conversations;
CREATE POLICY "participants can update conversations"
ON public.chat_conversations FOR UPDATE TO authenticated
USING (auth.uid() = student_id OR auth.uid() = owner_id)
WITH CHECK (auth.uid() = student_id OR auth.uid() = owner_id);

-- Tighten dedicated-message access while preserving legacy messages that have no conversation_id.
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
CREATE POLICY "Users can read own messages"
ON public.messages FOR SELECT TO authenticated
USING (
  (conversation_id IS NULL AND (auth.uid() = sender_id OR auth.uid() = receiver_id))
  OR
  (conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = messages.conversation_id
      AND (auth.uid() = c.student_id OR auth.uid() = c.owner_id)
  ))
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (
    conversation_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.student_id OR auth.uid() = c.owner_id)
        AND receiver_id = CASE WHEN auth.uid() = c.student_id THEN c.owner_id ELSE c.student_id END
        AND hostel_id = c.hostel_id
    )
  )
);

DROP POLICY IF EXISTS "Users can update own received messages" ON public.messages;
CREATE POLICY "Users can update own received messages"
ON public.messages FOR UPDATE TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

CREATE OR REPLACE FUNCTION public.touch_chat_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.chat_conversations
    SET updated_at = COALESCE(NEW.created_at, now())
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_touch_chat_conversation ON public.messages;
CREATE TRIGGER messages_touch_chat_conversation
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.touch_chat_conversation();

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
