import { createFileRoute } from "@tanstack/react-router";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import DedicatedChatView from "@/components/chat/DedicatedChatView";
import { useParams } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";

export const Route = createFileRoute("/chats/$conversationId")({ component: Page });
function Page() { const { conversationId } = useParams<{ conversationId: string }>(); return <MobileGate mobile={<MobileShell variant="student"><DedicatedChatView conversationId={conversationId} mobile /></MobileShell>} desktop={<><Navbar /><main className="container py-6"><DedicatedChatView conversationId={conversationId} /></main></>} />; }
