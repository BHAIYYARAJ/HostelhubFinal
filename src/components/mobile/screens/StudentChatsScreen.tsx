import { MessageCircle } from "lucide-react";
import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { EmptyState } from "@/components/mobile/MobileKit";
import ConversationList from "@/components/chat/ConversationList";
import { useChatConversations } from "@/hooks/useConversations";
import { useAuthStore } from "@/store/useAuthStore";

export function StudentChatsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading } = useChatConversations("student");
  return <AppScreen><AppHeader title="Chats" subtitle="Conversations with owners" />{!user ? <EmptyState icon={MessageCircle} title="Sign in to chat" body="Your conversations will appear here." /> : <ScreenSection className="pb-8">{isLoading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading chats...</p> : <ConversationList conversations={data} role="student" />}</ScreenSection>}</AppScreen>;
}
