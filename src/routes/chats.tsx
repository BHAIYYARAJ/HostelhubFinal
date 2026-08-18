import { createFileRoute } from "@tanstack/react-router";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import StudentChats from "@/components/desktop/StudentChats";
import { StudentChatsScreen } from "@/components/mobile/screens/StudentChatsScreen";

export const Route = createFileRoute("/chats")({ component: Page });
function Page() { return <MobileGate mobile={<MobileShell variant="student"><StudentChatsScreen /></MobileShell>} desktop={<StudentChats />} />; }
