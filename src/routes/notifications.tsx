import { createFileRoute } from "@tanstack/react-router";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { NotificationsScreen } from "@/components/mobile/screens/NotificationsScreen";
import Notifications from "@/components/desktop/Notifications";
export const Route = createFileRoute("/notifications")({ component: Page });
function Page() { return <MobileGate mobile={<MobileShell variant="student"><NotificationsScreen /></MobileShell>} desktop={<Notifications />} />; }
