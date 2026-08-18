import { MessageCircle } from "lucide-react";
import { Navigate } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConversationList from "@/components/chat/ConversationList";
import { useChatConversations } from "@/hooks/useConversations";
import { useAuthStore } from "@/store/useAuthStore";

export default function StudentChats() {
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading } = useChatConversations("student");
  if (!user) return <Navigate to="/login" replace />;
  return <div className="min-h-screen bg-background"><Navbar /><main className="container py-8"><div className="mb-6 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><MessageCircle /></div><div><h1 className="text-2xl font-bold">Chats</h1><p className="text-sm text-muted-foreground">Your conversations with hostel owners</p></div></div>{isLoading ? <div className="py-16 text-center text-sm text-muted-foreground">Loading chats...</div> : <ConversationList conversations={data} role="student" />}</main><Footer /></div>;
}
