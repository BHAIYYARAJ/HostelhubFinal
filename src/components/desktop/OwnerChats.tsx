import { MessageCircle } from "lucide-react";
import ConversationList from "@/components/chat/ConversationList";
import { useChatConversations } from "@/hooks/useConversations";

export default function OwnerChats() {
  const { data = [], isLoading } = useChatConversations("owner");
  return <div className="space-y-5"><div><h2 className="text-xl font-bold text-foreground">Chats</h2><p className="text-sm text-muted-foreground">Private conversations with students about your hostels.</p></div>{isLoading ? <div className="py-16 text-center text-sm text-muted-foreground">Loading chats...</div> : <ConversationList conversations={data} role="owner" />}</div>;
}
