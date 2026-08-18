-- Harden the dedicated Student <-> Owner chat system.
-- Conversations are immutable after creation; only messages change over time.
DROP POLICY IF EXISTS "participants can update conversations" ON public.chat_conversations;

-- A participant may mark a message they received as read, but may not edit
-- message ownership, recipient, content, hostel, or conversation metadata.
DROP POLICY IF EXISTS "Users can update own received messages" ON public.messages;
CREATE POLICY "Users can mark received messages as read"
ON public.messages FOR UPDATE TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

CREATE OR REPLACE FUNCTION public.protect_chat_message_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.receiver_id THEN
    IF NEW.id <> OLD.id
      OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
      OR NEW.sender_id <> OLD.sender_id
      OR NEW.receiver_id <> OLD.receiver_id
      OR NEW.hostel_id IS DISTINCT FROM OLD.hostel_id
      OR NEW.content <> OLD.content
      OR NEW.image_url IS DISTINCT FROM OLD.image_url
      OR NEW.image_path IS DISTINCT FROM OLD.image_path
      OR NEW.created_at <> OLD.created_at
      OR NEW.is_read IS DISTINCT FROM OLD.is_read AND NEW.is_read IS NOT TRUE
    THEN
      RAISE EXCEPTION 'Chat messages can only be marked as read by the recipient';
    END IF;
  ELSE
    RAISE EXCEPTION 'Only the message recipient can update read state';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_chat_message_updates ON public.messages;
CREATE TRIGGER protect_chat_message_updates
BEFORE UPDATE ON public.messages
FOR EACH ROW
WHEN (OLD.conversation_id IS NOT NULL)
EXECUTE FUNCTION public.protect_chat_message_updates();
