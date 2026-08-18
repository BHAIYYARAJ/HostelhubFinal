import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export interface ChatConversation {
  id: string;
  student_id: string;
  owner_id: string;
  hostel_id: string;
  created_at: string;
  updated_at: string;
  hostel?: { id: string; name: string; city: string; images: string[] } | null;
  student?: { id: string; full_name: string | null; avatar_url: string | null; email: string | null } | null;
  owner?: { id: string; full_name: string | null; avatar_url: string | null; email: string | null } | null;
  last_message?: ChatMessage | null;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  hostel_id: string | null;
  content: string;
  image_url?: string | null;
  image_path?: string | null;
  is_read: boolean;
  created_at: string;
}

async function hydrateConversations(rows: any[], viewerId: string): Promise<ChatConversation[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));
  const ownerIds = Array.from(new Set(rows.map((r) => r.owner_id)));
  const [messagesResult, studentsResult, ownersResult] = await Promise.all([
    supabase.from("messages").select("*").in("conversation_id", ids).order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, avatar_url, email").in("id", studentIds),
    supabase.from("profiles").select("id, full_name, avatar_url, email").in("id", ownerIds),
  ]);

  const messages = (messagesResult.data ?? []) as unknown as ChatMessage[];
  const studentMap = new Map((studentsResult.data ?? []).map((p: any) => [p.id, p]));
  const ownerMap = new Map((ownersResult.data ?? []).map((p: any) => [p.id, p]));
  const latest = new Map<string, ChatMessage>();
  const unread = new Map<string, number>();
  for (const message of messages) {
    if (!latest.has(message.conversation_id)) latest.set(message.conversation_id, message);
    if (message.receiver_id === viewerId && !message.is_read) unread.set(message.conversation_id, (unread.get(message.conversation_id) ?? 0) + 1);
  }

  return rows.map((row) => ({
    ...row,
    student: studentMap.get(row.student_id) ?? null,
    owner: ownerMap.get(row.owner_id) ?? null,
    last_message: latest.get(row.id) ?? null,
    unread_count: unread.get(row.id) ?? 0,
  }));
}

export function useChatConversations(role: "student" | "owner") {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const key = ["chat-conversations", role, user?.id];

  const query = useQuery({
    queryKey: key,
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const column = role === "student" ? "student_id" : "owner_id";
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("id, student_id, owner_id, hostel_id, created_at, updated_at, hostel:hostels(id, name, city, images)")
        .eq(column, user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return hydrateConversations(data ?? [], user.id);
    },
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`chat-conversations-${role}-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => {
        queryClient.invalidateQueries({ queryKey: key });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: key });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: key });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [role, user?.id, queryClient]);

  return query;
}

export function useChatConversation(conversationId: string | undefined) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const key = ["chat-conversation", conversationId];

  const query = useQuery({
    queryKey: key,
    enabled: !!conversationId && !!user?.id,
    queryFn: async () => {
      if (!conversationId) return null;
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("id, student_id, owner_id, hostel_id, created_at, updated_at, hostel:hostels(id, name, city, images)")
        .eq("id", conversationId)
        .single();
      if (error) throw error;
      return data as unknown as ChatConversation;
    },
  });

  const messagesQuery = useQuery({
    queryKey: [...key, "messages"],
    enabled: !!conversationId && !!user?.id,
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ChatMessage[];
    },
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-conversation-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: [...key, "messages"] });
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: [...key, "messages"] });
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  useEffect(() => {
    const unread = (messagesQuery.data ?? []).filter((m) => m.receiver_id === user?.id && !m.is_read);
    if (!unread.length) return;
    supabase.from("messages").update({ is_read: true }).in("id", unread.map((m) => m.id)).then(() => {
      queryClient.invalidateQueries({ queryKey: [...key, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    });
  }, [messagesQuery.data, user?.id, queryClient]);

  const sendMessage = useCallback(async (content: string, imageUrl?: string | null, imagePath?: string | null) => {
    if (!user?.id || !conversationId || !content.trim() && !imageUrl) return;
    const conversation = query.data;
    if (!conversation) return;
    const receiverId = user.id === conversation.student_id ? conversation.owner_id : conversation.student_id;
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: receiverId,
      hostel_id: conversation.hostel_id,
      content: content.trim(),
      image_url: imageUrl || null,
      image_path: imagePath || null,
    } as any);
    if (error) throw error;
  }, [conversationId, query.data, user?.id]);

  return useMemo(() => ({ conversation: query.data ?? null, messages: messagesQuery.data ?? [], loading: query.isLoading || messagesQuery.isLoading, sendMessage }), [query.data, messagesQuery.data, query.isLoading, messagesQuery.isLoading, sendMessage]);
}

export function useCreateChatConversation() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  return useCallback(async (hostelId: string, ownerId: string) => {
    if (!user?.id) throw new Error("Please sign in to chat");
    if (user.id === ownerId) throw new Error("You cannot chat with yourself");
    const { data: existing, error: existingError } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("student_id", user.id)
      .eq("owner_id", ownerId)
      .eq("hostel_id", hostelId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing?.id) return existing.id as string;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ student_id: user.id, owner_id: ownerId, hostel_id: hostelId } as any)
      .select("id")
      .single();
    if (error) {
      // Another tab/device may have created the unique conversation concurrently.
      const { data: retry } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("student_id", user.id)
        .eq("owner_id", ownerId)
        .eq("hostel_id", hostelId)
        .maybeSingle();
      if (retry?.id) return retry.id as string;
      throw error;
    }
    queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    return data.id as string;
  }, [user?.id, queryClient]);
}
