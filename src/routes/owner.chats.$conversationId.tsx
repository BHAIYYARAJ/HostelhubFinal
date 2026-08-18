import { createFileRoute } from "@tanstack/react-router";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import DedicatedChatView from "@/components/chat/DedicatedChatView";
import { useParams } from "@/lib/router-compat";
import OwnerDashboard from "@/components/desktop/OwnerDashboard";

export const Route = createFileRoute("/owner/chats/$conversationId")({ component: Page });
function Page() { const { conversationId } = useParams<{ conversationId: string }>(); return <MobileGate mobile={<MobileShell variant="owner"><DedicatedChatView conversationId={conversationId} mobile /></MobileShell>} desktop={<OwnerChatDesktop conversationId={conversationId} />} />; }
function OwnerChatDesktop({ conversationId }: { conversationId: string }) { return <OwnerDashboard initialTab="chats" conversationId={conversationId} />; }
