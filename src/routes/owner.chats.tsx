import { createFileRoute } from "@tanstack/react-router";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import OwnerDashboard from "@/components/desktop/OwnerDashboard";
import { OwnerChatsScreen } from "@/components/mobile/screens/owner/OwnerChatsScreen";

export const Route = createFileRoute("/owner/chats")({ component: Page });
function Page() { return <MobileGate mobile={<MobileShell variant="owner"><OwnerChatsScreen /></MobileShell>} desktop={<OwnerDashboard initialTab="chats" />} />; }
