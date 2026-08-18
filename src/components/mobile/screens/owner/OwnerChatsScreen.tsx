import { MessageCircle } from "lucide-react";
import { AppHeader } from "@/components/mobile/AppHeader";
import { AppScreen, ScreenSection } from "@/components/mobile/AppScreen";
import { AppButton, EmptyState } from "@/components/mobile/MobileKit";
import ConversationList from "@/components/chat/ConversationList";
import { useChatConversations } from "@/hooks/useConversations";
import { useAuthStore } from "@/store/useAuthStore";

export function OwnerChatsScreen() {
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading } = useChatConversations("owner");
  return <AppScreen><AppHeader title="Chats" subtitle="Conversations with students" back />{!user ? <EmptyState icon={MessageCircle} title="Sign in as an owner" body="Your student conversations will appear here." action={<AppButton to="/login">Sign in</AppButton>} /> : <ScreenSection className="pb-8">{isLoading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading chats...</p> : <ConversationList conversations={data} role="owner" />}</ScreenSection>}</AppScreen>;
}
